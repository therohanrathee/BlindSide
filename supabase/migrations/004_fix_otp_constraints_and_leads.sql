-- ============================================================================
-- BlindSide — Migration 004: Fix OTP Constraints and Ensure Leads Table
-- ============================================================================

-- 1. Safely update users table
alter table public.users add column if not exists phone text unique;
alter table public.users add column if not exists is_phone_verified boolean default false not null;
alter table public.users add column if not exists weight_kg numeric(5,2);

-- 2. Safely update match_requests check constraint
alter table public.match_requests drop constraint if exists match_requests_status_check;
alter table public.match_requests add constraint match_requests_status_check check (status in ('unpaid', 'active', 'matched', 'expired', 'credited'));

-- 3. Safely update otp_verifications for phone OTPs (dropping NOT NULL from both user_id and email)
alter table public.otp_verifications alter column user_id drop not null;
alter table public.otp_verifications alter column email drop not null;
alter table public.otp_verifications add column if not exists phone text;

-- 4. Safely create onboarding_leads table if it doesn't exist yet
create table if not exists public.onboarding_leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete set null,
  full_name text,
  personal_email text,
  mobile_no text,
  hobbies text[],
  date_of_birth date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  gender text,
  university_email text,
  university_name text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  ip_address text,
  user_agent text,
  device_os text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely enable RLS
alter table public.onboarding_leads enable row level security;
