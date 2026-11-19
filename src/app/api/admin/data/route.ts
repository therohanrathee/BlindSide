import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 1. Fetch Users with joined profiles, universities, wallets
    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select(`
        id,
        first_name,
        last_name,
        email,
        gender,
        date_of_birth,
        height_cm,
        is_onboarding_complete,
        is_suspended,
        is_first_match_used,
        created_at,
        university_id,
        universities (
          id,
          name,
          city,
          state
        ),
        profiles (
          photo_url,
          dietary,
          drinking,
          smoking,
          fitness,
          hobbies,
          relationship_intent
        ),
        wallets (
          id,
          balance,
          updated_at
        )
      `)
      .order("created_at", { ascending: false });

    if (usersErr) throw usersErr;

    // 2. Batch-sign profile photos
    const signedPhotoMap: Record<string, string> = {};
    if (users && users.length > 0) {
      const photoPromises = users.map(async (u) => {
        const rawPhoto = (u.profiles as any)?.photo_url;
        if (rawPhoto && typeof rawPhoto === "string" && !rawPhoto.startsWith("http")) {
          try {
            const { data } = await supabase.storage
              .from("photos")
              .createSignedUrl(rawPhoto, 3600 * 24);
            if (data?.signedUrl) {
              signedPhotoMap[u.id] = data.signedUrl;
            }
          } catch {
            // Ignore individual signing failure
          }
        } else if (rawPhoto && rawPhoto.startsWith("http")) {
          signedPhotoMap[u.id] = rawPhoto;
        }
      });
      await Promise.all(photoPromises);
    }

    // Attach signedPhotoUrl to each user object
    const enrichedUsers = (users || []).map((u) => ({
      ...u,
      wallet_balance: parseFloat((u.wallets as any)?.balance ?? 0),
      signed_photo_url: signedPhotoMap[u.id] || "",
    }));

    // 3. Fetch Match Requests (Active and Historical)
    const { data: requests, error: reqsErr } = await supabase
      .from("match_requests")
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          gender,
          date_of_birth,
          height_cm,
          universities (
            name,
            city
          ),
          profiles (
            photo_url,
            hobbies,
            dietary,
            drinking,
            smoking,
            fitness
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (reqsErr) throw reqsErr;

    const enrichedRequests = (requests || []).map((r) => ({
      ...r,
      user_photo_url: signedPhotoMap[r.user_id] || "",
    }));

    const activeRequests = enrichedRequests.filter((r) => r.status === "active");

    // 4. Fetch Matches
    const { data: matches, error: matchesErr } = await supabase
      .from("matches")
      .select(`
        *,
        user_a:users!matches_user_a_id_fkey (
          id,
          first_name,
          last_name,
          gender,
          date_of_birth,
          universities (
            name,
            city
          )
        ),
        user_b:users!matches_user_b_id_fkey (
          id,
          first_name,
          last_name,
          gender,
          date_of_birth,
          universities (
            name,
            city
          )
        ),
        date_proposals (
          id,
          status,
          proposed_date,
          proposed_time,
          location_text
        )
      `)
      .order("created_at", { ascending: false });

    if (matchesErr) throw matchesErr;

    const enrichedMatches = (matches || []).map((m) => ({
      ...m,
      user_a_photo: signedPhotoMap[m.user_a_id] || "",
      user_b_photo: signedPhotoMap[m.user_b_id] || "",
    }));

    // 5. Fetch Reports
    const { data: reports, error: reportsErr } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        reported:users!reports_reported_id_fkey (
          id,
          first_name,
          last_name,
          email,
          is_suspended
        )
      `)
      .order("created_at", { ascending: false });

    if (reportsErr) throw reportsErr;

    // 6. Fetch Universities
    const { data: universities } = await supabase
      .from("universities")
      .select("*")
      .order("name", { ascending: true });

    // 7. Compute High-Level Statistics
    const totalUsers = enrichedUsers.length;
    const onboardedUsers = enrichedUsers.filter((u) => u.is_onboarding_complete).length;
    const suspendedUsers = enrichedUsers.filter((u) => u.is_suspended).length;
    const maleUsers = enrichedUsers.filter((u) => u.gender === "male").length;
    const femaleUsers = enrichedUsers.filter((u) => u.gender === "female").length;
    const otherUsers = enrichedUsers.filter((u) => u.gender !== "male" && u.gender !== "female").length;

    const totalWalletBalance = enrichedUsers.reduce((acc, u) => acc + (u.wallet_balance || 0), 0);
    const totalMatchFeesPaid = (requests || []).reduce(
      (acc, r) => acc + (parseFloat(r.fee_paid) || 0),
      0
    );

    const totalRequests = enrichedRequests.length;
    const totalActiveRequests = activeRequests.length;
    const totalMatchedRequests = enrichedRequests.filter((r) => r.status === "matched").length;
    const totalExpiredRequests = enrichedRequests.filter((r) => r.status === "expired" || r.status === "credited").length;

    const totalMatches = enrichedMatches.length;
    const activeChats = enrichedMatches.filter((m) => m.status === "active").length;
    const plannedDates = enrichedMatches.filter((m) => m.status === "date_planned" || m.status === "date_confirmed").length;
    const declinedMatches = enrichedMatches.filter((m) => m.status === "declined").length;

    const stats = {
      totalUsers,
      onboardedUsers,
      suspendedUsers,
      maleUsers,
      femaleUsers,
      otherUsers,
      totalWalletBalance: Math.round(totalWalletBalance * 100) / 100,
      totalMatchFeesPaid: Math.round(totalMatchFeesPaid * 100) / 100,
      totalRequests,
      activeRequestsCount: totalActiveRequests,
      matchedRequestsCount: totalMatchedRequests,
      expiredRequestsCount: totalExpiredRequests,
      totalMatches,
      activeChats,
      plannedDates,
      declinedMatches,
      pendingReports: (reports || []).filter((rep) => rep.status === "pending").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      users: enrichedUsers,
      requests: enrichedRequests,
      activeRequests,
      matches: enrichedMatches,
      reports: reports || [],
      universities: universities || [],
    });
  } catch (err: any) {
    console.error("Admin data fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch admin data." },
      { status: 500 }
    );
  }
}
