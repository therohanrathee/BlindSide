import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, isSESConfigured } from "@/lib/services/ses";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // Verify user exists first
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking user in reset password:", checkError);
      return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 }
      );
    }

    if (!existingUser) {
      // For security, do not reveal if the email is registered or not
      return NextResponse.json({ success: true });
    }

    // Generate a highly secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Hash it for DB storage (so if DB is leaked, tokens are safe)
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Insert into our dedicated password_reset_tokens table
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: existingUser.id,
        email: normalizedEmail,
        token_hash: tokenHash,
        expires_at: expiresAt,
        is_used: false,
      });

    if (insertError) {
      console.error("Error saving recovery token:", insertError);
      return NextResponse.json(
        { message: "Failed to generate reset link." },
        { status: 500 }
      );
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://blindside.in";
    const actionLink = `${origin}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const subject = "BlindSide — Reset Password";
    const html = `
      <div style="font-family: sans-serif; padding: 30px; background-color: #f4f5f7; color: #16192a; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #dcdee4;">
        <h2 style="color: #d42466; margin-top: 0; font-weight: 800; text-align: center; letter-spacing: -0.02em;">BlindSide</h2>
        <p style="font-size: 15px; line-height: 1.5; color: #5c6070; text-align: center;">You recently requested to reset your password. Click the secure button below to choose a new password.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${actionLink}" style="background-color: #d42466; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #8b8f9e; text-align: center; margin-bottom: 0; line-height: 1.4;">This link will expire in 15 minutes.<br/>If you did not request this change, you can safely ignore this email.</p>
      </div>
    `;

    if (isSESConfigured()) {
      const emailSent = await sendEmail({
        to: normalizedEmail,
        subject,
        html,
        from: process.env.EMAIL_OTP_FROM_ADDRESS || "BlindSide <verify@blindside.in>",
      });

      if (!emailSent) {
        return NextResponse.json(
          { message: "Failed to send the reset email." },
          { status: 502 }
        );
      }
    } else {
      const isDev = process.env.NODE_ENV === "development";
      if (isDev) {
        console.log(`\n==================================================`);
        console.log(`[MOCK RESET PASSWORD SENDER]`);
        console.log(`To: ${normalizedEmail}`);
        console.log(`Link: ${actionLink}`);
        console.log(`==================================================\n`);
      } else {
        console.error("AWS SES is not configured in production environment.");
        return NextResponse.json(
          { message: "Failed to send the reset email due to missing configuration." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in reset password route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
