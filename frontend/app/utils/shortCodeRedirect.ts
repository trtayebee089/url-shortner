const shortCodePattern = /^[A-Za-z0-9_-]{3,64}$/

const frontendRoutes = new Set([
  'about',
  'api',
  'contact',
  'dashboard',
  'faq',
  'features',
  'forgot-password',
  'login',
  'pricing',
  'privacy',
  'register',
  'reset-password',
  'resources',
  'terms',
  'verify-email',
])

export function getShortCodeProxyTarget(method: string, requestUrl: URL, apiBase: string): string | null {
  if (method !== 'GET' && method !== 'HEAD') return null

  const match = requestUrl.pathname.match(/^\/([^/]+)$/)
  if (!match) return null

  let shortCode: string
  try {
    shortCode = decodeURIComponent(match[1]!)
  }
  catch {
    return null
  }

  if (!shortCodePattern.test(shortCode) || frontendRoutes.has(shortCode.toLowerCase())) return null

  const target = new URL(apiBase)
  target.pathname = `/${encodeURIComponent(shortCode)}`
  target.search = requestUrl.search
  target.hash = ''

  return target.toString()
}
