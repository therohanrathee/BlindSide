-- ============================================================================
-- BlindSide — Migration 013: Bounced Emails Suppression Table
-- ============================================================================

-- Create bounced_emails table to log bounced addresses and complaints
create table if not exists public.bounced_emails (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  bounce_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.bounced_emails enable row level security;

-- Index on email for fast lookups during registration checks
create index if not exists bounced_emails_email_idx on public.bounced_emails(email);

comment on table public.bounced_emails is 'Stores email addresses that have bounced or registered complaints via AWS SES/SNS webhook to prevent sending to them again.';
comment on column public.bounced_emails.email is 'The normalized (lowercase, trimmed) email address that bounced or complained.';
comment on column public.bounced_emails.bounce_type is 'The type of event (e.g., Permanent Bounce, Complaint, or custom SNS type).';
