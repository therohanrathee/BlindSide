import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, isResendConfigured } from "@/lib/services/resendService";
import { generateDropEmailHtml, generateDropEmailText } from "@/lib/services/dropEmailTemplate";

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { user_id, amount = 69 } = body;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ error: "Missing or invalid user_id." }, { status: 400 });
    }

    const dropAmount = typeof amount === "number" && amount > 0 ? Math.round(amount * 100) / 100 : 69;

    const supabase = createAdminClient();

    // 1. Fetch user record
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .eq("id", user_id)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User does not have an email address to receive the drop notification." },
        { status: 400 }
      );
    }

    // 2. Fetch or create user's wallet
    let { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: createWalletErr } = await supabase
        .from("wallets")
        .insert({ user_id, balance: 0.0 })
        .select()
        .single();
      if (createWalletErr) throw createWalletErr;
      wallet = newWallet;
    }

    const currentBalance = parseFloat(wallet.balance as any) || 0;
    const newBalance = Math.round((currentBalance + dropAmount) * 100) / 100;

    // 3. Update wallet balance
    const { error: updateErr } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (updateErr) throw updateErr;

    // 4. Record wallet transaction
    const { error: txErr } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      direction: "credit",
      amount: dropAmount,
      balance_after: newBalance,
      category: "promo_credit",
      description: `Free Drop: ₹${dropAmount} promotional credit granted by BlindSide`,
    });

    if (txErr) {
      console.warn("Failed to log drop credit transaction:", txErr);
    }

    // 5. Send notification email via Resend
    let emailSent = false;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blindside.in/dashboard";
    const emailHtml = generateDropEmailHtml({
      firstName: user.first_name || "",
      amount: dropAmount,
      appUrl,
    });
    const emailText = generateDropEmailText({
      firstName: user.first_name || "",
      amount: dropAmount,
      appUrl,
    });

    if (isResendConfigured()) {
      emailSent = await sendEmail({
        to: user.email,
        from: "BlindSide Drops <drops@blindside.in>",
        replyTo: "support@blindside.in",
        subject: `🎁 You received ₹${dropAmount} in your BlindSide Wallet!`,
        html: emailHtml,
        text: emailText,
      });
    } else {
      console.warn("Resend API key missing or not configured. Email was not sent.");
    }

    return NextResponse.json({
      success: true,
      amount: dropAmount,
      old_balance: currentBalance,
      new_balance: newBalance,
      email_sent: emailSent,
      user_name: user.first_name,
      user_email: user.email,
      message: `Dropped ₹${dropAmount} to ${user.first_name || user.email}${emailSent ? " and sent announcement email from drops@blindside.in" : " (wallet updated, but email could not be sent)"}.`,
    });
  } catch (err: any) {
    console.error("Drop credits error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to drop credits to user." },
      { status: 500 }
    );
  }
}
