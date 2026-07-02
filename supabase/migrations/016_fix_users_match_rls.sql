-- ============================================================================
-- BlindSide — Migration 016: Fix Matched User RLS Policy Ambiguity
-- ============================================================================

-- Drop the old policy that suffered from column shadowing
drop policy if exists "Users can read their matched user's user record" on public.users;

-- Create the fixed policy qualifying outer table users.id to prevent shadowing from matches.id
create policy "Users can read their matched user's user record"
  on public.users for select
  using (
    exists (
      select 1 from public.matches m
      where (m.user_a_id = auth.uid() and m.user_b_id = public.users.id)
         or (m.user_b_id = auth.uid() and m.user_a_id = public.users.id)
    )
  );
