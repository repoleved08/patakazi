-- ===========================================================================
-- Keep the denormalised company fields on jobs in step with the company.
--
-- `jobs` copies `company_name`, `company_slug` and `company_logo_id` from its
-- company so a listing can render a card without a join. That is a cache, and
-- a cache needs an invalidation rule. Without one, renaming a company leaves
-- every one of its job cards showing the old name and, worse, linking to a
-- company slug that no longer exists.
--
-- This is a trigger rather than a statement in `CompanyService.update` because
-- the invariant has to hold for *every* writer: the service, a one-off SQL
-- fix, the Supabase dashboard, and the seed script. Enforcing it in one place
-- in the database is the only version that cannot be bypassed.
--
-- Updating the job rows re-fires `jobs_search_trigger`, so the search vector
-- picks up the new company name in the same statement.
-- ===========================================================================

create or replace function public.sync_job_company_fields()
returns trigger
language plpgsql
as $$
begin
  -- Nothing to do unless a field the jobs table caches actually changed;
  -- without this guard any company edit would rewrite every job row.
  if new.name is distinct from old.name
     or new.slug is distinct from old.slug
     or new.logo_id is distinct from old.logo_id
  then
    update jobs
       set company_name = new.name,
           company_slug = new.slug,
           company_logo_id = new.logo_id
     where company_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists companies_sync_jobs_trigger on companies;
create trigger companies_sync_jobs_trigger
  after update on companies
  for each row execute function public.sync_job_company_fields();
