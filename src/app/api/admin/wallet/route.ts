import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { user_id, new_balance, reason } = await request.json();

    if (!user_id || typeof new_balance !== "number" || new_balance < 0) {
      return NextResponse.json(
        { error: "Invalid user_id or balance. Balance must be non-negative." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current wallet or create one if missing
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
    const diff = Math.round((new_balance - currentBalance) * 100) / 100;

    if (diff === 0) {
      return NextResponse.json({ success: true, balance: currentBalance, message: "No change" });
    }

    const direction = diff > 0 ? "credit" : "debit";
    const amount = Math.abs(diff);
    const category = diff > 0 ? "admin_credit" : "admin_debit";
    const description = reason || (diff > 0 ? "Admin credit adjustment" : "Admin debit adjustment");

    // 2. Update wallet balance
    const { error: updateErr } = await supabase
      .from("wallets")
      .update({
        balance: new_balance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (updateErr) throw updateErr;

    // 3. Insert transaction log
    const { error: txErr } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      direction,
      amount,
      balance_after: new_balance,
      category,
      description,
    });

    if (txErr) {
      console.warn("Failed to insert wallet transaction log:", txErr);
    }

    return NextResponse.json({
      success: true,
      user_id,
      old_balance: currentBalance,
      new_balance,
      diff,
    });
  } catch (err: any) {
    console.error("Admin wallet edit error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update wallet balance." },
      { status: 500 }
    );
  }
}
