export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const config = useRuntimeConfig(event)
  const apiOrigin = new URL(config.public.apiBase).origin

  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', path === '/reset-password' ? 'no-referrer' : 'strict-origin-when-cross-origin')
  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  setResponseHeader(event, 'Content-Security-Policy', `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' ${apiOrigin}`)

  if (path.startsWith('/api/')) {
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
  }
  if (/^\/(dashboard(?:\/|$)|login$|register$|forgot-password$|reset-password$|verify-email$)/.test(path)) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }

})
