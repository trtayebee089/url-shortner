export interface Plan {
  id: number; name: string; slug: string; description: string | null; currency: string
  monthly_price: number | null; yearly_price: number | null; link_limit: number | null
  features: string[]; is_default: boolean; is_active: boolean; is_public: boolean; sort_order: number
  stripe_monthly_price_id?: string | null; stripe_yearly_price_id?: string | null
  checkout_monthly?: boolean; checkout_yearly?: boolean
}
export interface Customer { id: number; name: string; email: string; role: string; status: string; links_count?: number; created_at: string }
export interface Subscription { id: number; user_id: number; plan_id: number; user?: Customer; plan: Plan; status: string; effective_status: string; interval: string; amount: number; currency: string; starts_at: string; ends_at: string; provider: string; cancel_at_period_end: boolean }
export interface Payment { id: number; amount: number; currency: string; status: string; method: string; reference: string; paid_at: string; subscription: Subscription }
export interface Audit { id: number; action: string; subject_type: string; subject_id: number; actor: Customer | null; created_at: string; changes: Record<string, unknown> }
export interface Page<T> { data: T[]; current_page: number; last_page: number; total: number }
