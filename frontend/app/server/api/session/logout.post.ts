import { callBackend, relay, sessionCookie } from '../../utils/backend'

export default defineEventHandler(async (event) => {
  const response = await callBackend(event, 'auth/logout', { method: 'POST' })
  deleteCookie(event, sessionCookie, { path: '/' })
  return relay(event, response)
})
