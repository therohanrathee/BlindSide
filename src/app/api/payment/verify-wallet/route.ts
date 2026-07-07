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
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // Update payment record status to paid
    const { data: paymentRecord, error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select("*")
      .single();

    if (paymentUpdateError || !paymentRecord) {
      console.error("Failed to update payment record status:", paymentUpdateError);
      return NextResponse.json(
        { message: "Failed to verify payment record." },
        { status: 500 }
      );
    }

    const amount = parseFloat(paymentRecord.amount);

    // Fetch user wallet to log ledger transactions
    let { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      // Create wallet if missing
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
    const balanceAfterCredit = originalBalance + amount;
    await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      direction: "credit",
      amount: amount,
      balance_after: balanceAfterCredit,
      category: "wallet_topup",
      description: "Wallet Top-up via Razorpay",
    });

    // 2. Update the wallet balance updated_at
    await supabase
      .from("wallets")
      .update({ balance: balanceAfterCredit, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    return NextResponse.json({
      success: true,
      message: "Wallet topped up successfully!",
      newBalance: balanceAfterCredit,
    });
  } catch (err: any) {
    console.error("Error in verify-wallet payment route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
