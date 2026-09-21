import type { ApiEnvelope, User } from '~/types/api'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)

  async function fetchUser() {
    loading.value = true
    try { user.value = (await $fetch<ApiEnvelope<User>>('/api/session/me')).data }
    catch { user.value = null }
    finally { loading.value = false }
    return user.value
  }
  async function login(payload: { email: string; password: string; remember?: boolean }) {
    const response = await $fetch<ApiEnvelope<{ user: User }>>('/api/session/login', { method: 'POST', body: payload })
    user.value = response.data.user
    return response
  }
  async function register(payload: { name: string; email: string; password: string; password_confirmation: string }) {
    const response = await $fetch<ApiEnvelope<{ user: User }>>('/api/session/register', { method: 'POST', body: payload })
    user.value = response.data.user
    return response
  }
  async function logout() {
    await $fetch('/api/session/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }
  return { user, loading, fetchUser, login, register, logout }
}
