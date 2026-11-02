import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = user.id;
    const supabaseAdmin = createAdminClient();

    // 1. Delete user files from photos bucket
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("photos")
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from("photos").remove(filePaths);
      }
    } catch (storageErr) {
      console.error("Error removing user storage files during deletion:", storageErr);
    }

    // 2. Mark active match requests as expired
    await supabaseAdmin
      .from("match_requests")
      .update({ status: "expired" })
      .eq("user_id", userId);

    // 3. Mark active matches as declined/completed
    await supabaseAdmin
      .from("matches")
      .update({ status: "declined" })
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .in("status", ["active", "date_planned"]);

    // 4. Delete user from auth.users (cascades to public.users, profiles, wallets, push_subscriptions, etc.)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Failed to delete user from auth:", deleteError);
      return NextResponse.json(
        { message: "Failed to delete account. Please try again or contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your account and personal data have been completely deleted.",
    });
  } catch (err: any) {
    console.error("Error in delete-account route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
