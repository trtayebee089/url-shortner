export interface LinkRecord {
  id: number
  short_code: string
  short_url: string
  destination_url: string
  custom_alias: string | null
  title: string | null
  description: string | null
  is_active: boolean
  is_expired: boolean
  expires_at: string | null
  clicks_count: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface User { id: number; name: string; email: string; email_verified_at: string | null; role: string }
export interface ApiEnvelope<T> { data: T; message?: string }
export interface Paginated<T> { data: T[]; links: Record<string, unknown>; meta: { current_page: number; last_page: number; total: number } }
