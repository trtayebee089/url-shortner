const backendPathPattern = /^[A-Za-z0-9_./-]+$/
const blockedProxyPaths = new Set(['auth/login', 'auth/register'])

export function isAllowedBackendPath(path: string): boolean {
  return backendPathPattern.test(path)
    && !path.split('/').some(segment => segment === '..')
    && !blockedProxyPaths.has(path)
}

export function isCrossSiteUnsafeRequest(
  origin: string | undefined,
  fetchSite: string | undefined,
  requestOrigin: string,
  configuredOrigin: string,
): boolean {
  return fetchSite === 'cross-site'
    || Boolean(origin && origin !== requestOrigin && origin !== configuredOrigin)
}
