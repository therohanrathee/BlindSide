import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, phone, otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { message: "OTP code is required." },
        { status: 400 }
      );
    }

    if (!email && !phone && !userId) {
      return NextResponse.json(
        { message: "Identifier (email, phone, or userId) is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const otpHash = crypto.createHash("sha256").update(otp.trim()).digest("hex");

    // Query the latest active OTP for this identifier
    let query = supabase
      .from("otp_verifications")
      .select("*")
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (userId) {
      // If verifying university email, query by userId and university email
      query = query.eq("user_id", userId).eq("email", email.trim().toLowerCase());
    } else if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    } else {
      query = query.eq("phone", phone.trim());
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

    // Check attempts limit
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

    // Success! Mark as used
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

    // If verified university email, we can immediately update users table to verify university
    if (userId && email) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          is_university_verified: true,
          university_email: email.trim().toLowerCase(),
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
