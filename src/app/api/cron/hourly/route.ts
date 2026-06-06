import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Security check for production Vercel cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isLocal = process.env.NODE_ENV === "development" || !cronSecret;

    if (!isLocal && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    console.log("Starting BlindSide hourly cron (request expiry + chat expiry)...");

    const now = new Date().toISOString();

    // 1. Request Expiration (Active match requests > 7 days)
    const { data: expiredReqs, error: reqsError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("status", "active")
      .lt("expires_at", now);

    if (reqsError) {
      console.error("Error fetching expired match requests:", reqsError);
    }

    let requestsExpiredCount = 0;
    if (expiredReqs && expiredReqs.length > 0) {
      for (const req of expiredReqs) {
        const feePaid = parseFloat(req.fee_paid) || 0;

        // Fetch user's wallet to process credit
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", req.user_id)
          .single();

        if (walletError || !wallet) {
          console.error(`Wallet not found for user ${req.user_id} during request expiry.`);
          continue;
        }

        const currentBalance = parseFloat(wallet.balance) || 0;
        const newBalance = currentBalance + feePaid;

        if (feePaid > 0) {
          // Log refund in transaction ledger
          const { error: txError } = await supabase.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            direction: "credit",
            amount: feePaid,
            balance_after: newBalance,
            category: "no_match_credit",
            description: "Refund for Expired Campus Search",
            reference_id: req.id,
          });

          if (txError) {
            console.error(`Failed to log transaction for request ${req.id} refund:`, txError);
            continue;
          }
        }

        // Update wallet balance
        await supabase
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id);

        // Update match request status to credited
        await supabase
          .from("match_requests")
          .update({ status: "credited" })
          .eq("id", req.id);

        requestsExpiredCount++;
        console.log(`Refunded and expired active request ${req.id} for user ${req.user_id}. Amount: ₹${feePaid}.`);
      }
    }

    // 2. Chat Expiration (Matches active but chat_expires_at passed)
    const { data: expiredMatches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "active")
      .lt("chat_expires_at", now);

    if (matchesError) {
      console.error("Error fetching expired matches:", matchesError);
    }

    let matchesExpiredCount = 0;
    if (expiredMatches && expiredMatches.length > 0) {
      for (const match of expiredMatches) {
        // Update match status to expired
        const { error: matchUpdateErr } = await supabase
          .from("matches")
          .update({ status: "expired" })
          .eq("id", match.id);

        if (matchUpdateErr) {
          console.error(`Failed to update match ${match.id} to expired:`, matchUpdateErr);
          continue;
        }

        // Update both requests status to expired so they don't block subsequent search requests
        await supabase
          .from("match_requests")
          .update({ status: "expired" })
          .in("id", [match.request_a_id, match.request_b_id]);

        // Insert chat warning system message
        await supabase.from("messages").insert({
          match_id: match.id,
          sender_id: null,
          type: "system",
          content: "⌛ The 48-hour chat window has expired. This match is now closed.",
        });

        matchesExpiredCount++;
        console.log(`Expired chat window for match ${match.id}.`);
      }
    }

    return NextResponse.json({
      success: true,
      requestsRefunded: requestsExpiredCount,
      matchesExpired: matchesExpiredCount,
    });
  } catch (err: any) {
    console.error("Error in hourly cron handler:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
