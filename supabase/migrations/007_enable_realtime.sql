-- ============================================================================
-- BlindSide — Migration 007: Enable Realtime
-- ============================================================================

-- Enable Realtime for messages, matches, and date_proposals tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.date_proposals;
