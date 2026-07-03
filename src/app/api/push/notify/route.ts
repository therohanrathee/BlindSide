import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import webpush from "web-push";

// Configure web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@blindside.com", // Usually a support email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    // Determine if this is a server-to-server call (e.g., from fast cron) or client call
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCron = authHeader === `Bearer ${cronSecret}`;

    const payload = await request.json();
    const { receiver_id, title, body, url, match_id } = payload;

    if (!receiver_id || !title || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    if (!isCron) {
      // If called from the client, verify authorization
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify the user is part of the provided match
      if (match_id) {
        const { data: matchData } = await supabaseAdmin
          .from("matches")
          .select("user_a_id, user_b_id")
          .eq("id", match_id)
          .single();

        if (!matchData || (matchData.user_a_id !== user.id && matchData.user_b_id !== user.id)) {
          return NextResponse.json({ error: "Forbidden: Not part of this match" }, { status: 403 });
        }
      }
    }

    // Fetch all active push subscriptions for the receiver
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", receiver_id);

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: "No active subscriptions found for user" });
    }

    const pushPayload = JSON.stringify({ title, body, url, tag: match_id || "default" });

    // Send notifications to all of the user's devices
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, pushPayload);
      } catch (err: any) {
        // If the subscription is gone/invalid, delete it from our DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Deleting invalid subscription: ${sub.id}`);
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Failed to send push:", err);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({ success: true, message: "Notifications sent" });
  } catch (err: any) {
    console.error("Notify API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
