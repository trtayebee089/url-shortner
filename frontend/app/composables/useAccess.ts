export const managementPages = [
  { path: '/admin', label: 'Overview', icon: '▦', permission: 'overview.view' },
  { path: '/admin/customers', label: 'Customers', icon: '♙', permission: 'customers.view' },
  { path: '/admin/plans', label: 'Plans', icon: '▤', permission: 'plans.view' },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: '↻', permission: 'subscriptions.view' },
  { path: '/admin/payments', label: 'Manual payments', icon: '▣', permission: 'payments.view' },
  { path: '/admin/moderation', label: 'Moderation', icon: '◇', permission: 'moderation.view' },
  { path: '/admin/audit', label: 'Audit log', icon: '◷', permission: 'audit.view' },
  { path: '/admin/users', label: 'Users & roles', icon: '♧', permission: 'staff.manage' },
]

export function useAccess() {
  const { user } = useAuth()
  const can = (permission: string) => user.value?.management_permissions?.includes(permission) || false
  const pages = computed(() => managementPages.filter(page => can(page.permission)))
  const home = computed(() => pages.value[0]?.path || '/dashboard')
  return { can, pages, home }
}
