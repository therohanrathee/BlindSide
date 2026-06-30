import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmailOTP, sendSMSOTP } from "@/lib/services/otp";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { message: "Either email or phone is required." },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    const supabase = createAdminClient();

    // Check if the email is bounced/suppressed
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const { data: bouncedRecord, error: bounceError } = await supabase
        .from("bounced_emails")
        .select("email")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (bounceError) {
        console.error("Failed to query bounced_emails in OTP send:", bounceError);
      }

      if (bouncedRecord) {
        return NextResponse.json(
          { message: "This email address is invalid or has bounced. Please use a different email." },
          { status: 400 }
        );
      }
    }

    // Check if email or phone is already associated with another profile
    if (!userId) {
      if (email) {
        const { data: existingEmailUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email.trim().toLowerCase())
          .maybeSingle();

        if (existingEmailUser) {
          return NextResponse.json(
            { message: "This email address is already associated with another profile." },
            { status: 400 }
          );
        }
      }

      if (phone) {
        const { data: existingPhoneUser } = await supabase
          .from("users")
          .select("id")
          .eq("phone", phone.trim())
          .maybeSingle();

        if (existingPhoneUser) {
          return NextResponse.json(
            { message: "This phone number is already associated with another profile." },
            { status: 400 }
          );
        }
      }
    } else {
      // University email verification uniqueness check
      if (email) {
        const { data: existingUniUser } = await supabase
          .from("users")
          .select("id")
          .eq("university_email", email.trim().toLowerCase())
          .neq("id", userId)
          .maybeSingle();

        if (existingUniUser) {
          return NextResponse.json(
            { message: "This university email is already verified by another student." },
            { status: 400 }
          );
        }
      }
    }

    // Insert verification code in DB
    const insertData: any = {
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      is_used: false,
    };

    if (userId) insertData.user_id = userId;
    if (email) insertData.email = email.trim().toLowerCase();
    if (phone) insertData.phone = phone.trim();

    const { error } = await supabase
      .from("otp_verifications")
      .insert(insertData);

    if (error) {
      console.error("Failed to insert OTP in DB:", error);
      return NextResponse.json(
        { message: "Failed to generate verification code." },
        { status: 500 }
      );
    }

    // Send OTP via service (handles Resend/Twilio or fallbacks to console log)
    let sendSuccess = false;
    if (email) {
      sendSuccess = await sendEmailOTP(email, otp);
    } else if (phone) {
      sendSuccess = await sendSMSOTP(phone, otp);
    }

    if (!sendSuccess) {
      return NextResponse.json(
        { message: "Failed to deliver verification code. Please check your credentials." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
    });
  } catch (err: any) {
    console.error("Error in OTP send route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
