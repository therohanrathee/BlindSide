import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create the auth user already confirmed so a session can be established
    // immediately (works regardless of the project's "Confirm email" setting).
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { message: error?.message || "Failed to create account." },
        { status: 400 }
      );
    }

    const userId = data.user.id;

    // Persist the phone number on the public.users row (created via trigger).
    if (phone) {
      const { error: phoneError } = await supabase
        .from("users")
        .update({ phone: phone.trim() })
        .eq("id", userId);

      if (phoneError) {
        console.error("Failed to update user phone number on signup:", phoneError);
      }
    }

    return NextResponse.json({ userId });
  } catch (err: any) {
    console.error("Error in auth signup route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
