import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ message: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Webhook signature mismatch");
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);

    // We only care about payment.captured
    if (body.event !== "payment.captured") {
      return NextResponse.json({ success: true, message: "Event ignored" });
    }

    const paymentEntity = body.payload.payment.entity;
    const razorpay_order_id = paymentEntity.order_id;
    const razorpay_payment_id = paymentEntity.id;

    if (!razorpay_order_id) {
      return NextResponse.json({ success: true, message: "No order ID in payload" });
    }

    const supabase = createAdminClient();

    // Idempotency: Check if already paid
    const { data: paymentRecord, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (paymentError || !paymentRecord) {
      console.error("Payment record not found for webhook:", razorpay_order_id);
      return NextResponse.json({ success: true, message: "Payment not found" });
    }

    if (paymentRecord.status !== "created") {
      console.log("Webhook: Payment already processed for", razorpay_order_id);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update payment to paid
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature: "webhook_verified",
      })
      .eq("id", paymentRecord.id)
      .eq("status", "created");

    if (updateError) {
      console.error("Webhook: Failed to update payment status", updateError);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    const userId = paymentRecord.user_id;
    const amount = parseFloat(paymentRecord.amount);

    // Ensure wallet exists
    let { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      const { data: newWallet, error: createWalletError } = await supabase
        .from("wallets")
        .insert({ user_id: userId, balance: 0.0 })
        .select()
        .single();
      
      if (createWalletError) {
        console.error("Failed to create wallet:", createWalletError);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
      }
      wallet = newWallet;
    }

    const originalBalance = parseFloat(wallet.balance);
    const balanceAfterCredit = originalBalance + amount;

    if (paymentRecord.purpose === "wallet_topup") {
      // 1. Credit wallet
      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        direction: "credit",
        amount: amount,
        balance_after: balanceAfterCredit,
        category: "wallet_topup",
        description: "Wallet Top-up via Razorpay (Webhook)",
      });

      // 2. Update balance
      await supabase
        .from("wallets")
        .update({ balance: balanceAfterCredit, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

    } else if (paymentRecord.purpose === "match_payment") {
      // Fetch order from Razorpay to get the receipt (requestId)
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeyId || !razorpayKeySecret) {
        console.error("Razorpay keys missing for API fetch");
        return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
      }

      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      const order = await razorpay.orders.fetch(razorpay_order_id);
      const requestId = order.receipt;

      if (!requestId) {
        console.error("Webhook: No receipt found in Razorpay order", razorpay_order_id);
        return NextResponse.json({ message: "Order invalid" }, { status: 400 });
      }

      // 1. Credit wallet
      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        direction: "credit",
        amount: amount,
        balance_after: balanceAfterCredit,
        category: "razorpay_direct",
        description: "Direct Razorpay Payment Funding (Webhook)",
      });

      // 2. Debit wallet
      const balanceAfterDebit = balanceAfterCredit - amount;
      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        direction: "debit",
        amount: amount,
        balance_after: balanceAfterDebit,
        category: "match_payment",
        description: "Campus Match Search Fee",
        reference_id: requestId,
      });

      // 3. Update balance
      await supabase
        .from("wallets")
        .update({ balance: balanceAfterDebit, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      // 4. Activate match request
      await supabase
        .from("match_requests")
        .update({
          status: "active",
          payment_method: "razorpay",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", requestId);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
