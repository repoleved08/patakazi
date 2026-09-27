import type { Company, Paginated } from '#shared/types/api'
import type { UpdateCompanyInput } from '#shared/schemas'

export function useCompanies(query: MaybeRef<{ page?: number, perPage?: number, q?: string }> = {}) {
  const params = computed(() => {
    const value = toValue(query)
    return {
      ...(value.page !== undefined ? { page: String(value.page) } : {}),
      ...(value.perPage !== undefined ? { perPage: String(value.perPage) } : {}),
      ...(value.q ? { q: value.q } : {})
    }
  })

  return useAsyncData(
    () => `companies:${JSON.stringify(params.value)}`,
    () => $fetch<Paginated<Company>>('/api/companies', { query: params.value }),
    { watch: [params] }
  )
}

export function useCompany(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `company:${toValue(slug)}`,
    () => $fetch<Company>(`/api/companies/${toValue(slug)}`)
  )
}

/** Companies the signed-in user owns or is a team member of. */
export function useMyCompanies() {
  return useAsyncData('companies:mine', () => $fetch<Company[]>('/api/companies/mine'), {
    server: false
  })
}

/**
 * Company writes. Plain async functions, never cached, and the ownership check
 * lives in the service rather than here.
 */
export function useCompanyMutations() {
  async function update(id: string, body: UpdateCompanyInput) {
    return $fetch<Company>(`/api/companies/${id}`, { method: 'PATCH', body })
  }

  async function remove(id: string) {
    await $fetch(`/api/companies/${id}`, { method: 'DELETE' })
  }

  return { update, remove }
}
