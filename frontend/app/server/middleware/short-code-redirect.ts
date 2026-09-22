import { getRequestURL, proxyRequest } from 'h3'
import { getShortCodeProxyTarget } from '../../utils/shortCodeRedirect'

export default defineEventHandler((event) => {
  const target = getShortCodeProxyTarget(event.method, getRequestURL(event), useRuntimeConfig(event).apiBase)

  if (target) {
    return proxyRequest(event, target, {
      fetchOptions: {
        redirect: 'manual',
      },
    })
  }
})
