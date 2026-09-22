import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QrcodeVue from 'qrcode.vue'
import UrlShortenerForm from '../app/components/UrlShortenerForm.vue'

afterEach(() => vi.unstubAllGlobals())

function setup(fetchImplementation: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('useToast', () => ({ show: vi.fn() }))
  vi.stubGlobal('useApi', () => ({ request: fetchImplementation }))
  return mount(UrlShortenerForm, {
    global: {
      stubs: {
        CopyButton: {
          props: ['text'],
          template: '<button data-test="copy" :data-copy-text="text">Copy</button>',
        },
      },
    },
  })
}

describe('UrlShortenerForm', () => {
  it('uses the unified links endpoint and renders the API result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: { id: 1, short_url: 'https://247.bd/mGnw4Cm', destination_url: 'https://example.com', short_code: 'mGnw4Cm' } })
    const wrapper = setup(fetcher)
    await wrapper.get('#destination-url').setValue('https://example.com')
    await wrapper.get('#custom-alias').setValue('mGnw4Cm')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledWith('links', expect.objectContaining({ method: 'POST' })))
    expect(fetcher).not.toHaveBeenCalledWith('public/links', expect.anything())
    expect(wrapper.text()).toContain('https://247.bd/mGnw4Cm')
    expect(wrapper.get('a').attributes('href')).toBe('https://247.bd/mGnw4Cm')
    expect(wrapper.get('[data-test="copy"]').attributes('data-copy-text')).toBe('https://247.bd/mGnw4Cm')

    await wrapper.get('button.btn-secondary').trigger('click')
    expect(wrapper.findComponent(QrcodeVue).props('value')).toBe('https://247.bd/mGnw4Cm')
  })

  it('surfaces field validation and rate-limit errors', async () => {
    const wrapper = setup(vi.fn().mockRejectedValue({ status: 429, data: { errors: { destination_url: ['The URL is invalid.'] } } }))
    await wrapper.get('#destination-url').setValue('bad')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('The URL is invalid.'))
  })
})
