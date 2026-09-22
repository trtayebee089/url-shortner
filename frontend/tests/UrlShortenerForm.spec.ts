import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UrlShortenerForm from '../app/components/UrlShortenerForm.vue'

afterEach(() => vi.unstubAllGlobals())

function setup(fetchImplementation: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('useAuth', () => ({ user: { value: null } }))
  vi.stubGlobal('useToast', () => ({ show: vi.fn() }))
  vi.stubGlobal('useApi', () => ({ request: fetchImplementation }))
  return mount(UrlShortenerForm, { global: { stubs: { CopyButton: true } } })
}

describe('UrlShortenerForm', () => {
  it('uses the anonymous endpoint and renders the API result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: { id: 1, short_url: 'https://247.test/summer', destination_url: 'https://example.com', short_code: 'summer' } })
    const wrapper = setup(fetcher)
    await wrapper.get('#destination-url').setValue('https://example.com')
    await wrapper.get('#custom-alias').setValue('summer')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledWith('public/links', expect.objectContaining({ method: 'POST' })))
    expect(wrapper.text()).toContain('https://247.test/summer')
  })

  it('surfaces field validation and rate-limit errors', async () => {
    const wrapper = setup(vi.fn().mockRejectedValue({ status: 429, data: { errors: { destination_url: ['The URL is invalid.'] } } }))
    await wrapper.get('#destination-url').setValue('bad')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('The URL is invalid.'))
  })
})
