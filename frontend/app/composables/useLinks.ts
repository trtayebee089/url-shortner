import type { ApiEnvelope, LinkRecord, Paginated } from '~/types/api'

export function useLinks() {
  const { request } = useApi()
  const links = useState<LinkRecord[]>('links', () => [])
  const loading = ref(false)
  const meta = ref<Paginated<LinkRecord>['meta'] | null>(null)

  async function list(params: Record<string, string | number> = {}) {
    loading.value = true
    try {
      const response = await request<Paginated<LinkRecord>>('links', { query: params })
      links.value = response.data
      meta.value = response.meta
      return response
    } finally { loading.value = false }
  }
  async function create(payload: Record<string, unknown>) { return await request<ApiEnvelope<LinkRecord>>('links', { method: 'POST', body: payload }) }
  async function update(id: number, payload: Record<string, unknown>) { return await request<ApiEnvelope<LinkRecord>>(`links/${id}`, { method: 'PATCH', body: payload }) }
  async function remove(id: number) { return await request(`links/${id}`, { method: 'DELETE' }) }
  return { links, meta, loading, list, create, update, remove }
}
