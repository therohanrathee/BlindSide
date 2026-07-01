import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { identifier, getEmail } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { message: "Identifier is required." },
        { status: 400 }
      );
    }

    const trimmedId = identifier.trim().toLowerCase();
    const isEmail = trimmedId.includes("@");

    if (!isEmail) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if the email is blacklisted/bounced
    const { data: bouncedRecord, error: bounceError } = await supabase
      .from("bounced_emails")
      .select("email")
      .eq("email", trimmedId)
      .maybeSingle();

    if (bounceError) {
      console.error("Failed to query bounced_emails in auth check:", bounceError);
    }

    if (bouncedRecord) {
      return NextResponse.json(
        { message: "This email address is invalid or has bounced. Please use a different email." },
        { status: 400 }
      );
    }

    // Query public.users
    const query = supabase
      .from("users")
      .select("id, email")
      .eq("email", trimmedId);

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Database error in auth check:", error);
      return NextResponse.json(
        { message: "Database lookup failed." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ exists: false });
    }

    const responsePayload: any = { exists: true };
    if (getEmail) {
      responsePayload.email = data.email;
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("Error in auth check route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
