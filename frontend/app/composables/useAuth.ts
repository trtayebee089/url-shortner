import type { ApiEnvelope, User } from '~/types/api'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)
  const token = useCookie<string | null>('url_shortener_auth_token', {
    path: '/',
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 30,
  })
  const { request } = useApi()

  async function fetchUser() {
    loading.value = true
    try { user.value = (await request<ApiEnvelope<User>>('auth/me')).data }
    catch { user.value = null }
    finally { loading.value = false }
    return user.value
  }
  async function login(payload: { email: string; password: string; remember?: boolean }) {
    const response = await request<ApiEnvelope<{ user: User, token: string }>>('auth/login', { method: 'POST', body: payload })
    token.value = response.data.token
    user.value = response.data.user
    return response
  }
  async function register(payload: { name: string; email: string; password: string; password_confirmation: string }) {
    const response = await request<ApiEnvelope<{ user: User, token: string }>>('auth/register', { method: 'POST', body: payload })
    token.value = response.data.token
    user.value = response.data.user
    return response
  }
  async function finishSocialLogin(ticket: string) {
    const response = await request<ApiEnvelope<{ user: User, token: string }>>('auth/social/exchange', { method: 'POST', body: { ticket } })
    token.value = response.data.token
    user.value = response.data.user
    return response
  }
  async function logout() {
    try { await request('auth/logout', { method: 'POST' }) }
    finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }
  return { user, loading, fetchUser, login, register, finishSocialLogin, logout }
}
