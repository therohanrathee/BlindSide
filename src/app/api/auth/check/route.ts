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

    const supabase = createAdminClient();

    // Query public.users
    let query = supabase
      .from("users")
      .select("id, email, phone");

    if (isEmail) {
      query = query.eq("email", trimmedId);
    } else {
      query = query.eq("phone", trimmedId);
    }

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
