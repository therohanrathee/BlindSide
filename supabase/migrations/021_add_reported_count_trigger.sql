-- ============================================================================
-- Add reported_count to users and create a trigger to auto-increment it
-- ============================================================================

-- Add reported_count to public.users
ALTER TABLE public.users ADD COLUMN reported_count integer DEFAULT 0 NOT NULL;

-- Create the trigger function
CREATE OR REPLACE FUNCTION increment_reported_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET reported_count = COALESCE(reported_count, 0) + 1
  WHERE id = NEW.reported_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_report_inserted
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE PROCEDURE increment_reported_count();
