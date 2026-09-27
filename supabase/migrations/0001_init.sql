-- ===========================================================================
-- Job board schema.
--
-- Apply with `supabase db push` (or paste into the SQL editor). Everything the
-- app needs lives here: tables, indexes, row-level security and storage.
--
-- Two things are deliberate and worth knowing before you edit:
--
--  1. Storage columns are snake_case, and `server/mappers/row-mappers.ts` is the
--     only place that converts them to the camelCase DTOs the client sees.
--  2. The server talks to Postgres with the service-role key, which BYPASSES
--     RLS. These policies are therefore the security boundary for *direct
--     browser* access, and the ownership checks in `server/services/` remain
--     the boundary for requests through our own API. Both matter.
-- ===========================================================================

create extension if not exists pgcrypto;

-- --- Enumerated value sets -------------------------------------------------
-- These mirror the constants in `shared/constants/job.ts`. They are CHECK
-- constraints rather than Postgres enums so a new value is an ordinary
-- migration instead of an ALTER TYPE that cannot run inside a transaction.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (char_length(slug) between 1 and 120),
  website text not null default '',
  description text not null default '',
  industry text not null default '',
  size text not null default '' check (size in (
    '', 'just_me', '2_10', '11_50', '51_200', '201_500', '501_1000',
    '1001_5000', '5000_plus'
  )),
  founded integer not null default 0 check (founded between 0 and 2100),
  location text not null default '',
  -- Storage object key in the `media` bucket, not a bare URL.
  logo_id text not null default '',
  -- Supabase auth.users id of the account that claimed this company.
  owner_id uuid references auth.users (id) on delete set null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (char_length(slug) between 1 and 120),
  description text not null default '',
  company_id uuid not null references companies (id) on delete cascade,
  -- Denormalised so a job card renders without a second round trip. Kept in
  -- sync by `server/services/job.service.ts`.
  company_name text not null default '',
  company_slug text not null default '',
  company_logo_id text not null default '',
  location text not null default '',
  workplace_type text not null check (workplace_type in ('remote', 'hybrid', 'onsite')),
  employment_type text not null check (employment_type in (
    'full_time', 'part_time', 'contract', 'internship', 'temporary', 'volunteer'
  )),
  seniority text not null default '' check (seniority in (
    '', 'internship', 'junior', 'mid', 'senior', 'staff', 'principal', 'lead', 'director'
  )),
  salary_min integer not null default 0 check (salary_min >= 0),
  salary_max integer not null default 0 check (salary_max >= 0),
  salary_currency text not null default 'USD' check (char_length(salary_currency) = 3),
  salary_period text not null default 'year' check (salary_period in ('year', 'month', 'hour')),
  salary_visible boolean not null default false,
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  apply_url text not null default '',
  apply_email text not null default '',
  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'published', 'closed', 'rejected'
  )),
  published_at timestamptz,
  expires_at timestamptz,
  views integer not null default 0 check (views >= 0),
  featured boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  -- Maintained by the `search_jobs` trigger below.
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  -- Null for anonymous applicants: candidates may apply without an account.
  applicant_id uuid references auth.users (id) on delete set null,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  resume_id text not null default '',
  cover_note text not null default '',
  status text not null default 'submitted' check (status in (
    'submitted', 'reviewing', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  summary text not null default '',
  location text not null default '',
  skills text[] not null default '{}',
  resume_id text not null default '',
  portfolio_url text not null default '',
  linkedin_url text not null default '',
  open_to_work boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- Triggers --------------------------------------------------------------

-- `updated_at` is maintained in the database so no client can forget it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Weighted search vector. Weights run title/company (A) > location (B) >
-- skills (C) > description (D), so a title match always outranks a body match.
--
-- This runs as a trigger rather than a GENERATED column because
-- `array_to_string` is only STABLE, and generated columns require IMMUTABLE.
create or replace function public.search_jobs()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
      setweight(to_tsvector('english', coalesce(new.title, '')), 'A')
   || setweight(to_tsvector('english', coalesce(new.company_name, '')), 'A')
   || setweight(to_tsvector('english', coalesce(new.location, '')), 'B')
   || setweight(to_tsvector('english', coalesce(array_to_string(new.skills, ' '), '')), 'C')
   || setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '') || ' ' || coalesce(new.description, '')), 'D');
  return new;
end;
$$;

drop trigger if exists jobs_search_trigger on jobs;
create trigger jobs_search_trigger
  before insert or update of title, company_name, location, skills, tags, description
  on jobs
  for each row execute function public.search_jobs();

drop trigger if exists companies_touch_trigger on companies;
create trigger companies_touch_trigger
  before update on companies
  for each row execute function public.touch_updated_at();

drop trigger if exists jobs_touch_trigger on jobs;
create trigger jobs_touch_trigger
  before update on jobs
  for each row execute function public.touch_updated_at();

drop trigger if exists applications_touch_trigger on applications;
create trigger applications_touch_trigger
  before update on applications
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch_trigger on profiles;
create trigger profiles_touch_trigger
  before update on profiles
  for each row execute function public.touch_updated_at();

-- --- Indexes ---------------------------------------------------------------

create index if not exists companies_name_idx on companies (name);
create index if not exists companies_owner_idx on companies (owner_id);

-- The default public listing is "published, newest first", optionally expired.
create index if not exists jobs_status_published_at_idx on jobs (status, published_at desc);
create index if not exists jobs_status_company_idx on jobs (status, company_id);
create index if not exists jobs_status_workplace_idx on jobs (status, workplace_type);
create index if not exists jobs_status_employment_idx on jobs (status, employment_type);
create index if not exists jobs_created_by_idx on jobs (created_by);
create index if not exists jobs_company_id_idx on jobs (company_id);
-- `= any(skills)` is the shape the API generates for skill filters.
create index if not exists jobs_skills_idx on jobs using gin (skills);
create index if not exists jobs_search_idx on jobs using gin (search_vector);

create index if not exists applications_job_id_idx on applications (job_id);
create index if not exists applications_status_idx on applications (status);

-- One application per signed-in candidate per job, enforced by the database so
-- two concurrent submits cannot both win. `where applicant_id is not null`
-- leaves anonymous applicants governed by the (job_id, email) constraint
-- instead, which is what stops an accidental double submit.
create unique index if not exists applications_job_applicant_idx
  on applications (job_id, applicant_id)
  where applicant_id is not null;
create unique index if not exists applications_job_email_idx
  on applications (job_id, email);

create index if not exists saved_jobs_user_id_idx on saved_jobs (user_id);

-- --- Server-side helpers ---------------------------------------------------

-- PostgREST has no atomic increment, and a read-then-write in the service would
-- lose counts whenever two views land at once. Executable only by service_role,
-- so it cannot be used to inflate counts from a browser.
create or replace function public.increment_job_views(target_job_id uuid)
returns void
language sql
as $$
  update jobs set views = views + 1 where id = target_job_id;
$$;

revoke all on function public.increment_job_views(uuid) from public, anon, authenticated;
grant execute on function public.increment_job_views(uuid) to service_role;

-- --- Ownership helper -------------------------------------------------------- SECURITY DEFINER so a policy on `jobs` can read `companies` without
-- re-entering the RLS policy on `companies` (which would recurse). The
-- pinned search_path is required for the same reason.
create or replace function public.owns_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from companies c
    where c.id = target_company_id and c.owner_id = auth.uid()
  );
$$;

create or replace function public.applies_to_own_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from jobs j
    join companies c on c.id = j.company_id
    where j.id = target_job_id and c.owner_id = auth.uid()
  );
$$;

-- --- Row level security ----------------------------------------------------
-- Enabled on every table. Without this a table defaults to "deny", which is the
-- safe direction, but being explicit documents the intent.

alter table companies enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;
alter table profiles enable row level security;

-- Companies are public profiles. Only the owner may write.
drop policy if exists companies_select on companies;
create policy companies_select on companies for select using (true);

drop policy if exists companies_insert on companies;
create policy companies_insert on companies for insert with check (auth.uid() = owner_id);

drop policy if exists companies_update on companies;
create policy companies_update on companies for update using (auth.uid() = owner_id);

drop policy if exists companies_delete on companies;
create policy companies_delete on companies for delete using (auth.uid() = owner_id);

-- Jobs: published ones are public, an employer's own drafts are not.
drop policy if exists jobs_select on jobs;
create policy jobs_select on jobs for select
  using (status = 'published' or public.owns_company(company_id) or created_by = auth.uid());

drop policy if exists jobs_insert on jobs;
create policy jobs_insert on jobs for insert
  with check (public.owns_company(company_id) and created_by = auth.uid());

drop policy if exists jobs_update on jobs;
create policy jobs_update on jobs for update
  using (public.owns_company(company_id) or created_by = auth.uid());

drop policy if exists jobs_delete on jobs;
create policy jobs_delete on jobs for delete
  using (public.owns_company(company_id) or created_by = auth.uid());

-- Applications carry name, email and a resume link, so reads are restricted to
-- the applicant and the employer. Anonymous inserts are allowed because
-- candidates may apply without an account.
drop policy if exists applications_select on applications;
create policy applications_select on applications for select
  using (applicant_id = auth.uid() or public.applies_to_own_job(job_id));

drop policy if exists applications_insert on applications;
create policy applications_insert on applications for insert with check (true);

drop policy if exists applications_update on applications;
create policy applications_update on applications for update
  using (public.applies_to_own_job(job_id));

drop policy if exists applications_delete on applications;
create policy applications_delete on applications for delete
  using (applicant_id = auth.uid() or public.applies_to_own_job(job_id));

-- Saved jobs and profiles are private to their owner.
drop policy if exists saved_jobs_select on saved_jobs;
create policy saved_jobs_select on saved_jobs for select using (user_id = auth.uid());

drop policy if exists saved_jobs_insert on saved_jobs;
create policy saved_jobs_insert on saved_jobs for insert with check (user_id = auth.uid());

drop policy if exists saved_jobs_delete on saved_jobs;
create policy saved_jobs_delete on saved_jobs for delete using (user_id = auth.uid());

drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select using (user_id = auth.uid());

drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles for insert with check (user_id = auth.uid());

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update using (user_id = auth.uid());

-- --- Storage ---------------------------------------------------------------
-- `media` holds public assets (company logos). `resumes` holds candidate PII
-- and stays private, so it is only reachable through a signed URL or our own
-- authorised download route.

insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "resumes are readable by their owner" on storage.objects;
create policy "resumes are readable by their owner" on storage.objects
  for select using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
