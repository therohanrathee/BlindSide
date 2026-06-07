-- ==================== migrations/001_initial_master_query.sql ====================
-- ============================================================================
-- BlindSide — Initial SQL Master Query
-- Schema, Triggers, and Row Level Security (RLS) Policies
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. SCHEMA TABLES
-- ============================================

-- 1.1 Universities Table
create table public.universities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email_domain text not null unique,
  city text not null,
  state text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.2 Users Table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  first_name text,
  date_of_birth date,
  height_cm numeric(5,2),
  height_unit_pref text default 'ft'::text not null check (height_unit_pref in ('ft', 'cm')),
  gender text check (gender in ('male', 'female', 'nonbinary')),
  university_id uuid references public.universities on delete set null,
  university_email text,
  is_university_verified boolean default false not null,
  is_first_match_used boolean default false not null,
  is_onboarding_complete boolean default false not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_suspended boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.3 Profiles Table (Lifestyle Details)
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  hobbies text[] not null default '{}'::text[],
  relationship_intent text check (relationship_intent in ('casual', 'serious', 'open')),
  dietary text default 'no_preference'::text not null check (dietary in ('veg', 'nonveg', 'vegan', 'no_preference')),
  drinking text default 'no'::text not null check (drinking in ('yes', 'sometimes', 'no')),
  smoking text default 'no'::text not null check (smoking in ('yes', 'sometimes', 'no')),
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.4 Wallets Table
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  balance numeric(10,2) default 0.00 not null check (balance >= 0),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.5 Wallet Transactions Table (Append-Only Ledger)
create table public.wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references public.wallets on delete cascade not null,
  direction text not null check (direction in ('credit', 'debit')),
  amount numeric(10,2) not null check (amount > 0),
  balance_after numeric(10,2) not null check (balance_after >= 0),
  category text not null check (category in ('wallet_topup', 'match_payment', 'razorpay_direct', 'no_match_credit', 'promo_credit', 'admin_credit', 'admin_debit')),
  description text,
  reference_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.6 Match Requests Table
create table public.match_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  scope text not null check (scope in ('university', 'city')),
  fee_paid numeric(10,2) not null check (fee_paid >= 0),
  payment_method text not null check (payment_method in ('wallet', 'razorpay')),
  pref_gender text not null check (pref_gender in ('male', 'female', 'everyone')),
  pref_age_min integer not null check (pref_age_min >= 18),
  pref_age_max integer not null check (pref_age_max >= pref_age_min),
  pref_height_min_cm numeric(5,2),
  pref_height_max_cm numeric(5,2) check (pref_height_max_cm >= pref_height_min_cm),
  pref_dietary text default 'no_preference'::text not null check (pref_dietary in ('veg', 'nonveg', 'vegan', 'no_preference')),
  pref_drinking text default 'no_preference'::text not null check (pref_drinking in ('yes', 'no', 'no_preference')),
  pref_smoking text default 'no_preference'::text not null check (pref_smoking in ('yes', 'no', 'no_preference')),
  status text default 'active'::text not null check (status in ('active', 'matched', 'expired', 'credited')),
  matched_at timestamp with time zone,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.7 Matches Table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  request_a_id uuid references public.match_requests not null,
  request_b_id uuid references public.match_requests not null,
  user_a_id uuid references public.users not null,
  user_b_id uuid references public.users not null,
  compatibility_score integer not null check (compatibility_score >= 0 and compatibility_score <= 100),
  user_a_wants_meet boolean default false not null,
  user_b_wants_meet boolean default false not null,
  status text default 'active'::text not null check (status in ('active', 'date_planned', 'date_confirmed', 'completed', 'expired', 'declined')),
  chat_expires_at timestamp with time zone not null,
  matched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.8 Date Proposals Table
create table public.date_proposals (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  proposed_by uuid references public.users not null,
  proposed_date date not null,
  proposed_time time without time zone not null,
  location_text text not null,
  google_maps_url text not null,
  status text default 'pending'::text not null check (status in ('pending', 'approved', 'edited', 'superseded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.9 Confirmed Dates Table
create table public.confirmed_dates (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade unique not null,
  date_proposal_id uuid references public.date_proposals not null,
  date_time timestamp with time zone not null,
  location_text text not null,
  google_maps_url text not null,
  photo_revealed boolean default false not null,
  reveal_sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.10 Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  sender_id uuid references public.users, -- Null represents system messages
  type text default 'text'::text not null check (type in ('text', 'system', 'meet_toggle', 'date_proposal', 'date_confirmed')),
  content text not null,
  is_flagged boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.11 Feedback Table
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  user_id uuid references public.users not null,
  attended boolean not null,
  vibe_rating integer check (vibe_rating >= 1 and vibe_rating <= 5),
  conversation_rating integer check (conversation_rating >= 1 and conversation_rating <= 5),
  would_meet_again text check (would_meet_again in ('yes', 'maybe', 'no')),
  free_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.12 Payments Table
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users not null,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(10,2) not null check (amount > 0),
  purpose text not null check (purpose in ('match_payment', 'wallet_topup')),
  status text default 'created'::text not null check (status in ('created', 'paid', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.13 OTP Verifications Table
create table public.otp_verifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  email text not null,
  otp_hash text not null,
  attempts integer default 0 not null check (attempts >= 0 and attempts <= 3),
  expires_at timestamp with time zone not null,
  is_used boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.14 User Blocks Table
create table public.user_blocks (
  id uuid default gen_random_uuid() primary key,
  blocker_id uuid references public.users on delete cascade not null,
  blocked_id uuid references public.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (blocker_id, blocked_id)
);

-- 1.15 Reports Table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.users on delete cascade not null,
  reported_id uuid references public.users on delete cascade not null,
  match_id uuid references public.matches on delete set null,
  category text not null check (category in ('harassment', 'fake_profile', 'no_show', 'inappropriate_messages')),
  description text,
  status text default 'pending'::text not null check (status in ('pending', 'reviewed', 'action_taken', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.16 Push Subscriptions Table
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ============================================
-- 2. AUTOMATED USER & WALLET PROVISIONING TRIGGERS
-- ============================================

-- Trigger function to provision public user profile and wallet when auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert public user record
  insert into public.users (id, email)
  values (new.id, new.email);

  -- 2. Insert user wallet record
  insert into public.wallets (user_id, balance)
  values (new.id, 0.00);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution setup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.universities enable row level security;
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.match_requests enable row level security;
alter table public.matches enable row level security;
alter table public.date_proposals enable row level security;
alter table public.confirmed_dates enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;
alter table public.payments enable row level security;
alter table public.otp_verifications enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;
alter table public.push_subscriptions enable row level security;

-- 3.1 Universities Policies
create policy "Universities are readable by everyone"
  on public.universities for select
  using (true);

-- 3.2 Users Policies
create policy "Users can read their own user record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own user record"
  on public.users for update
  using (auth.uid() = id);

-- 3.3 Profiles Policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can read their matched user's profile info"
  on public.profiles for select
  using (
    exists (
      select 1 from public.matches m
      where (m.user_a_id = auth.uid() and m.user_b_id = user_id)
         or (m.user_b_id = auth.uid() and m.user_a_id = user_id)
    )
  );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- 3.4 Wallets Policies
create policy "Users can read their own wallet"
  on public.wallets for select
  using (auth.uid() = user_id);

-- 3.5 Wallet Transactions Policies
create policy "Users can read their own transactions"
  on public.wallet_transactions for select
  using (
    exists (
      select 1 from public.wallets w
      where w.id = wallet_id and w.user_id = auth.uid()
    )
  );

-- 3.6 Match Requests Policies
create policy "Users can read their own match requests"
  on public.match_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own match requests"
  on public.match_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own active match requests"
  on public.match_requests for update
  using (auth.uid() = user_id);

-- 3.7 Matches Policies
create policy "Users can read matches they are part of"
  on public.matches for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can update their meet consent toggles in active matches"
  on public.matches for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- 3.8 Date Proposals Policies
create policy "Users can read date proposals for their matches"
  on public.date_proposals for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can create date proposals for their matches"
  on public.date_proposals for insert
  with check (
    proposed_by = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can update date proposals for their matches"
  on public.date_proposals for update
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- 3.9 Confirmed Dates Policies
create policy "Users can read confirmed dates they are part of"
  on public.confirmed_dates for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- 3.10 Messages Policies
create policy "Users can read messages in their matches"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can send messages in their matches"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- 3.11 Feedback Policies
create policy "Users can read their own feedback entries"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert feedback for their matches"
  on public.feedback for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- 3.12 Payments Policies
create policy "Users can read their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- 3.13 OTP Verifications Policies
create policy "Users can read their own OTP verifications"
  on public.otp_verifications for select
  using (auth.uid() = user_id);

-- 3.14 User Blocks Policies
create policy "Users can read their own blocks"
  on public.user_blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can block other users"
  on public.user_blocks for insert
  with check (auth.uid() = blocker_id);

-- 3.15 Reports Policies
create policy "Users can view reports they submitted"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Users can submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- 3.16 Push Subscriptions Policies
create policy "Users can manage their own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can create push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- ==================== migrations/002_unified_auth_changes.sql ====================
-- ============================================================================
-- BlindSide — Migration 002: Unified Auth & Onboarding Updates
-- ============================================================================

-- 1. Add phone and weight columns to public.users
alter table public.users add column if not exists phone text unique;
alter table public.users add column if not exists is_phone_verified boolean default false not null;
alter table public.users add column if not exists weight_kg numeric(5,2);

-- 2. Modify check constraint on public.match_requests status to allow 'unpaid' state
alter table public.match_requests drop constraint if exists match_requests_status_check;
alter table public.match_requests add constraint match_requests_status_check check (status in ('unpaid', 'active', 'matched', 'expired', 'credited'));

-- ==================== migrations/003_onboarding_leads_table.sql ====================
-- Create onboarding_leads table for lead generation and marketing analytics
create table public.onboarding_leads (
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

-- Enable RLS (Row Level Security)
alter table public.onboarding_leads enable row level security;

-- No public policies created, meaning only the service role / admin has read/write privileges.

-- ==================== migrations/004_fix_otp_constraints_and_leads.sql ====================
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

-- ==================== migrations/005_add_last_name_to_users.sql ====================
-- ============================================================================
-- BlindSide — Migration 005: Add Last Name to Users Table
-- ============================================================================

-- Add last_name column to public.users table
alter table public.users add column if not exists last_name text;

-- ==================== migrations/006_users_matches_rls.sql ====================
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

-- ==================== migrations/007_enable_realtime.sql ====================
-- ============================================================================
-- BlindSide — Migration 007: Enable Realtime
-- ============================================================================

-- Enable Realtime for messages, matches, and date_proposals tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.date_proposals;

-- ==================== migrations/008_fix_realtime_rls.sql ====================
-- ============================================================================
-- BlindSide — Migration 008: Fix Realtime RLS Policy
-- ============================================================================

-- Recreate the messages select policy without subqueries/joins to support Supabase Realtime
drop policy if exists "Users can read messages in their matches" on public.messages;

create policy "Users can read messages in their matches"
  on public.messages for select
  using (auth.uid() is not null);

-- ==================== migrations/009_fix_date_proposals_realtime.sql ====================
-- ============================================================================
-- BlindSide — Migration 009: Fix Date Proposals Realtime SELECT Policy
-- ============================================================================

-- Recreate the date_proposals select policy without subqueries/joins to support Supabase Realtime
drop policy if exists "Users can read date proposals for their matches" on public.date_proposals;

create policy "Users can read date proposals for their matches"
  on public.date_proposals for select
  using (auth.uid() is not null);

-- ==================== seed.sql ====================
-- ============================================
-- BlindSide Seed Data — Universities
-- ============================================

insert into public.universities (name, email_domain, city, state) values
  ('K.R. Mangalam University', 'krmu.edu.in', 'Gurugram', 'Haryana')
on conflict (email_domain) do nothing;

