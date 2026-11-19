import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import webpush from "web-push";

// Configure web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@blindside.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { request_a_id, request_b_id, compatibility_score } = await request.json();

    if (!request_a_id || !request_b_id) {
      return NextResponse.json(
        { error: "Both request_a_id and request_b_id are required." },
        { status: 400 }
      );
    }

    if (request_a_id === request_b_id) {
      return NextResponse.json(
        { error: "Cannot match a request with itself." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch both requests
    const { data: reqA, error: errReqA } = await supabase
      .from("match_requests")
      .select("*, user:users(id, first_name, last_name)")
      .eq("id", request_a_id)
      .single();

    const { data: reqB, error: errReqB } = await supabase
      .from("match_requests")
      .select("*, user:users(id, first_name, last_name)")
      .eq("id", request_b_id)
      .single();

    if (errReqA || !reqA || errReqB || !reqB) {
      return NextResponse.json(
        { error: "One or both match requests could not be found." },
        { status: 404 }
      );
    }

    if (reqA.status !== "active" || reqB.status !== "active") {
      return NextResponse.json(
        { error: `One or both requests are no longer active (Req A: ${reqA.status}, Req B: ${reqB.status}).` },
        { status: 400 }
      );
    }

    if (reqA.user_id === reqB.user_id) {
      return NextResponse.json(
        { error: "Both requests belong to the same user." },
        { status: 400 }
      );
    }

    // 2. Atomically transition both requests to 'matched'
    const nowIso = new Date().toISOString();

    const { data: updateA, error: updateErrA } = await supabase
      .from("match_requests")
      .update({ status: "matched", matched_at: nowIso })
      .eq("id", reqA.id)
      .eq("status", "active")
      .select();

    if (updateErrA || !updateA || updateA.length === 0) {
      return NextResponse.json(
        { error: "Failed to lock Request A. It may have already been matched or expired." },
        { status: 409 }
      );
    }

    const { data: updateB, error: updateErrB } = await supabase
      .from("match_requests")
      .update({ status: "matched", matched_at: nowIso })
      .eq("id", reqB.id)
      .eq("status", "active")
      .select();

    if (updateErrB || !updateB || updateB.length === 0) {
      // Rollback Request A
      await supabase
        .from("match_requests")
        .update({ status: "active", matched_at: null })
        .eq("id", reqA.id);

      return NextResponse.json(
        { error: "Failed to lock Request B. It may have already been matched or expired." },
        { status: 409 }
      );
    }

    // 3. Register the match pair (Bypassing all filters)
    const [userAId, userBId] = [reqA.user_id, reqB.user_id].sort();
    const [reqAId, reqBId] = reqA.user_id === userAId ? [reqA.id, reqB.id] : [reqB.id, reqA.id];

    const isDev = process.env.NODE_ENV === "development" || !process.env.CRON_SECRET;
    const chatDurationMs = isDev
      ? 100 * 365 * 24 * 60 * 60 * 1000 // 100 years for dev
      : 48 * 60 * 60 * 1000;            // 48 hours for prod

    const score = compatibility_score ? Math.min(100, Math.max(50, compatibility_score)) : 88;

    const { data: matchRecord, error: matchInsertError } = await supabase
      .from("matches")
      .insert({
        request_a_id: reqAId,
        request_b_id: reqBId,
        user_a_id: userAId,
        user_b_id: userBId,
        compatibility_score: score,
        status: "active",
        chat_expires_at: new Date(Date.now() + chatDurationMs).toISOString(),
        matched_at: nowIso,
      })
      .select()
      .single();

    if (matchInsertError) {
      console.error("Manual match insert error:", matchInsertError);
      // Rollback both requests
      await supabase
        .from("match_requests")
        .update({ status: "active", matched_at: null })
        .in("id", [reqA.id, reqB.id]);

      return NextResponse.json(
        { error: "Database error creating match record: " + matchInsertError.message },
        { status: 500 }
      );
    }

    // 4. Mark first match as used
    await supabase
      .from("users")
      .update({ is_first_match_used: true })
      .in("id", [userAId, userBId]);

    // 5. Send push notifications to both users
    try {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .in("user_id", [userAId, userBId]);

      if (subs && subs.length > 0) {
        const pushPayload = JSON.stringify({
          title: "BlindSide Match! 💖",
          body: "You have been matched! Open the app to say hello.",
          url: "/dashboard?tab=chat",
          tag: matchRecord.id,
          match_id: matchRecord.id,
        });

        const sendPromises = subs.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };
          try {
            await webpush.sendNotification(pushSubscription, pushPayload);
          } catch {
            // Ignore push failure for manual match
          }
        });
        await Promise.allSettled(sendPromises);
      }
    } catch (pushErr) {
      console.error("Push notification error in manual match:", pushErr);
    }

    return NextResponse.json({
      success: true,
      match: matchRecord,
      user_a_name: `${reqA.user?.first_name || ""} ${reqA.user?.last_name || ""}`.trim(),
      user_b_name: `${reqB.user?.first_name || ""} ${reqB.user?.last_name || ""}`.trim(),
    });
  } catch (err: any) {
    console.error("Manual match API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
