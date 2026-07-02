-- Enable INSERT, UPDATE, and DELETE for confirmed_dates by matched users

create policy "Users can insert confirmed dates for their matches"
  on public.confirmed_dates for insert
  with check (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can update confirmed dates for their matches"
  on public.confirmed_dates for update
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can delete confirmed dates for their matches"
  on public.confirmed_dates for delete
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );
