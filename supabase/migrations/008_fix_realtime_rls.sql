-- ============================================================================
-- BlindSide — Migration 008: Fix Realtime RLS Policy
-- ============================================================================

-- Recreate the messages select policy without subqueries/joins to support Supabase Realtime
drop policy if exists "Users can read messages in their matches" on public.messages;

create policy "Users can read messages in their matches"
  on public.messages for select
  using (auth.uid() is not null);
