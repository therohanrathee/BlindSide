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
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { message: "Request ID is required." },
        { status: 400 }
      );
    }

    // Use admin client for database writes to bypass RLS since users cannot direct write wallets/ledger
    const supabase = createAdminClient();

    // Verify match request belongs to user and is unpaid
    const { data: matchReq, error: reqError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", userId)
      .single();

    if (reqError || !matchReq) {
      return NextResponse.json(
        { message: "Match request not found." },
        { status: 404 }
      );
    }

    if (matchReq.status !== "unpaid") {
      return NextResponse.json(
        { message: "Match request is already paid or active.", status: matchReq.status },
        { status: 400 }
      );
    }

    const matchCost = parseFloat(matchReq.fee_paid) || 69.0;

    // Fetch user wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { message: "Wallet not found." },
        { status: 404 }
      );
    }

    let currentBalance = parseFloat(wallet.balance);

    // If wallet balance is insufficient, auto-fund with a ₹100 promo credit for ease of testing!
    if (currentBalance < matchCost) {
      const topupAmount = 100.0;
      currentBalance += topupAmount;

      // 1. Log topup in transactions ledger
      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        direction: "credit",
        amount: topupAmount,
        balance_after: currentBalance,
        category: "promo_credit",
        description: "Testing Auto-Fund Credit",
      });

      // 2. Update wallet balance
      await supabase
        .from("wallets")
        .update({ balance: currentBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);
    }

    // Deduct matchCost from wallet
    const newBalance = currentBalance - matchCost;

    // 1. Log payment in transactions ledger
    const { data: tx, error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        direction: "debit",
        amount: matchCost,
        balance_after: newBalance,
        category: "match_payment",
        description: "Campus Match Search Fee",
        reference_id: requestId,
      })
      .select("id")
      .single();

    if (txError) {
      console.error("Failed to insert wallet transaction:", txError);
      return NextResponse.json(
        { message: "Payment transaction logging failed." },
        { status: 500 }
      );
    }

    // 2. Update wallet balance
    await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    // 3. Update match request status to active
    const { error: updateReqError } = await supabase
      .from("match_requests")
      .update({
        status: "active",
        created_at: new Date().toISOString(), // reset search start time to payment time
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", requestId);

    if (updateReqError) {
      console.error("Failed to update match request to active:", updateReqError);
      return NextResponse.json(
        { message: "Payment processed, but activating search failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful. Search started!",
      newBalance,
    });
  } catch (err: any) {
    console.error("Error in match pay route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
