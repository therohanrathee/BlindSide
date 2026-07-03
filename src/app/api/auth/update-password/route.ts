import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const supabase = createAdminClient();

    // Find the token in the database
    const { data: otpRecord, error: otpError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, is_used")
      .eq("email", normalizedEmail)
      .eq("token_hash", tokenHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { message: "Invalid or expired password reset link." },
        { status: 400 }
      );
    }

    if (otpRecord.is_used) {
      return NextResponse.json(
        { message: "This reset link has already been used." },
        { status: 400 }
      );
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Token is valid. Mark it as used.
    await supabase
      .from("password_reset_tokens")
      .update({ is_used: true })
      .eq("id", otpRecord.id);

    // Update the user's password using Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      otpRecord.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password via Admin API:", updateError);
      return NextResponse.json(
        { message: "Failed to update password. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in update password route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
