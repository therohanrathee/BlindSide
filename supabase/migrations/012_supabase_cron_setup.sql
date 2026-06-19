-- ============================================================================
-- BlindSide — Migration 012: Supabase pg_cron + pg_net scheduling configuration
-- ============================================================================

-- 1. Enable required extensions in Supabase
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Schedule Fast Match Cron (runs every 10 minutes)
-- NOTE: Replace 'your-vercel-domain.vercel.app' with your actual Vercel deployment domain!
select cron.schedule(
  'blindside-fast-cron',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://your-vercel-domain.vercel.app/api/cron/fast',
    headers := jsonb_build_object('Authorization', 'Bearer datwe2-nixvip-pArwis')
  );
  $$
);

-- 3. Schedule Hourly Expiry Cron (runs every hour)
-- NOTE: Replace 'your-vercel-domain.vercel.app' with your actual Vercel deployment domain!
select cron.schedule(
  'blindside-hourly-cron',
  '0 * * * *',
  $$
  select net.http_get(
    url := 'https://your-vercel-domain.vercel.app/api/cron/hourly',
    headers := jsonb_build_object('Authorization', 'Bearer datwe2-nixvip-pArwis')
  );
  $$
);
