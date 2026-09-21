import { ofetch, type FetchOptions } from 'ofetch'

export function useApi() {
  async function request<T>(path: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return await ofetch<T>(`/api/backend/${path.replace(/^\//, '')}`, options)
  }
  return { request }
}
