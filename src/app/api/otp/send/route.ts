import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmailOTP } from "@/lib/services/otp";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // 1. If verifying university email for an existing user, verify their auth session
    if (userId) {
      const userSupabase = await createClient();
      const { data: { user } } = await userSupabase.auth.getUser();

      if (!user || user.id !== userId) {
        return NextResponse.json(
          { message: "Unauthorized." },
          { status: 401 }
        );
      }

      // Check if domain matches an active university
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

      // University email uniqueness check across all users
      const { data: existingUniUser } = await supabase
        .from("users")
        .select("id")
        .eq("university_email", normalizedEmail)
        .neq("id", userId)
        .maybeSingle();

      if (existingUniUser) {
        return NextResponse.json(
          { message: "This university email is already verified by another student." },
          { status: 400 }
        );
      }
    } else {
      // Primary personal email uniqueness check
      const { data: existingEmailUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingEmailUser) {
        return NextResponse.json(
          { message: "This email address is already associated with an account." },
          { status: 400 }
        );
      }
    }

    // 2. Check suppression / bounced emails
    const { data: bouncedRecord } = await supabase
      .from("bounced_emails")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (bouncedRecord) {
      return NextResponse.json(
        { message: "This email address is invalid or has bounced. Please use a different email." },
        { status: 400 }
      );
    }

    // 3. Rate limiting: Max 1 per 60 seconds, max 5 per 15 minutes
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: recentOtps } = await supabase
      .from("otp_verifications")
      .select("created_at")
      .eq("email", normalizedEmail)
      .gt("created_at", fifteenMinsAgo);

    if (recentOtps && recentOtps.length > 0) {
      const hasRecentInLastMinute = recentOtps.some(
        (o) => new Date(o.created_at).getTime() > Date.now() - 60 * 1000
      );
      if (hasRecentInLastMinute) {
        return NextResponse.json(
          { message: "Please wait 60 seconds before requesting another verification code." },
          { status: 429 }
        );
      }
      if (recentOtps.length >= 5) {
        return NextResponse.json(
          { message: "Too many attempts. Please try again in 15 minutes." },
          { status: 429 }
        );
      }
    }

    // 4. Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 5. Store OTP in database
    const insertData: any = {
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      is_used: false,
      email: normalizedEmail,
    };
    if (userId) insertData.user_id = userId;

    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert(insertData);

    if (insertError) {
      console.error("Failed to insert OTP in DB:", insertError);
      return NextResponse.json(
        { message: "Failed to generate verification code." },
        { status: 500 }
      );
    }

    // 6. Deliver OTP via Resend (with dev fallback)
    const sendSuccess = await sendEmailOTP(normalizedEmail, otp);

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
