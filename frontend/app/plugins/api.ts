const authTokenCookie = 'url_shortener_auth_token'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>(authTokenCookie)

  const api = $fetch.create({
    baseURL: config.public.apiBase.replace(/\/$/, ''),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    onRequest({ options }) {
      if (!token.value) return

      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    },
  })

  return {
    provide: {
      api,
    },
  }
})

export { authTokenCookie }
