-- ============================================================================
-- BlindSide — Migration 005: Add Last Name to Users Table
-- ============================================================================

-- Add last_name column to public.users table
alter table public.users add column if not exists last_name text;
