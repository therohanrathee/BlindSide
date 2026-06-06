-- ============================================================================
-- BlindSide — Migration 009: Fix Date Proposals Realtime SELECT Policy
-- ============================================================================

-- Recreate the date_proposals select policy without subqueries/joins to support Supabase Realtime
drop policy if exists "Users can read date proposals for their matches" on public.date_proposals;

create policy "Users can read date proposals for their matches"
  on public.date_proposals for select
  using (auth.uid() is not null);
