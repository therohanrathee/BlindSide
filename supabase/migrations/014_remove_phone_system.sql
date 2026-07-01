-- ============================================================================
-- BlindSide — Migration 014: Remove Phone/SMS System from Database Schema
-- ============================================================================

-- 1. Drop phone-related columns from public.users table
alter table public.users drop column if exists phone cascade;
alter table public.users drop column if exists is_phone_verified cascade;

-- 2. Drop phone column from public.otp_verifications table
alter table public.otp_verifications drop column if exists phone cascade;

-- 3. Drop mobile_no column from public.onboarding_leads table
alter table public.onboarding_leads drop column if exists mobile_no cascade;
