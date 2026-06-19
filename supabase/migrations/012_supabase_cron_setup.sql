-- ============================================================================
-- BlindSide — Migration 012: Supabase pg_cron + pg_net scheduling configuration
-- ============================================================================

-- 1. Enable required extensions in Supabase
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Schedule Fast Match Cron (runs every 10 minutes)

select cron.schedule(
  'blindside-fast-cron',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://blind-side-silk.vercel.app/api/cron/fast',
    headers := jsonb_build_object('Authorization', 'Bearer datwe2-nixvip-pArwis')
  );
  $$
);

-- 3. Schedule Hourly Expiry Cron (runs every hour)

select cron.schedule(
  'blindside-hourly-cron',
  '0 * * * *',
  $$
  select net.http_get(
    url := 'https://blind-side-silk.vercel.app/api/cron/hourly',
    headers := jsonb_build_object('Authorization', 'Bearer datwe2-nixvip-pArwis')
  );
  $$
);
