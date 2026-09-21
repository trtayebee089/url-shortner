import { describe, expect, it } from 'vitest'
import { isAllowedBackendPath, isCrossSiteUnsafeRequest } from '../app/server/utils/request-security'

describe('server request security', () => {
  it('allows ordinary versioned API paths but blocks auth token and traversal paths', () => {
    expect(isAllowedBackendPath('links/123/analytics')).toBe(true)
    expect(isAllowedBackendPath('auth/login')).toBe(false)
    expect(isAllowedBackendPath('auth/register')).toBe(false)
    expect(isAllowedBackendPath('../auth/login')).toBe(false)
    expect(isAllowedBackendPath('links?<script>')).toBe(false)
  })

  it('rejects cross-site unsafe requests and accepts configured same-site origins', () => {
    expect(isCrossSiteUnsafeRequest('https://evil.example', undefined, 'https://247.example', 'https://247.example')).toBe(true)
    expect(isCrossSiteUnsafeRequest(undefined, 'cross-site', 'https://247.example', 'https://247.example')).toBe(true)
    expect(isCrossSiteUnsafeRequest('https://247.example', 'same-origin', 'https://247.example', 'https://247.example')).toBe(false)
    expect(isCrossSiteUnsafeRequest('https://www.247.example', 'same-site', 'https://247.example', 'https://www.247.example')).toBe(false)
  })
})
