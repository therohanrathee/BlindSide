-- ============================================================================
-- BlindSide — Migration 017: Fix Storage Read Policy for Matched Users
-- Allow users to read their own profile photo OR the photo of their active match.
-- ============================================================================

-- 1. Drop the old restrictive select policy
drop policy if exists "Allow users to read their own files" on storage.objects;

-- 2. Recreate the policy to check matching user folder ownership in active matches
create policy "Allow users to read their own or match files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or exists (
        select 1 from public.matches m
        where (m.user_a_id = auth.uid() and m.user_b_id::text = split_part(storage.objects.name, '/', 1))
           or (m.user_b_id = auth.uid() and m.user_a_id::text = split_part(storage.objects.name, '/', 1))
      )
    )
  );
