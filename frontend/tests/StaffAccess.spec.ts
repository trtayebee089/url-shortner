import { computed, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { managementPages, useAccess } from '../app/composables/useAccess'

afterEach(() => vi.unstubAllGlobals())

describe('staff administration access', () => {
  function access(role: string, permissions: string[]) {
    const user = ref({ role, management_permissions: permissions })
    vi.stubGlobal('useAuth', () => ({ user }))
    vi.stubGlobal('computed', computed)
    return { user, ...useAccess() }
  }

  it('shows only permitted administration sections and chooses an accessible landing page', () => {
    const state = access('operations', ['payments.view'])
    expect(state.pages.value.map(page => page.path)).toEqual(['/admin/payments'])
    expect(state.home.value).toBe('/admin/payments')
    expect(state.can('payments.manage')).toBe(false)
    expect(state.can('staff.manage')).toBe(false)
  })

  it('reacts to lost access and preserves the owner workspace', () => {
    const state = access('manager', ['overview.view', 'customers.view'])
    expect(state.pages.value).toHaveLength(2)
    state.user.value.management_permissions = []
    expect(state.home.value).toBe('/dashboard')
    state.user.value.role = 'superadmin'
    expect(state.pages.value).toHaveLength(0)
    state.user.value.management_permissions = managementPages.map(page => page.permission)
    expect(state.pages.value).toHaveLength(managementPages.length)
  })
})
