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
        { message: "Match request is already active or paid.", status: matchReq.status },
        { status: 400 }
      );
    }

    const feeAmount = parseFloat(matchReq.fee_paid) || 69.0;
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

    // Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: requestId,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record in DB with status 'created'
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: feeAmount,
      purpose: "match_payment",
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
    console.error("Error in create-order route:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
