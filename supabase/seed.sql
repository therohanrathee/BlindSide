-- ============================================
-- BlindSide Seed Data — Universities
-- ============================================

insert into public.universities (name, email_domain, city, state) values
  ('K.R. Mangalam University', 'krmu.edu.in', 'Gurugram', 'Haryana')
on conflict (email_domain) do nothing;
