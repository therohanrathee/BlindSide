import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { user_id, is_suspended } = await request.json();

    if (!user_id || typeof is_suspended !== "boolean") {
      return NextResponse.json({ error: "Missing user_id or is_suspended boolean" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ is_suspended })
      .eq("id", user_id);

    if (error) throw error;

    return NextResponse.json({ success: true, user_id, is_suspended });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
