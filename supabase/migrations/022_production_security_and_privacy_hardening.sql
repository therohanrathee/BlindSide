-- ============================================================================
-- BlindSide — Migration 022: Production Security, Privacy, and RLS Hardening
-- ============================================================================

-- 1. DROP INSECURE USERS SELECT POLICY
-- Matched users should NEVER have direct SELECT access to the full users table
-- because it contains latitude, longitude, personal email, and unshared names.
DROP POLICY IF EXISTS "Users can read their matched user's user record" ON public.users;

-- Ensure users can only read their OWN user record
DROP POLICY IF EXISTS "Users can read their own user record" ON public.users;
CREATE POLICY "Users can read their own user record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 2. SECURE RPC TO FETCH PARTNER DETAILS
-- Returns only non-sensitive data, and respects name/photo sharing consent.
-- Never leaks latitude, longitude, email, or university_email.
CREATE OR REPLACE FUNCTION public.get_match_partner_details(p_match_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_match public.matches%ROWTYPE;
  v_partner_id uuid;
  v_is_user_a boolean;
  v_partner public.users%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_uni_name text;
  v_is_name_shared boolean;
  v_is_photo_shared boolean;
  v_partner_name text;
  v_partner_age integer;
  v_result jsonb;
BEGIN
  -- 1. Verify caller is a participant in this match
  SELECT * INTO v_match
  FROM public.matches
  WHERE id = p_match_id
    AND (user_a_id = auth.uid() OR user_b_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found or unauthorized';
  END IF;

  v_is_user_a := (v_match.user_a_id = auth.uid());
  v_partner_id := CASE WHEN v_is_user_a THEN v_match.user_b_id ELSE v_match.user_a_id END;
  v_is_name_shared := CASE WHEN v_is_user_a THEN v_match.user_b_shares_name ELSE v_match.user_a_shares_name END;
  v_is_photo_shared := CASE WHEN v_is_user_a THEN v_match.user_b_shares_photo ELSE v_match.user_a_shares_photo END;

  -- 2. Fetch partner details
  SELECT * INTO v_partner FROM public.users WHERE id = v_partner_id;
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = v_partner_id;
  
  IF v_partner.university_id IS NOT NULL THEN
    SELECT name INTO v_uni_name FROM public.universities WHERE id = v_partner.university_id;
  END IF;

  -- 3. Calculate Age
  IF v_partner.date_of_birth IS NOT NULL THEN
    v_partner_age := date_part('year', age(v_partner.date_of_birth))::integer;
  ELSE
    v_partner_age := 21;
  END IF;

  -- 4. Mask Name if not shared
  IF v_is_name_shared AND v_partner.first_name IS NOT NULL THEN
    v_partner_name := trim(concat(v_partner.first_name, ' ', COALESCE(v_partner.last_name, '')));
  ELSE
    v_partner_name := 'Your Blind Date';
  END IF;

  -- 5. Build sanitized payload
  v_result := jsonb_build_object(
    'id', v_partner_id,
    'first_name', v_partner_name,
    'raw_first_name', CASE WHEN v_is_name_shared THEN v_partner.first_name ELSE '' END,
    'age', v_partner_age,
    'university_name', COALESCE(v_uni_name, 'Same Campus'),
    'hobbies', COALESCE(v_profile.hobbies, ARRAY[]::text[]),
    'compatibility_score', COALESCE(v_match.compatibility_score, 55),
    'photo_url', CASE WHEN v_is_photo_shared THEN v_profile.photo_url ELSE NULL END,
    'is_name_shared', v_is_name_shared,
    'is_photo_shared', v_is_photo_shared
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_match_partner_details(uuid) TO authenticated;


-- 3. TRIGGER TO PREVENT USER TAMPERING WITH MATCH COLUMNS
-- Ensures User A can only update User A's flags, and User B can only update User B's flags.
CREATE OR REPLACE FUNCTION public.protect_match_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role / postgres (crons, backend admin clients) unrestricted access
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- If User A is updating
  IF auth.uid() = OLD.user_a_id THEN
    -- Ensure User A did NOT change User B's consent or sharing flags or match metadata
    IF NEW.user_b_wants_meet IS DISTINCT FROM OLD.user_b_wants_meet OR
       NEW.user_b_shares_photo IS DISTINCT FROM OLD.user_b_shares_photo OR
       NEW.user_b_shares_name IS DISTINCT FROM OLD.user_b_shares_name OR
       NEW.user_a_id IS DISTINCT FROM OLD.user_a_id OR
       NEW.user_b_id IS DISTINCT FROM OLD.user_b_id OR
       NEW.compatibility_score IS DISTINCT FROM OLD.compatibility_score OR
       NEW.request_a_id IS DISTINCT FROM OLD.request_a_id OR
       NEW.request_b_id IS DISTINCT FROM OLD.request_b_id OR
       NEW.chat_expires_at IS DISTINCT FROM OLD.chat_expires_at THEN
      RAISE EXCEPTION 'Unauthorized column update on match record';
    END IF;
  -- If User B is updating
  ELSIF auth.uid() = OLD.user_b_id THEN
    -- Ensure User B did NOT change User A's consent or sharing flags or match metadata
    IF NEW.user_a_wants_meet IS DISTINCT FROM OLD.user_a_wants_meet OR
       NEW.user_a_shares_photo IS DISTINCT FROM OLD.user_a_shares_photo OR
       NEW.user_a_shares_name IS DISTINCT FROM OLD.user_a_shares_name OR
       NEW.user_a_id IS DISTINCT FROM OLD.user_a_id OR
       NEW.user_b_id IS DISTINCT FROM OLD.user_b_id OR
       NEW.compatibility_score IS DISTINCT FROM OLD.compatibility_score OR
       NEW.request_a_id IS DISTINCT FROM OLD.request_a_id OR
       NEW.request_b_id IS DISTINCT FROM OLD.request_b_id OR
       NEW.chat_expires_at IS DISTINCT FROM OLD.chat_expires_at THEN
      RAISE EXCEPTION 'Unauthorized column update on match record';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unauthorized participant on match update';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_match_updates ON public.matches;
CREATE TRIGGER trg_protect_match_updates
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_match_updates();


-- 4. TRIGGER: AUTO-RELEASE MATCH REQUESTS WHEN MATCH IS DECLINED
-- Prevents permanent deadlock where users cannot search again after unmatching.
CREATE OR REPLACE FUNCTION public.handle_match_declined()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'declined' AND OLD.status <> 'declined' THEN
    -- Update both match requests to expired so neither user gets stuck
    UPDATE public.match_requests
    SET status = 'expired'
    WHERE id IN (NEW.request_a_id, NEW.request_b_id)
      AND status = 'matched';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_match_declined ON public.matches;
CREATE TRIGGER trg_on_match_declined
  AFTER UPDATE OF status ON public.matches
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_match_declined();


-- 5. AUTO-SUSPEND ON 3 REPORTS & PREVENT REPORT SPAMMING
-- Updates increment_reported_count to auto-suspend user on >= 3 reports
CREATE OR REPLACE FUNCTION public.increment_reported_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET reported_count = COALESCE(reported_count, 0) + 1,
      is_suspended = CASE WHEN COALESCE(reported_count, 0) + 1 >= 3 THEN true ELSE is_suspended END
  WHERE id = NEW.reported_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a unique constraint to prevent one user from spamming multiple reports on the same match
ALTER TABLE public.reports 
  DROP CONSTRAINT IF EXISTS unique_reporter_reported_match;

ALTER TABLE public.reports 
  ADD CONSTRAINT unique_reporter_reported_match UNIQUE (reporter_id, reported_id, match_id);
