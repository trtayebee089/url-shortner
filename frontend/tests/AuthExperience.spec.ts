import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Login from '../app/pages/login.vue'
import Register from '../app/pages/register.vue'
import SocialAuthOptions from '../app/components/SocialAuthOptions.vue'
import Complete from '../app/pages/auth/complete.vue'

afterEach(() => vi.unstubAllGlobals())

const shell = { template: '<div><h1>{{ title }}</h1><slot/></div>', props: ['title', 'description'] }
function setup(query: Record<string, string> = {}, verified = false) {
  const request = vi.fn().mockResolvedValue({ verified })
  vi.stubGlobal('useSeoPage', vi.fn())
  vi.stubGlobal('useRoute', () => ({ query }))
  vi.stubGlobal('useApi', () => ({ request }))
  vi.stubGlobal('useAuth', () => ({ login: vi.fn(), register: vi.fn() }))
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://api.247.bd/api/v1' } }))
  vi.stubGlobal('navigateTo', vi.fn().mockResolvedValue(undefined))
  const global = { components: { AuthShell: shell, SocialAuthOptions }, stubs: { NuxtLink: { template: '<a><slot/></a>' } } }
  return { request, global }
}

describe('authentication experience', () => {
  it('renders email and password forms with enabled social options', () => {
    const { global } = setup()
    for (const component of [Login, Register]) {
      const wrapper = mount(component, { global })
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Continue with Google')
      expect(wrapper.text()).toContain('Continue with Apple')
      expect(wrapper.findAll('button').filter(button => button.text().includes('Continue with') && button.attributes('disabled') === undefined)).toHaveLength(2)
    }
  })

  it('starts each provider at the configured API origin and shows a loading state', async () => {
    setup()
    const navigate = vi.fn().mockReturnValue(new Promise(() => {}))
    vi.stubGlobal('navigateTo', navigate)
    const google = mount(SocialAuthOptions)
    await google.get('button').trigger('click')
    expect(google.text()).toContain('Connecting…')
    expect(google.findAll('button[disabled]')).toHaveLength(2)
    expect(navigate).toHaveBeenCalledWith('https://api.247.bd/api/v1/auth/google/redirect', { external: true })

    const apple = mount(SocialAuthOptions)
    await apple.findAll('button')[1]!.trigger('click')
    expect(navigate).toHaveBeenCalledWith('https://api.247.bd/api/v1/auth/apple/redirect', { external: true })
  })

  it('restores the social buttons and shows an error when navigation fails', async () => {
    setup()
    vi.stubGlobal('navigateTo', vi.fn().mockRejectedValue(new Error('offline')))
    const wrapper = mount(SocialAuthOptions)
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to start Google sign-in')
    expect(wrapper.findAll('button[disabled]')).toHaveLength(0)
  })

  it('exchanges the OAuth ticket through the normal auth composable', async () => {
    setup({ ticket: 't'.repeat(64) })
    const finishSocialLogin = vi.fn().mockResolvedValue({ data: { user: { email_verified_at: '2026-09-24' } } })
    vi.stubGlobal('useAuth', () => ({ finishSocialLogin }))
    const wrapper = mount(Complete, { global: { components: { AuthShell: shell }, stubs: { NuxtLink: true } } })
    await flushPromises()
    expect(finishSocialLogin).toHaveBeenCalledWith('t'.repeat(64))
    expect(vi.mocked(navigateTo)).toHaveBeenCalledWith('/dashboard', { replace: true })
    expect(wrapper.text()).toContain('Connecting your account')
  })

  it('shows verification success only after the backend consumes a real proof', async () => {
    const { global, request } = setup({ verified: '1', proof: 'a'.repeat(64) }, true)
    const wrapper = mount(Login, { global })
    await flushPromises()
    expect(request).toHaveBeenCalledWith('auth/email/verification-proof', { method: 'POST', body: { proof: 'a'.repeat(64) } })
    expect(wrapper.text()).toContain('Email verified successfully!')
  })

  it('does not show success for a plain or failed verification query', async () => {
    const plain = setup({ verified: '1' }, true)
    const plainWrapper = mount(Login, { global: plain.global })
    await flushPromises()
    expect(plain.request).not.toHaveBeenCalled()
    expect(plainWrapper.text()).not.toContain('Email verified successfully!')

    const failed = setup({ verified: '1', proof: 'b'.repeat(64) }, false)
    const failedWrapper = mount(Login, { global: failed.global })
    await flushPromises()
    expect(failedWrapper.text()).not.toContain('Email verified successfully!')
  })

  it('shows a safe error after a rejected provider callback', () => {
    const { global } = setup({ oauth_error: 'state' })
    const wrapper = mount(Login, { global })
    expect(wrapper.get('[role="alert"]').text()).toContain('sign-in request expired')
  })
})
