import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const userSupabase = await createClient();

    // Verify session
    const { data: { session } } = await userSupabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const supabase = createAdminClient();

    // 1. Fetch active match requests to process refunds
    const { data: activeReqs, error: fetchReqError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (fetchReqError) {
      console.error("Error fetching active requests for reset:", fetchReqError);
      return NextResponse.json(
        { message: "Failed to query active searches." },
        { status: 500 }
      );
    }

    let finalBalance = null;

    if (activeReqs && activeReqs.length > 0) {
      // Fetch user's wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (wallet && !walletError) {
        let currentBalance = parseFloat(wallet.balance) || 0;

        // Process refund for each active request
        for (const req of activeReqs) {
          const feePaid = parseFloat(req.fee_paid) || 0;
          if (feePaid > 0) {
            currentBalance += feePaid;

            // Log refund transaction in ledger
            await supabase.from("wallet_transactions").insert({
              wallet_id: wallet.id,
              direction: "credit",
              amount: feePaid,
              balance_after: currentBalance,
              category: "no_match_credit",
              description: "Refund for Canceled Campus Search",
              reference_id: req.id,
            });
          }

          // Mark this specific match request as credited/refunded
          await supabase
            .from("match_requests")
            .update({ status: "credited" })
            .eq("id", req.id);
        }

        // Update the final wallet balance in the DB
        const { error: walletUpdateErr } = await supabase
          .from("wallets")
          .update({ balance: currentBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id);

        if (!walletUpdateErr) {
          finalBalance = currentBalance;
        } else {
          console.error("Failed to update wallet balance during reset:", walletUpdateErr);
        }
      }
    }

    // 2. Mark any other unpaid or matched match requests as expired
    const { error: reqError } = await supabase
      .from("match_requests")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .in("status", ["unpaid", "matched"]);

    if (reqError) {
      console.error("Failed to archive non-active match requests during reset:", reqError);
    }

    // 3. Mark active matches as completed
    const { error: matchError } = await supabase
      .from("matches")
      .update({ status: "completed" })
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .in("status", ["active", "date_planned", "date_confirmed"]);

    if (matchError) {
      console.error("Failed to archive matches during reset:", matchError);
    }

    return NextResponse.json({
      success: true,
      message: "Search canceled and refunded successfully.",
      newBalance: finalBalance,
    });
  } catch (err: any) {
    console.error("Error in match reset route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
