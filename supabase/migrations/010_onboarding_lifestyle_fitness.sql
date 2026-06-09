-- ============================================================================
-- BlindSide — Migration 010: Add Lifestyle Preferences and Fitness Levels
-- ============================================================================

-- 1. Update profiles table constraints and columns

-- 1.1 Dietary
alter table public.profiles drop constraint if exists profiles_dietary_check;
alter table public.profiles add constraint profiles_dietary_check check (dietary in ('veg', 'nonveg', 'vegan', 'eggetarian', 'pescatarian', 'no_preference'));

-- 1.2 Drinking (Drop first, migrate data, then add new constraint)
alter table public.profiles drop constraint if exists profiles_drinking_check;

update public.profiles
set drinking = case drinking
  when 'yes' then 'socially'
  when 'sometimes' then 'occasionally'
  when 'no' then 'sober'
  else 'sober'
end;

alter table public.profiles add constraint profiles_drinking_check check (drinking in ('sober', 'occasionally', 'socially', 'regularly'));

-- 1.3 Smoking (Drop first, migrate data, then add new constraint)
alter table public.profiles drop constraint if exists profiles_smoking_check;

update public.profiles
set smoking = case smoking
  when 'yes' then 'socially'
  when 'sometimes' then 'occasionally'
  when 'no' then 'non_smoker'
  else 'non_smoker'
end;

alter table public.profiles add constraint profiles_smoking_check check (smoking in ('non_smoker', 'occasionally', 'socially', 'regularly'));

-- 1.4 Fitness (New Column)
alter table public.profiles add column if not exists fitness text default 'not_active'::text not null;
alter table public.profiles drop constraint if exists profiles_fitness_check;
alter table public.profiles add constraint profiles_fitness_check check (fitness in ('not_active', 'occasionally', 'active', 'gym_rat'));


-- 2. Update onboarding_leads table to store all information
alter table public.onboarding_leads add column if not exists dietary text;
alter table public.onboarding_leads add column if not exists drinking text;
alter table public.onboarding_leads add column if not exists smoking text;
alter table public.onboarding_leads add column if not exists fitness text;

