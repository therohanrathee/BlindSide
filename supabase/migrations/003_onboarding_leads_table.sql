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
