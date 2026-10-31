import type { ApiEnvelope } from '~/types/api'
import type { Page } from '~/types/billing'

export async function useManagement<T>(resource: string) {
  const { request } = useApi()
  const search = ref(''), status = ref(''), page = ref(1)
  const query = computed(() => ({ search: search.value || undefined, status: status.value || undefined, page: page.value }))
  const result = await useAsyncData(`management-${resource}`, () => request<ApiEnvelope<Page<T>>>(`management/${resource}`, { query: query.value }), { watch: [query] })
  const rows = computed(() => result.data.value?.data.data || [])
  const pagination = computed(() => result.data.value?.data)
  const message = ref(''), failure = ref(''), saving = ref(false)
  async function mutate(path: string, body?: unknown, method: 'POST' | 'PATCH' | 'PUT' = 'POST') {
    saving.value = true; failure.value = ''; message.value = ''
    try {
      const response = await request<ApiEnvelope<unknown>>(path, { method, body: body as Record<string, unknown> })
      message.value = response.message || 'Saved successfully.'
      await result.refresh()
      return true
    } catch (error: any) {
      failure.value = Object.values(error?.data?.errors || {}).flat().join(' ') || error?.data?.message || 'Unable to save. Please try again.'
      return false
    } finally { saving.value = false }
  }
  return { ...result, rows, pagination, search, status, page, message, failure, saving, mutate }
}
