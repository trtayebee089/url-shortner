import type { H3Event } from 'h3'
import { ofetch, type FetchResponse } from 'ofetch'

export const sessionCookie = process.env.NODE_ENV === 'production' ? '__Host-url_shortener_session' : 'url_shortener_session'

export async function callBackend<T = unknown>(event: H3Event, path: string, options: Record<string, unknown> = {}): Promise<FetchResponse<T>> {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, sessionCookie)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return await ofetch.raw<T>(`${config.apiBase}/${path.replace(/^\//, '')}`, { ...options, headers: { ...headers, ...((options.headers as Record<string, string>) || {}) }, ignoreResponseError: true })
}

export function relay<T>(event: H3Event, response: FetchResponse<T>): T | undefined {
  setResponseStatus(event, response.status)
  const contentType = response.headers.get('content-type')
  if (contentType) setResponseHeader(event, 'content-type', contentType)
  return response._data
}
