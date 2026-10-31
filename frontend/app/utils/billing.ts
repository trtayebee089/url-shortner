export const money = (amount: number | null, currency = 'USD') => amount === null ? 'Custom' : new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount / 100)
export const billingDate = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
