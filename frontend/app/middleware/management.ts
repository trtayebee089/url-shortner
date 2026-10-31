import { managementPages } from '~/composables/useAccess'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()
  await fetchUser()
  if (!user.value) return navigateTo('/login')
  const permissions = user.value.management_permissions || []
  const allowed = managementPages.filter(page => permissions.includes(page.permission))
  const page = managementPages.find(page => page.path === to.path.replace(/\/$/, '').toLowerCase())
  if (!page || !allowed.some(item => item.path === page.path)) return navigateTo(allowed[0]?.path || '/dashboard')
})
