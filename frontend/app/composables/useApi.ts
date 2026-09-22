import type { FetchOptions } from 'ofetch'

export function useApi() {
  const { $api } = useNuxtApp()

  async function request<T>(path: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return await $api<T>(path.replace(/^\//, ''), options)
  }

  async function requestBlob(path: string, options: FetchOptions<'blob'> = {}): Promise<Blob> {
    return await $api<Blob, 'blob'>(path.replace(/^\//, ''), { ...options, responseType: 'blob' })
  }

  return { request, requestBlob }
}
