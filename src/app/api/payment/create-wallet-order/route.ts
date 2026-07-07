import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

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
    const { amount } = await request.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { message: "A valid amount is required." },
        { status: 400 }
      );
    }

    const feeAmount = parseFloat(amount);

    if (feeAmount < 10) {
      return NextResponse.json(
        { message: "Minimum top-up amount is ₹10." },
        { status: 400 }
      );
    }

    if (feeAmount > 5000) {
      return NextResponse.json(
        { message: "Maximum top-up amount is ₹5000." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(feeAmount * 100);

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { message: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Use admin client for database writes to bypass RLS since users cannot direct write ledgers
    const supabaseAdmin = createAdminClient();

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `topup_${userId.substring(0, 8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record in DB with status 'created'
    const { error: paymentError } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: feeAmount,
      purpose: "wallet_topup",
      status: "created",
    });

    if (paymentError) {
      console.error("Failed to insert payment record:", paymentError);
      return NextResponse.json(
        { message: "Failed to record payment order on the server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKeyId,
    });
  } catch (err: any) {
    console.error("Error in create-wallet-order route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
