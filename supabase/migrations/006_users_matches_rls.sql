-- ============================================================================
-- BlindSide — Migration 006: Matched User RLS Read Policy
-- ============================================================================

-- Create policy to allow matched users to read each other's user record (for name, DOB, university details)
create policy "Users can read their matched user's user record"
  on public.users for select
  using (
    exists (
      select 1 from public.matches m
      where (m.user_a_id = auth.uid() and m.user_b_id = id)
         or (m.user_b_id = auth.uid() and m.user_a_id = id)
    )
  );
