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
