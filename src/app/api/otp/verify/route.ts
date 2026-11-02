import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, otp } = await request.json();

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { message: "OTP code is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required for verification." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // 1. If verifying for a specific userId, authenticate the session
    if (userId) {
      const userSupabase = await createClient();
      const { data: { user } } = await userSupabase.auth.getUser();

      if (!user || user.id !== userId) {
        return NextResponse.json(
          { message: "Unauthorized." },
          { status: 401 }
        );
      }
    }

    const otpHash = crypto.createHash("sha256").update(otp.trim()).digest("hex");

    // 2. Query the latest active OTP for this identifier
    let query = supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error("Database query error in verification:", error);
      return NextResponse.json(
        { message: "Database query failed." },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const latestOtpRecord = records[0];

    // Check attempts limit (max 3)
    if (latestOtpRecord.attempts >= 3) {
      return NextResponse.json(
        { message: "This code is blocked due to too many incorrect attempts. Please request a new one." },
        { status: 400 }
      );
    }

    if (latestOtpRecord.otp_hash !== otpHash) {
      // Mismatch! Increment attempts
      const newAttempts = latestOtpRecord.attempts + 1;
      await supabase
        .from("otp_verifications")
        .update({ attempts: newAttempts })
        .eq("id", latestOtpRecord.id);

      return NextResponse.json(
        { message: `Incorrect verification code. ${3 - newAttempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // Success! Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_verifications")
      .update({ is_used: true })
      .eq("id", latestOtpRecord.id);

    if (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
      return NextResponse.json(
        { message: "Verification completed but database update failed." },
        { status: 500 }
      );
    }

    // If verifying university email for authenticated user, validate university and update status
    if (userId) {
      const domain = normalizedEmail.split("@")[1];
      const { data: matchedUni } = await supabase
        .from("universities")
        .select("id, name, email_domain")
        .eq("email_domain", domain)
        .eq("is_active", true)
        .maybeSingle();

      if (!matchedUni) {
        return NextResponse.json(
          { message: `Email domain (@${domain}) is not recognized as a registered university.` },
          { status: 400 }
        );
      }

      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          is_university_verified: true,
          university_email: normalizedEmail,
          university_id: matchedUni.id,
        })
        .eq("id", userId);

      if (userUpdateError) {
        console.error("Failed to update user university verification:", userUpdateError);
        return NextResponse.json(
          { message: "University verified, but updating profile failed." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Code verified successfully.",
    });
  } catch (err: any) {
    console.error("Error in OTP verify route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
