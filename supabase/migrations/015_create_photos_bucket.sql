-- ============================================================================
-- BlindSide — Migration 015: Create Storage Bucket for Profile Photos & RLS
-- ============================================================================

-- 1. Create the 'photos' storage bucket if it does not already exist
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- 3. Policy to allow authenticated users to insert/upload their own photos
-- Files must be stored under a path starting with the user's UUID (e.g. 'user_uuid/profile.jpg')
create policy "Allow authenticated uploads to user folders"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos' 
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- 4. Policy to allow users to read/select their own uploaded files
create policy "Allow users to read their own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos' 
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- 5. Policy to allow users to update their own files
create policy "Allow users to update their own files"
  on storage.objects for update
  to authenticated
  with check (
    bucket_id = 'photos' 
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- 6. Policy to allow users to delete their own files
create policy "Allow users to delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos' 
    and split_part(name, '/', 1) = auth.uid()::text
  );
