import { describe, expect, it } from 'vitest'
import { getShortCodeRedirectTarget } from '../app/utils/shortCodeRedirect'

describe('short-code redirect routing', () => {
  const apiBase = 'https://api.247.bd/api/v1'

  it('redirects a public short code to Laravel while preserving its query string', () => {
    expect(getShortCodeRedirectTarget('GET', new URL('https://247.bd/mGnw4Cm?utm_source=test'), apiBase))
      .toBe('https://api.247.bd/mGnw4Cm?utm_source=test')
  })

  it.each([
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/pricing',
    '/resources',
    '/resources/how-links-work',
    '/api',
    '/favicon.svg',
  ])('does not intercept the frontend route %s', (path) => {
    expect(getShortCodeRedirectTarget('GET', new URL(`https://247.bd${path}`), apiBase)).toBeNull()
  })

  it('does not redirect non-navigation methods or malformed codes', () => {
    expect(getShortCodeRedirectTarget('POST', new URL('https://247.bd/mGnw4Cm'), apiBase)).toBeNull()
    expect(getShortCodeRedirectTarget('GET', new URL('https://247.bd/ab'), apiBase)).toBeNull()
    expect(getShortCodeRedirectTarget('GET', new URL('https://247.bd/dotted.code'), apiBase)).toBeNull()
  })
})
