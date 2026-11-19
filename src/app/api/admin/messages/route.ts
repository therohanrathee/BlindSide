import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("match_id");

  if (!matchId) {
    return NextResponse.json({ error: "match_id query parameter is required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users (
          id,
          first_name,
          last_name,
          gender
        )
      `)
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
