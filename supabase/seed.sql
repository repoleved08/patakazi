-- Dummy seed: company + job + profile + saved + application
INSERT INTO companies (id, name, slug, description, website, industry, size, founded, location, logo_id, owner_id, verified, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Patakazi Labs',
  'patakazi-labs',
  'A small tech consultancy building agent-native job boards.',
  'https://patakazi.example',
  'technology',
  'just_me',
  2024,
  'Berlin',
  '',
  '22222222-2222-2222-2222-222222222222',
  true,
  now(),
  now()
);

INSERT INTO jobs (id, title, slug, description, company_id, company_name, company_slug, company_logo_id, location, workplace_type, employment_type, seniority, salary_min, salary_max, salary_currency, salary_period, salary_visible, skills, tags, apply_url, apply_email, status, published_at, expires_at, views, featured, created_by, search_vector, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Senior Frontend Engineer',
  'senior-frontend-engineer',
  'Build public-facing product surfaces for AI agents and human candidates.',
  '11111111-1111-1111-1111-111111111111',
  'Patakazi Labs',
  'patakazi-labs',
  '',
  'Berlin / Remote',
  'hybrid',
  'full_time',
  'senior',
  80000,
  120000,
  'USD',
  'year',
  true,
  ARRAY['nuxt','typescript','sql'],
  ARRAY['agent-ready','open-source'],
  'https://patakazi.example/apply',
  '',
  'published',
  now(),
  now() + interval '90 days',
  42,
  false,
  '22222222-2222-2222-2222-222222222222',
  to_tsvector('english', 'Senior Frontend Engineer Patakazi Labs'),
  now(),
  now()
);

INSERT INTO profiles (id, user_id, full_name, headline, summary, location, skills, resume_id, portfolio_url, linkedin_url, open_to_work, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Jordan Demo',
  'Founder / Engineer',
  'Building agent-native surfaces.',
  'Berlin',
  ARRAY['nuxt','typescript','supabase'],
  '',
  'https://portfolio.example',
  '',
  true,
  now(),
  now()
);

INSERT INTO saved_jobs (id, user_id, job_id, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  now()
);
