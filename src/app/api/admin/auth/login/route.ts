import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "Zipline@007";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
