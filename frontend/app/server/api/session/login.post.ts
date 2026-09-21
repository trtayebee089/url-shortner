import { callBackend, relay, sessionCookie } from '../../utils/backend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const response = await callBackend<any>(event, 'auth/login', { method: 'POST', body })
  if (response.status >= 200 && response.status < 300 && response._data?.data?.token) {
    setCookie(event, sessionCookie, response._data.data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: body.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12 })
    delete response._data.data.token
  }
  return relay(event, response)
})
