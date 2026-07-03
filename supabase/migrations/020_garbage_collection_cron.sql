-- ============================================================================
-- BlindSide — Migration 020: Garbage Collection Cron
-- ============================================================================

-- Ensure pg_cron is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a daily garbage collection job to run at 4:00 AM UTC
SELECT cron.schedule(
  'blindside-daily-garbage-collection',
  '0 4 * * *',
  $$
    -- 1. Delete used or expired OTPs
    DELETE FROM public.otp_verifications 
    WHERE is_used = true OR expires_at < now();
    
    -- 2. Delete used or expired password reset tokens
    DELETE FROM public.password_reset_tokens 
    WHERE is_used = true OR expires_at < now();
    
    -- 3. Delete messages for any match that has been marked as expired
    DELETE FROM public.messages 
    WHERE match_id IN (
        SELECT id FROM public.matches WHERE status = 'expired'
    );
  $$
);
