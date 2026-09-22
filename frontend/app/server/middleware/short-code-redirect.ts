import { getRequestURL, sendRedirect, setResponseHeader } from 'h3'
import { getShortCodeRedirectTarget } from '../../utils/shortCodeRedirect'

export default defineEventHandler((event) => {
  const target = getShortCodeRedirectTarget(event.method, getRequestURL(event), useRuntimeConfig(event).apiBase)

  if (target) {
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    return sendRedirect(event, target, 302)
  }
})
