-- ============================================================================
-- BlindSide — Migration 011: Add new Drinking and Smoking preference options
-- ============================================================================

-- 1. Alter pref_drinking check constraint in match_requests table
alter table public.match_requests drop constraint if exists match_requests_pref_drinking_check;
alter table public.match_requests add constraint match_requests_pref_drinking_check check (pref_drinking in ('yes', 'no', 'socially', 'no_preference'));

-- 2. Alter pref_smoking check constraint in match_requests table
alter table public.match_requests drop constraint if exists match_requests_pref_smoking_check;
alter table public.match_requests add constraint match_requests_pref_smoking_check check (pref_smoking in ('yes', 'no', 'regular', 'casual', 'no_preference'));
