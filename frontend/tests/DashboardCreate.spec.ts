import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QrcodeVue from 'qrcode.vue'
import CreatePage from '../app/pages/dashboard/links/create.vue'
import LinkForm from '../app/components/LinkForm.vue'

afterEach(() => vi.unstubAllGlobals())

describe('dashboard create link', () => {
  it('starts simple and shows the saved API short URL for copy and QR', async () => {
    const create = vi.fn().mockResolvedValue({ data: { id: 7, short_code: 'Ab12Cd', short_url: 'https://247.bd/Ab12Cd' } })
    vi.stubGlobal('definePageMeta', vi.fn())
    vi.stubGlobal('useSeoPage', vi.fn())
    vi.stubGlobal('useLinks', () => ({ create }))
    const wrapper = mount(CreatePage, { global: {
      components: { LinkForm, CopyButton: { props: ['text'], template: '<button data-test="copy" :data-copy-text="text">Copy</button>' } },
      stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot/></a>' } },
    } })
    expect(wrapper.text()).toContain('Create a short link')
    expect(wrapper.find('#destination').exists()).toBe(true)
    expect(wrapper.find('#alias').exists()).toBe(true)
    expect(wrapper.find('#expires').exists()).toBe(false)
    expect(wrapper.findComponent(QrcodeVue).exists()).toBe(false)
    await wrapper.get('#destination').setValue('https://example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ destination_url: 'https://example.com', custom_alias: null }))
    expect(wrapper.text()).toContain('Saved to your links')
    expect(wrapper.get('a[href="https://247.bd/Ab12Cd"]').text()).toBe('https://247.bd/Ab12Cd')
    expect(wrapper.get('[data-test="copy"]').attributes('data-copy-text')).toBe('https://247.bd/Ab12Cd')
    expect(wrapper.find('a[href="/dashboard/links/7/analytics"]').exists()).toBe(true)
    await wrapper.get('button.btn-secondary').trigger('click')
    expect(wrapper.findComponent(QrcodeVue).props('value')).toBe('https://247.bd/Ab12Cd')
  })
})
