import { SupabaseClient } from "@supabase/supabase-js";

export const FIRST_MATCH_PRICE = 49.0;
export const STANDARD_MATCH_PRICE = 69.0;

export interface FirstMatchCheckResult {
  isFirstMatch: boolean;
  price: number;
}

/**
 * Checks whether a user is eligible for the introductory first-match discount (₹49).
 * A user is eligible UNLESS they have actually received a match previously.
 * 
 * Expired searches (no match found within 7 days) and canceled searches do NOT consume
 * the discount, ensuring refunded users can retry without paying the standard fee.
 *
 * Checks three robust ground truths:
 * 1. public.users.is_first_match_used flag
 * 2. public.matches record count (where user is user_a_id or user_b_id)
 * 3. public.match_requests with status = 'matched'
 */
export async function getMatchPricingForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<FirstMatchCheckResult> {
  const [userRes, matchesRes, matchedReqsRes] = await Promise.all([
    supabase
      .from("users")
      .select("is_first_match_used")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`),
    supabase
      .from("match_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "matched"),
  ]);

  const hasUsedFirstMatch =
    Boolean(userRes.data?.is_first_match_used) ||
    (matchesRes.count !== null && matchesRes.count > 0) ||
    (matchedReqsRes.count !== null && matchedReqsRes.count > 0);

  const isFirstMatch = !hasUsedFirstMatch;
  const price = isFirstMatch ? FIRST_MATCH_PRICE : STANDARD_MATCH_PRICE;

  return { isFirstMatch, price };
}
