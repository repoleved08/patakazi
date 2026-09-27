import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import type { CreateApplicationInput, UpdateProfileInput } from '#shared/schemas'
import type { Application, CandidateProfile, SavedJob } from '#shared/types/api'
import type { ApplicationRow } from '#shared/types/models'
import { toApplication, toProfile } from '../mappers/row-mappers'
import { TABLES, useSupabaseServer } from '../utils/supabase'
import { requireAuth, requireCompanyAccess, resolveAuthContext } from './authorization.service'
import { useJobService } from './job.service'

/**
 * Applications, saved jobs and candidate profiles.
 *
 * Applications are candidate-facing (anyone may apply, with or without an
 * account) but employer-facing reads are restricted to the company that owns the
 * job. That restriction is enforced here, because this service uses the
 * service-role client and so bypasses the RLS policies that would otherwise
 * enforce it.
 */
export class ApplicationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async submit(event: H3Event, input: CreateApplicationInput): Promise<Application> {
    const target = await useJobService(event).findPublic(input.jobId)
    if (!target) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

    // A signed-in candidate is recorded against their account; an anonymous one
    // leaves it null. The partial unique indexes in the migration reject a
    // duplicate either way, so this pre-check is only there to return a
    // friendlier message than a 409 from the database.
    const context = await resolveAuthContext(event)
    const duplicate = await this.findApplication(target.id, input.email, context?.userId ?? null)
    if (duplicate) {
      throw createError({ statusCode: 409, statusMessage: 'You have already applied to this job' })
    }

    const { data, error } = await this.supabase
      .from(TABLES.applications)
      .insert({
        job_id: target.id,
        applicant_id: context?.userId ?? null,
        full_name: input.fullName,
        email: input.email,
        resume_id: input.resumeId,
        cover_note: input.coverNote,
        status: 'submitted'
      })
      .select('*')
      .single()

    throwIfError(error, 'Could not submit the application')
    return toApplication(data)
  }

  /** Applications for a job, restricted to employers who manage its company. */
  async listForJob(event: H3Event, jobId: string): Promise<Application[]> {
    const job = await useJobService(event).getByIdForUser(event, jobId)
    await requireCompanyAccess(event, job.company.id)

    const { data, error } = await this.supabase
      .from(TABLES.applications)
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(200)

    throwIfError(error, 'Could not load applications')
    return (data ?? []).map(toApplication)
  }

  async updateStatus(event: H3Event, applicationId: string, status: Application['status']): Promise<Application> {
    const row = await this.getApplicationRow(applicationId)
    const job = await useJobService(event).getByIdForUser(event, row.job_id)
    await requireCompanyAccess(event, job.company.id)

    const { data, error } = await this.supabase
      .from(TABLES.applications)
      .update({ status })
      .eq('id', applicationId)
      .select('*')
      .single()

    throwIfError(error, 'Could not update the application')
    return toApplication(data)
  }

  // --- Saved jobs ---------------------------------------------------------

  async listSaved(event: H3Event): Promise<SavedJob[]> {
    const context = await requireAuth(await resolveAuthContext(event))
    const { data, error } = await this.supabase
      .from(TABLES.savedJobs)
      .select('job_id, created_at')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .limit(200)

    throwIfError(error, 'Could not load saved jobs')
    return (data ?? []).map(row => ({ jobId: row.job_id as string, savedAt: row.created_at as string }))
  }

  async save(event: H3Event, jobId: string): Promise<SavedJob> {
    const context = await requireAuth(await resolveAuthContext(event))
    const job = await useJobService(event).getByIdForUser(event, jobId)

    // `upsert` on (user_id, job_id) makes a repeat save idempotent, so the
    // bookmark button can be double-clicked without a read-then-write race.
    const { data, error } = await this.supabase
      .from(TABLES.savedJobs)
      .upsert({ user_id: context.userId, job_id: job.id }, { onConflict: 'user_id,job_id', ignoreDuplicates: false })
      .select('job_id, created_at')
      .single()

    throwIfError(error, 'Could not save the job')
    // `ignoreDuplicates: false` should always return the row, but a null here
    // would otherwise become a `{ jobId: undefined }` response further down.
    if (!data) throw createError({ statusCode: 500, statusMessage: 'Could not save the job' })

    return { jobId: data.job_id, savedAt: data.created_at }
  }

  async unsave(event: H3Event, jobId: string): Promise<void> {
    const context = await requireAuth(await resolveAuthContext(event))
    const { error } = await this.supabase
      .from(TABLES.savedJobs)
      .delete()
      .eq('user_id', context.userId)
      .eq('job_id', jobId)

    throwIfError(error, 'Could not remove the saved job')
  }

  // --- Candidate profile --------------------------------------------------

  async getProfile(event: H3Event): Promise<CandidateProfile | null> {
    const context = await requireAuth(await resolveAuthContext(event))
    const { data, error } = await this.supabase
      .from(TABLES.profiles)
      .select('*')
      .eq('user_id', context.userId)
      .maybeSingle()

    if (error) return null
    return data ? toProfile(data) : null
  }

  async upsertProfile(event: H3Event, input: UpdateProfileInput): Promise<CandidateProfile> {
    const context = await requireAuth(await resolveAuthContext(event))

    // `user_id` is unique, so upsert on it turns "create or edit" into one
    // statement and stops two tabs racing to create the same profile.
    const patch = {
      user_id: context.userId,
      full_name: input.fullName ?? context.name,
      headline: input.headline ?? '',
      summary: input.summary ?? '',
      location: input.location ?? '',
      skills: input.skills ?? [],
      resume_id: input.resumeId ?? '',
      portfolio_url: input.portfolioUrl ?? '',
      linkedin_url: input.linkedinUrl ?? '',
      open_to_work: input.openToWork ?? false
    }

    const { data, error } = await this.supabase
      .from(TABLES.profiles)
      .upsert(patch, { onConflict: 'user_id' })
      .select('*')
      .single()

    throwIfError(error, 'Could not save the profile')
    return toProfile(data)
  }

  // --- Internals ----------------------------------------------------------

  private async getApplicationRow(id: string): Promise<ApplicationRow> {
    const { data, error } = await this.supabase
      .from(TABLES.applications)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    return data
  }

  /** Existing application for a job, matched by account when signed in, else email. */
  private async findApplication(jobId: string, email: string, userId: string | null): Promise<boolean> {
    let query = this.supabase
      .from(TABLES.applications)
      .select('id')
      .eq('job_id', jobId)
      .limit(1)

    query = userId
      ? query.or(`applicant_id.eq.${userId},email.eq.${email}`)
      : query.eq('email', email)

    const { data, error } = await query
    if (error) return false
    return (data?.length ?? 0) > 0
  }
}

export function useApplicationService(event: H3Event): ApplicationService {
  return new ApplicationService(useSupabaseServer(event))
}

/**
 * PostgREST reports failure in the body rather than throwing, which would let a
 * rejected write look like a success. Everything above routes errors through
 * here so the status code is deliberate rather than a generic 500.
 */
function throwIfError(
  error: { code?: string, message: string } | null,
  statusMessage: string
): void {
  if (!error) return

  // 23505 = unique_violation: a duplicate application or saved job that slipped
  // past the pre-check. It is the caller's problem, not a server fault.
  if (error.code === '23505') {
    throw createError({ statusCode: 409, statusMessage: 'That already exists' })
  }
  // 23503 = foreign_key_violation: the referenced row is gone, which is a bad
  // request from the caller rather than an outage.
  if (error.code === '23503') {
    throw createError({ statusCode: 400, statusMessage: statusMessage })
  }

  throw createError({
    statusCode: 500,
    statusMessage,
    data: { code: error.code, message: error.message }
  })
}
