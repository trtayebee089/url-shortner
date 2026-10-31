export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser } = useAuth()
  if (!user.value) await fetchUser()
  if (!user.value) return navigateTo('/login')
  if (user.value.role !== 'superadmin') return navigateTo('/dashboard')
})
