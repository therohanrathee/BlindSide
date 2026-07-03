import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    const { endpoint, keys: { p256dh, auth } } = subscription;

    // Check if subscription already exists for this exact endpoint
    const { data: existingSub } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (existingSub) {
      // Update the user_id just in case a different user logged in on the same browser
      await supabase
        .from("push_subscriptions")
        .update({ user_id: user.id, p256dh, auth })
        .eq("id", existingSub.id);
        
      return NextResponse.json({ success: true, message: "Subscription updated" });
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
      });

    if (insertError) {
      console.error("Failed to insert push subscription:", insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true, message: "Subscription saved" });
  } catch (err: any) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
