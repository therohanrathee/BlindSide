import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

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
    const body = await request.json();

    const {
      requestId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!requestId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: "All payment verification details are required." },
        { status: 400 }
      );
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { message: "Razorpay secret key is not configured on the server." },
        { status: 500 }
      );
    }

    // Verify signature
    const secret = razorpayKeySecret;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    // Use admin client for database updates (bypassing RLS for ledger transactions)
    const supabase = createAdminClient();

    if (expectedSignature !== razorpay_signature) {
      console.warn("Signature verification failed!");
      
      // Update payment record to failed
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("razorpay_order_id", razorpay_order_id);

      return NextResponse.json(
        { success: false, message: "Signature verification failed." },
        { status: 400 }
      );
    }

    console.log("Payment signature verified successfully!");

    // Update payment record status to paid
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (paymentUpdateError) {
      console.error("Failed to update payment record status:", paymentUpdateError);
      // Proceed anyway since signature matches, but log error
    }

    // Get the request details to know the amount
    const { data: matchReq, error: reqError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqError || !matchReq) {
      return NextResponse.json(
        { message: "Match request not found." },
        { status: 404 }
      );
    }

    const feeAmount = parseFloat(matchReq.fee_paid) || 69.0;

    // Fetch user wallet to log ledger transactions
    let { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      // Create wallet if missing (fail-safe)
      const { data: newWallet, error: createWalletError } = await supabase
        .from("wallets")
        .insert({ user_id: userId, balance: 0.0 })
        .select()
        .single();
      
      if (createWalletError) {
        console.error("Failed to create user wallet:", createWalletError);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
      }
      wallet = newWallet;
    }

    const originalBalance = parseFloat(wallet.balance);

    // Ledger transactions to maintain append-only consistency:
    // 1. Credit the wallet with the Razorpay payment amount
    const balanceAfterCredit = originalBalance + feeAmount;
    await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      direction: "credit",
      amount: feeAmount,
      balance_after: balanceAfterCredit,
      category: "razorpay_direct",
      description: "Direct Razorpay Payment Funding",
    });

    // 2. Debit the wallet immediately for the match search payment
    const balanceAfterDebit = balanceAfterCredit - feeAmount; // equal to originalBalance
    await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      direction: "debit",
      amount: feeAmount,
      balance_after: balanceAfterDebit,
      category: "match_payment",
      description: "Campus Match Search Fee",
      reference_id: requestId,
    });

    // 3. Update the wallet balance updated_at (value remains same, i.e., balanceAfterDebit)
    await supabase
      .from("wallets")
      .update({ balance: balanceAfterDebit, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    // 4. Update match request status to active and payment method to razorpay
    const { error: updateReqError } = await supabase
      .from("match_requests")
      .update({
        status: "active",
        payment_method: "razorpay",
        created_at: new Date().toISOString(), // reset search timer start
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", requestId);

    if (updateReqError) {
      console.error("Failed to activate match request:", updateReqError);
      return NextResponse.json(
        { message: "Payment verified, but activating match search failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and search activated successfully!",
      newBalance: balanceAfterDebit,
    });
  } catch (err: any) {
    console.error("Error in verify payment route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
