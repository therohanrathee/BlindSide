import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { report_id, status, suspend_user, reported_user_id } = await request.json();

    if (!report_id || !status) {
      return NextResponse.json({ error: "Missing report_id or status" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error: reportErr } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", report_id);

    if (reportErr) throw reportErr;

    if (suspend_user && reported_user_id) {
      await supabase
        .from("users")
        .update({ is_suspended: true })
        .eq("id", reported_user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
