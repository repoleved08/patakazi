/**
 * Supabase database types.
 *
 * This is the file the `@nuxtjs/supabase` module reads to type both the browser
 * client and the service-role client. It is normally generated with
 * `pnpm db:types`, but the generated output is checked in deliberately: a
 * migration and its types then have to be updated together in the same
 * changeset, and a missing type file silently degrades every `.from()` call to
 * `never` rather than failing.
 *
 * `shared/types/models.ts` is the hand-written mirror of the same columns for
 * the plain row shapes the mappers use. Keep the two in step.
 */

import type {
  ApplicationStatus,
  CompanySize,
  EmploymentType,
  JobStatus,
  SalaryPeriod,
  SeniorityLevel,
  WorkplaceType
} from './job'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          description: string
          founded: number
          id: string
          industry: string
          location: string
          logo_id: string
          name: string
          owner_id: string | null
          services: string
          size: CompanySize | ''
          slug: string
          updated_at: string
          verified: boolean
          website: string
          working_hours: string
        }
        Insert: {
          created_at?: string
          description?: string
          founded?: number
          id?: string
          industry?: string
          location?: string
          logo_id?: string
          services?: string
          working_hours?: string
          name: string
          owner_id?: string | null
          size?: CompanySize | ''
          slug: string
          updated_at?: string
          verified?: boolean
          website?: string
        }
        Update: {
          created_at?: string
          description?: string
          founded?: number
          id?: string
          industry?: string
          location?: string
          logo_id?: string
          services?: string
          working_hours?: string
          name?: string
          owner_id?: string | null
          size?: CompanySize | ''
          slug?: string
          updated_at?: string
          verified?: boolean
          website?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_email: string
          apply_url: string
          company_id: string
          company_logo_id: string
          company_name: string
          company_slug: string
          created_at: string
          created_by: string | null
          description: string
          employment_type: EmploymentType
          expires_at: string | null
          featured: boolean
          id: string
          location: string
          published_at: string | null
          salary_currency: string
          salary_max: number
          salary_min: number
          salary_period: SalaryPeriod
          salary_visible: boolean
          search_vector: unknown
          seniority: SeniorityLevel | ''
          skills: string[]
          slug: string
          status: JobStatus
          tags: string[]
          title: string
          updated_at: string
          views: number
          workplace_type: WorkplaceType
        }
        Insert: {
          apply_email?: string
          apply_url?: string
          company_id: string
          company_logo_id?: string
          company_name?: string
          company_slug?: string
          created_at?: string
          created_by?: string | null
          description?: string
          employment_type: EmploymentType
          expires_at?: string | null
          featured?: boolean
          id?: string
          location?: string
          published_at?: string | null
          salary_currency?: string
          salary_max?: number
          salary_min?: number
          salary_period?: SalaryPeriod
          salary_visible?: boolean
          search_vector?: unknown
          seniority?: SeniorityLevel | ''
          skills?: string[]
          slug: string
          status?: JobStatus
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
          workplace_type: WorkplaceType
        }
        Update: {
          apply_email?: string
          apply_url?: string
          company_id?: string
          company_logo_id?: string
          company_name?: string
          company_slug?: string
          created_at?: string
          created_by?: string | null
          description?: string
          employment_type?: EmploymentType
          expires_at?: string | null
          featured?: boolean
          id?: string
          location?: string
          published_at?: string | null
          salary_currency?: string
          salary_max?: number
          salary_min?: number
          salary_period?: SalaryPeriod
          salary_visible?: boolean
          search_vector?: unknown
          seniority?: SeniorityLevel | ''
          skills?: string[]
          slug?: string
          status?: JobStatus
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
          workplace_type?: WorkplaceType
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      applications: {
        Row: {
          applicant_id: string | null
          cover_note: string
          created_at: string
          email: string
          full_name: string
          id: string
          job_id: string
          resume_id: string
          status: ApplicationStatus
          updated_at: string
        }
        Insert: {
          applicant_id?: string | null
          cover_note?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_id: string
          resume_id?: string
          status?: ApplicationStatus
          updated_at?: string
        }
        Update: {
          applicant_id?: string | null
          cover_note?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          resume_id?: string
          status?: ApplicationStatus
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          }
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_jobs_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          headline: string
          id: string
          linkedin_url: string
          location: string
          open_to_work: boolean
          portfolio_url: string
          resume_id: string
          role: string
          is_active: boolean
          skills: string[]
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          headline?: string
          id?: string
          linkedin_url?: string
          location?: string
          open_to_work?: boolean
          portfolio_url?: string
          resume_id?: string
          role?: string
          is_active?: boolean
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          headline?: string
          id?: string
          linkedin_url?: string
          location?: string
          open_to_work?: boolean
          portfolio_url?: string
          resume_id?: string
          role?: string
          is_active?: boolean
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_job_views: {
        Args: { target_job_id: string }
        Returns: undefined
      }
      owns_company: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      applies_to_own_job: {
        Args: { target_job_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/** Convenience alias for a table's row shape, e.g. `TableRow<'jobs'>`. */
export type TableRow<T extends keyof Database['public']['Tables']>
  = Database['public']['Tables'][T]['Row']

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

/**
 * A table name, or a raw SQL string.
 *
 * The `string` arm is what lets the repositories build an `in` filter from a
 * dynamically composed PostgREST expression; it opts those call sites out of
 * result typing, so it is only ever used deliberately.
 */
export type TableName = string

export type Tables<Table = string> = Table extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][Table]
  : never

export type TablesInsert<Table = string> = Table extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][Table]['Insert']
  : never

export type TablesUpdate<Table = string> = Table extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][Table]['Update']
  : never
