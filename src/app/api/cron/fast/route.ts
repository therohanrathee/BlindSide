import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPhotoRevealEmail } from "@/lib/services/email";

// Helper to calculate age
function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Helper for degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Helper to compute distance in km using Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Security check for production Vercel cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isLocal = process.env.NODE_ENV === "development" || !cronSecret;

    if (!isLocal && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    console.log("Starting BlindSide fast cron (matching + photo reveal)...");

    // 1. Fetch active match requests
    const { data: activeReqs, error: fetchReqError } = await supabase
      .from("match_requests")
      .select(`
        *,
        user:users (
          id,
          gender,
          date_of_birth,
          height_cm,
          university_id,
          latitude,
          longitude,
          first_name,
          last_name,
          is_suspended,
          universities (
            city
          ),
          profiles (
            hobbies,
            relationship_intent,
            dietary,
            drinking,
            smoking,
            fitness,
            photo_url
          )
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (fetchReqError) {
      console.error("Error fetching active match requests:", fetchReqError);
      return NextResponse.json(
        { message: "Failed to fetch active requests." },
        { status: 500 }
      );
    }

    console.log(`Fetched ${activeReqs?.length || 0} active match requests.`);

    let matchedCount = 0;
    const matchedRequestIds = new Set<string>();

    if (activeReqs && activeReqs.length > 0) {
      for (let i = 0; i < activeReqs.length; i++) {
        const reqA = activeReqs[i];

        // Skip if this request got matched in this run
        if (matchedRequestIds.has(reqA.id)) continue;

        const userA = reqA.user as any;
        if (!userA || userA.is_suspended) continue;

        const profileA = userA.profiles?.[0] || userA.profiles;
        const ageA = userA.date_of_birth ? calculateAge(userA.date_of_birth) : 0;
        const heightA = userA.height_cm ? parseFloat(userA.height_cm) : 0;

        // Fetch user A's previous matches to prevent duplicates
        const { data: pastMatchesA } = await supabase
          .from("matches")
          .select("user_a_id, user_b_id")
          .or(`user_a_id.eq.${reqA.user_id},user_b_id.eq.${reqA.user_id}`);

        const matchedUserIdsA = new Set(
          pastMatchesA?.map(m => (m.user_a_id === reqA.user_id ? m.user_b_id : m.user_a_id)) || []
        );

        // Fetch user A's blocks
        const { data: blocksA } = await supabase
          .from("user_blocks")
          .select("blocker_id, blocked_id")
          .or(`blocker_id.eq.${reqA.user_id},blocked_id.eq.${reqA.user_id}`);

        const blockedUserIdsA = new Set(
          blocksA?.map(b => (b.blocker_id === reqA.user_id ? b.blocked_id : b.blocker_id)) || []
        );

        let bestCandidate: any = null;
        let bestScore = -1;

        // Find match candidates from remaining requests
        for (let j = 0; j < activeReqs.length; j++) {
          const reqB = activeReqs[j];

          // Skip self or already matched/suspicious requests
          if (reqB.id === reqA.id) continue;
          if (matchedRequestIds.has(reqB.id)) continue;
          if (reqB.user_id === reqA.user_id) continue;

          const userB = reqB.user as any;
          if (!userB || userB.is_suspended) continue;

          const profileB = userB.profiles?.[0] || userB.profiles;

          // --- 1. HARD FILTERS ---

          // Filter 1: Gender preference match (bidirectional)
          const genderPrefMatchA =
            reqA.pref_gender === "everyone" || reqA.pref_gender === userB.gender;
          const genderPrefMatchB =
            reqB.pref_gender === "everyone" || reqB.pref_gender === userA.gender;
          if (!genderPrefMatchA || !genderPrefMatchB) continue;

          // Filter 2: Age range match (bidirectional)
          const ageB = userB.date_of_birth ? calculateAge(userB.date_of_birth) : 0;
          const ageInRangeA = ageB >= reqA.pref_age_min && ageB <= reqA.pref_age_max;
          const ageInRangeB = ageA >= reqB.pref_age_min && ageA <= reqB.pref_age_max;
          if (!ageInRangeA || !ageInRangeB) continue;

          // Filter 3: Height range match (bidirectional - skip if NULL/no preference)
          const heightB = userB.height_cm ? parseFloat(userB.height_cm) : 0;

          if (reqA.pref_height_min_cm !== null && heightB < parseFloat(reqA.pref_height_min_cm)) continue;
          if (reqA.pref_height_max_cm !== null && heightB > parseFloat(reqA.pref_height_max_cm)) continue;
          if (reqB.pref_height_min_cm !== null && heightA < parseFloat(reqB.pref_height_min_cm)) continue;
          if (reqB.pref_height_max_cm !== null && heightA > parseFloat(reqB.pref_height_max_cm)) continue;

          // Filter 4: Relationship intent check
          const intentA = profileA?.relationship_intent;
          const intentB = profileB?.relationship_intent;
          if (
            (intentA === "serious" && intentB === "casual") ||
            (intentA === "casual" && intentB === "serious")
          ) {
            continue;
          }

          // Filter 5: Scope check (bidirectional)
          if (reqA.scope === "university" || reqB.scope === "university") {
            if (userA.university_id !== userB.university_id) continue;
          } else {
            // Both are city-level
            const cityA = userA.universities?.city;
            const cityB = userB.universities?.city;
            if (!cityA || !cityB || cityA !== cityB) continue;
          }

          // Filter 6: Not previously matched
          if (matchedUserIdsA.has(reqB.user_id)) continue;

          // Filter 7: Not blocked
          if (blockedUserIdsA.has(reqB.user_id)) continue;

          // --- 2. SOFT SCORING (0-100) ---

          // 2.1 Hobby Overlap (Max 45 pts)
          const hobbiesA = profileA?.hobbies || [];
          const hobbiesB = profileB?.hobbies || [];
          const setA = new Set(hobbiesA);
          const setB = new Set(hobbiesB);
          const intersection = new Set([...setA].filter(h => setB.has(h)));
          const union = new Set([...setA, ...setB]);
          const jaccard = union.size > 0 ? intersection.size / union.size : 0;
          const hobbyScore = jaccard * 45;

          // 2.2 Lifestyle Match (Max 35 pts)
          let lifestyleScore = 0;
          const pointsPerCategory = 8.75; // 35 / 4

          if (profileA && profileB) {
            // Dietary
            const matchDietary = (pref: string, actual: string) => {
              if (pref === "no_preference") return true;
              if (pref === "vegan") return actual === "vegan";
              if (pref === "veg") return actual === "veg" || actual === "vegan" || actual === "eggetarian";
              if (pref === "nonveg") return true; // nonveg matches all
              return false;
            };
            const dietaryMatchA = matchDietary(reqA.pref_dietary, profileB.dietary);
            const dietaryMatchB = matchDietary(reqB.pref_dietary, profileA.dietary);
            if (dietaryMatchA && dietaryMatchB) {
              lifestyleScore += pointsPerCategory;
            }

            // Drinking
            const matchDrinking = (pref: string, actual: string) => {
              if (pref === "no_preference") return true;
              if (pref === "yes") return actual === "occasionally" || actual === "socially" || actual === "regularly" || actual === "yes" || actual === "sometimes";
              if (pref === "no") return actual === "sober" || actual === "no";
              return false;
            };
            if (
              matchDrinking(reqA.pref_drinking, profileB.drinking) &&
              matchDrinking(reqB.pref_drinking, profileA.drinking)
            ) {
              lifestyleScore += pointsPerCategory;
            }

            // Smoking
            const matchSmoking = (pref: string, actual: string) => {
              if (pref === "no_preference") return true;
              if (pref === "yes") return actual === "occasionally" || actual === "socially" || actual === "regularly" || actual === "yes" || actual === "sometimes";
              if (pref === "no") return actual === "non_smoker" || actual === "no";
              return false;
            };
            if (
              matchSmoking(reqA.pref_smoking, profileB.smoking) &&
              matchSmoking(reqB.pref_smoking, profileA.smoking)
            ) {
              lifestyleScore += pointsPerCategory;
            }

            // Fitness
            const fitnessLevels: Record<string, number> = {
              not_active: 0,
              occasionally: 1,
              active: 2,
              gym_rat: 3,
            };
            const levelA = fitnessLevels[profileA.fitness] ?? 0;
            const levelB = fitnessLevels[profileB.fitness] ?? 0;
            const distance = Math.abs(levelA - levelB);

            if (distance === 0) {
              lifestyleScore += 8.75;
            } else if (distance === 1) {
              lifestyleScore += 6.125;
            } else if (distance === 2) {
              lifestyleScore += 2.625;
            } else if (distance === 3) {
              lifestyleScore += 0;
            }
          }

          // 2.3 Proximity Bonus (Max 20 pts)
          let proximityScore = 0;
          if (userA.university_id === userB.university_id) {
            proximityScore = 20;
          } else if (
            userA.latitude !== null &&
            userA.longitude !== null &&
            userB.latitude !== null &&
            userB.longitude !== null
          ) {
            const lat1 = parseFloat(userA.latitude);
            const lon1 = parseFloat(userA.longitude);
            const lat2 = parseFloat(userB.latitude);
            const lon2 = parseFloat(userB.longitude);
            const d = getDistanceKm(lat1, lon1, lat2, lon2);
            if (d < 5) proximityScore = 20;
            else if (d < 15) proximityScore = 15;
            else if (d < 30) proximityScore = 10;
            else if (d < 50) proximityScore = 5;
            else proximityScore = 0;
          }

          const totalScore = hobbyScore + lifestyleScore + proximityScore;

          // Check if candidate passes the threshold and is the best so far
          if (totalScore >= 55 && totalScore > bestScore) {
            bestScore = totalScore;
            bestCandidate = reqB;
          }
        }

        // Create match if candidate is found
        if (bestCandidate) {
          const reqB = bestCandidate;

          // Atomic updates to ensure requests are not double-matched
          const { data: updateA, error: errA } = await supabase
            .from("match_requests")
            .update({ status: "matched", matched_at: new Date().toISOString() })
            .eq("id", reqA.id)
            .eq("status", "active")
            .select();

          if (errA || !updateA || updateA.length === 0) {
            console.log(`Request A (${reqA.id}) was already matched or canceled. Skipping...`);
            continue;
          }

          const { data: updateB, error: errB } = await supabase
            .from("match_requests")
            .update({ status: "matched", matched_at: new Date().toISOString() })
            .eq("id", reqB.id)
            .eq("status", "active")
            .select();

          if (errB || !updateB || updateB.length === 0) {
            console.log(`Request B (${reqB.id}) was already matched or canceled. Rolling back Request A...`);
            // Rollback Request A back to active
            await supabase
              .from("match_requests")
              .update({ status: "active", matched_at: null })
              .eq("id", reqA.id);
            continue;
          }

          // Both successfully set to matched. Register the match pair!
          const [userAId, userBId] = [reqA.user_id, reqB.user_id].sort();
          const [reqAId, reqBId] = reqA.user_id === userAId ? [reqA.id, reqB.id] : [reqB.id, reqA.id];

          const { data: matchRecord, error: matchInsertError } = await supabase
            .from("matches")
            .insert({
              request_a_id: reqAId,
              request_b_id: reqBId,
              user_a_id: userAId,
              user_b_id: userBId,
              compatibility_score: Math.round(bestScore),
              status: "active",
              chat_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              matched_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (matchInsertError) {
            console.error("Failed to insert match record:", matchInsertError);
            // Rollback both requests back to active
            await supabase
              .from("match_requests")
              .update({ status: "active", matched_at: null })
              .in("id", [reqA.id, reqB.id]);
            continue;
          }

          // Add new matched requests to matched set so they aren't processed again in this loop
          matchedRequestIds.add(reqA.id);
          matchedRequestIds.add(reqB.id);
          matchedCount++;

          console.log(`Matched request ${reqA.id} with ${reqB.id}. Compatibility score: ${Math.round(bestScore)}.`);

          // Insert system message in chat
          await supabase.from("messages").insert({
            match_id: matchRecord.id,
            sender_id: null,
            type: "system",
            content: "🎉 You have been matched! Say hello to your blind date. You have 48 hours to chat and decide if you want to meet.",
          });
        }
      }
    }

    // 2. Photo Reveal check (T-4 hours check)
    console.log("Checking for photo reveals...");
    const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    const { data: datesToReveal, error: revealFetchError } = await supabase
      .from("confirmed_dates")
      .select(`
        id,
        match_id,
        date_time,
        location_text,
        photo_revealed,
        match:matches (
          id,
          user_a_id,
          user_b_id
        )
      `)
      .eq("photo_revealed", false)
      .lte("date_time", fourHoursFromNow);

    let revealCount = 0;

    if (!revealFetchError && datesToReveal && datesToReveal.length > 0) {
      for (const date of datesToReveal) {
        const match = date.match as any;
        if (!match) continue;

        // Fetch details for user A and B
        const { data: userA } = await supabase
          .from("users")
          .select("email, first_name, last_name, profiles(photo_url)")
          .eq("id", match.user_a_id)
          .single();

        const { data: userB } = await supabase
          .from("users")
          .select("email, first_name, last_name, profiles(photo_url)")
          .eq("id", match.user_b_id)
          .single();

        if (userA && userB) {
          const profileA = (userA.profiles as any)?.[0] || (userA.profiles as any);
          const profileB = (userB.profiles as any)?.[0] || (userB.profiles as any);

          let signedUrlA = null;
          let signedUrlB = null;

          if (profileA?.photo_url) {
            const { data: signedData } = await supabase.storage
              .from("photos")
              .createSignedUrl(profileA.photo_url, 60 * 60 * 24 * 7);
            signedUrlA = signedData?.signedUrl || null;
          }

          if (profileB?.photo_url) {
            const { data: signedData } = await supabase.storage
              .from("photos")
              .createSignedUrl(profileB.photo_url, 60 * 60 * 24 * 7);
            signedUrlB = signedData?.signedUrl || null;
          }

          // Send Photo Reveal emails
          await sendPhotoRevealEmail({
            to: userA.email,
            userName: userA.first_name,
            partnerName: userB.first_name,
            partnerPhotoUrl: signedUrlB,
            locationText: date.location_text,
            dateTimeStr: date.date_time,
          });

          await sendPhotoRevealEmail({
            to: userB.email,
            userName: userB.first_name,
            partnerName: userA.first_name,
            partnerPhotoUrl: signedUrlA,
            locationText: date.location_text,
            dateTimeStr: date.date_time,
          });

          // Mark as revealed
          await supabase
            .from("confirmed_dates")
            .update({
              photo_revealed: true,
              reveal_sent_at: new Date().toISOString(),
            })
            .eq("id", date.id);

          revealCount++;
          console.log(`Photos revealed for match ${match.id}.`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      matchesCreated: matchedCount,
      photoRevealsSent: revealCount,
    });
  } catch (err: any) {
    console.error("Error in fast cron handler:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
