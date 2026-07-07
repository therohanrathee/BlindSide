import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      prefGender,
      prefAgeMin,
      prefAgeMax,
      prefHeightMinCm,
      prefHeightMaxCm,
      prefDietary,
      prefDrinking,
      prefSmoking,
    } = body;

    // Check if there's already an active (or unpaid) request
    const { data: existing } = await supabase
      .from("match_requests")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ["unpaid", "active", "matched"])
      .maybeSingle();

    if (existing && existing.status !== "unpaid") {
      return NextResponse.json(
        {
          message: "You already have a match request active or matched.",
          requestId: existing.id,
          status: existing.status,
        },
        { status: 400 }
      );
    }

    // Set expires_at to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Count previous paid/completed/active/matched requests to determine if this is the first one
    const { count, error: countError } = await supabase
      .from("match_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("status", "eq", "unpaid");

    const isFirstMatch = !countError && count === 0;
    const feePaid = isFirstMatch ? 49.0 : 69.0;

    const requestData = {
      user_id: userId,
      scope: "university",
      fee_paid: feePaid,
      payment_method: "wallet",
      pref_gender: prefGender || "everyone",
      pref_age_min: prefAgeMin ? parseInt(prefAgeMin) : 18,
      pref_age_max: prefAgeMax ? parseInt(prefAgeMax) : 30,
      pref_height_min_cm: prefHeightMinCm ? parseFloat(prefHeightMinCm) : null,
      pref_height_max_cm: prefHeightMaxCm ? parseFloat(prefHeightMaxCm) : null,
      pref_dietary: prefDietary || "no_preference",
      pref_drinking: prefDrinking || "no_preference",
      pref_smoking: prefSmoking || "no_preference",
      status: "unpaid",
      expires_at: expiresAt,
    };

    if (existing && existing.status === "unpaid") {
      // Update the existing unpaid request
      const { error: updateError } = await supabase
        .from("match_requests")
        .update(requestData)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Failed to update match request:", updateError);
        return NextResponse.json(
          { message: "Failed to update search preferences." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        requestId: existing.id,
        message: "Preferences updated. Please complete payment to start matching.",
      });
    }

    // Otherwise, create a new request
    const { data: newRequest, error } = await supabase
      .from("match_requests")
      .insert(requestData)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create match request:", error);
      return NextResponse.json(
        { message: "Failed to save search preferences." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: "Preferences recorded. Please complete payment to start matching.",
    });
  } catch (err: any) {
    console.error("Error in match request route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
