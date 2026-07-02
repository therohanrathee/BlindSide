-- ============================================================================
-- BlindSide — Migration 017: Fix Storage Read Policy for Matched Users
-- Allow users to read their own profile photo OR the photo of their match
-- IF AND ONLY IF their match has enabled the photo sharing toggle.
-- ============================================================================

-- 1. Drop the old restrictive select policy
drop policy if exists "Allow users to read their own files" on storage.objects;
drop policy if exists "Allow users to read their own or match files" on storage.objects;

-- 2. Recreate the policy enforcing match status and user-consented sharing toggle
create policy "Allow users to read their own or shared match files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or exists (
        select 1 from public.matches m
        where (
          m.user_a_id = auth.uid() 
          and m.user_b_id::text = split_part(storage.objects.name, '/', 1)
          and m.user_b_shares_photo = true
        )
        or (
          m.user_b_id = auth.uid() 
          and m.user_a_id::text = split_part(storage.objects.name, '/', 1)
          and m.user_a_shares_photo = true
        )
      )
    )
  );
