import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { user_id } = await request.json();

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ error: "Missing or invalid user_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch user to verify existence and get email
    const { data: userRecord } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .eq("id", user_id)
      .maybeSingle();

    const userEmail = userRecord?.email?.toLowerCase()?.trim();

    // 2. Delete storage files (photos bucket)
    try {
      const { data: files } = await supabase.storage.from("photos").list(user_id);
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${user_id}/${f.name}`);
        await supabase.storage.from("photos").remove(filePaths);
      }
    } catch (storageErr) {
      console.warn("Storage cleanup error:", storageErr);
    }

    // 3. Find user match requests first
    const { data: userRequests } = await supabase
      .from("match_requests")
      .select("id")
      .eq("user_id", user_id);
    const userRequestIds = (userRequests || []).map((r) => r.id);

    // 4. Find all matches involving this user (either by user_id or match_request)
    const { data: userMatches } = await supabase
      .from("matches")
      .select("id, request_a_id, request_b_id, user_a_id, user_b_id")
      .or(`user_a_id.eq.${user_id},user_b_id.eq.${user_id}`);

    const matchIds = new Set((userMatches || []).map((m) => m.id));

    if (userRequestIds.length > 0) {
      const { data: requestMatches } = await supabase
        .from("matches")
        .select("id")
        .or(`request_a_id.in.(${userRequestIds.join(",")}),request_b_id.in.(${userRequestIds.join(",")})`);
      (requestMatches || []).forEach((m) => matchIds.add(m.id));
    }

    const allMatchIds = Array.from(matchIds);

    if (allMatchIds.length > 0) {
      // 4.1 Delete confirmed_dates for these matches
      await supabase.from("confirmed_dates").delete().in("match_id", allMatchIds);

      // 4.2 Delete date_proposals for these matches
      await supabase.from("date_proposals").delete().in("match_id", allMatchIds);

      // 4.3 Delete messages for these matches
      await supabase.from("messages").delete().in("match_id", allMatchIds);

      // 4.4 Delete feedback for these matches
      await supabase.from("feedback").delete().in("match_id", allMatchIds);

      // 4.5 Delete the matches themselves
      await supabase.from("matches").delete().in("id", allMatchIds);
    }

    // 5. Delete any remaining proposals/confirmed_dates by this user
    const { data: remainingProposals } = await supabase
      .from("date_proposals")
      .select("id")
      .eq("proposed_by", user_id);
    if (remainingProposals && remainingProposals.length > 0) {
      const propIds = remainingProposals.map((p) => p.id);
      await supabase.from("confirmed_dates").delete().in("date_proposal_id", propIds);
    }
    await supabase.from("date_proposals").delete().eq("proposed_by", user_id);

    // 6. Delete any remaining messages sent by this user
    await supabase.from("messages").delete().eq("sender_id", user_id);

    // 7. Delete any remaining feedback submitted by this user
    await supabase.from("feedback").delete().eq("user_id", user_id);

    // 8. Delete payments
    await supabase.from("payments").delete().eq("user_id", user_id);

    // 9. Delete match_requests
    await supabase.from("match_requests").delete().eq("user_id", user_id);

    // 10. Delete user_blocks (both as blocker and as blocked)
    await supabase.from("user_blocks").delete().or(`blocker_id.eq.${user_id},blocked_id.eq.${user_id}`);

    // 11. Delete reports (both as reporter and as reported)
    await supabase.from("reports").delete().or(`reporter_id.eq.${user_id},reported_id.eq.${user_id}`);

    // 12. Delete push_subscriptions
    await supabase.from("push_subscriptions").delete().eq("user_id", user_id);

    // 13. Delete password reset tokens
    await supabase.from("password_reset_tokens").delete().eq("user_id", user_id);
    if (userEmail) {
      await supabase.from("password_reset_tokens").delete().eq("email", userEmail);
    }

    // 14. Delete otp_verifications
    await supabase.from("otp_verifications").delete().eq("user_id", user_id);
    if (userEmail) {
      await supabase.from("otp_verifications").delete().eq("email", userEmail);
    }

    // 15. Delete onboarding_leads
    await supabase.from("onboarding_leads").delete().eq("user_id", user_id);
    if (userEmail) {
      await supabase.from("onboarding_leads").delete().eq("email", userEmail);
    }

    // 16. Remove from bounced_emails suppression list so they can receive emails if they re-register
    if (userEmail) {
      await supabase.from("bounced_emails").delete().eq("email", userEmail);
    }

    // 17. Delete wallet_transactions & wallets
    const { data: wallets } = await supabase.from("wallets").select("id").eq("user_id", user_id);
    if (wallets && wallets.length > 0) {
      const walletIds = wallets.map((w) => w.id);
      await supabase.from("wallet_transactions").delete().in("wallet_id", walletIds);
      await supabase.from("wallets").delete().eq("user_id", user_id);
    }

    // 18. Delete profiles
    await supabase.from("profiles").delete().eq("user_id", user_id);

    // 19. Delete public.users record
    await supabase.from("users").delete().eq("id", user_id);

    // 20. Delete from auth.users so credentials and sessions are permanently gone
    const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(user_id);
    if (authDeleteErr) {
      console.warn("Auth user delete warning:", authDeleteErr);
    }

    return NextResponse.json({
      success: true,
      message: `User ${userRecord?.first_name || ""} (${userEmail || user_id}) was completely purged.`,
    });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
