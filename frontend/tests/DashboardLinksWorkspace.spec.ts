import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import CreateLinkDialog from '../app/components/CreateLinkDialog.vue'
import LinkForm from '../app/components/LinkForm.vue'
import LinkTable from '../app/components/LinkTable.vue'
import LinksPage from '../app/pages/dashboard/links/index.vue'

const demoLink = {
  id: 7, short_code: 'spring-launch', short_url: 'https://247.bd/spring-launch',
  destination_url: 'https://example.com/campaign/spring', custom_alias: 'spring-launch',
  title: 'Spring launch', description: null, is_active: true, is_expired: false,
  expires_at: null, clicks_count: 624, created_at: '2026-09-24T12:00:00Z',
  updated_at: '2026-09-24T12:00:00Z',
}

const copyStub = { props: ['text'], template: '<button type="button" data-test="copy" :data-text="text">Copy</button>' }
const linkStub = { props: ['to'], template: '<a :href="to"><slot/></a>' }

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
  vi.stubGlobal('definePageMeta', vi.fn())
  vi.stubGlobal('useSeoPage', vi.fn())
  vi.stubGlobal('useToast', () => ({ show: vi.fn() }))
})
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = '' })

describe('dashboard links workspace', () => {
  it('opens the create dialog from the Links page and closes with Cancel', async () => {
    vi.stubGlobal('useLinks', () => ({ links: ref([]), meta: ref(null), loading: ref(false), list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
    const wrapper = mount(LinksPage, { attachTo: document.body, global: {
      components: { CreateLinkDialog, LinkForm, LinkTable, CopyButton: copyStub },
      stubs: { LoadingState: true, EmptyState: { template: '<div><slot/></div>' } },
    } })
    const opener = wrapper.get('button.btn-primary')
    ;(opener.element as HTMLButtonElement).focus()
    await opener.trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
    expect(document.activeElement?.id).toBe('destination')
    await wrapper.get('button.btn-secondary').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener.element)
    wrapper.unmount()
  })

  it('supports Escape and preserves the advanced fields', async () => {
    vi.stubGlobal('useLinks', () => ({ create: vi.fn() }))
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()
    const wrapper = mount(CreateLinkDialog, { attachTo: document.body, global: { components: { LinkForm } } })
    await flushPromises()
    expect(wrapper.find('#expires').exists()).toBe(false)
    await wrapper.get('button[aria-controls="advanced-link-options"]').trigger('click')
    for (const id of ['expires', 'title', 'description', 'tags']) expect(wrapper.find(`#${id}`).exists()).toBe(true)
    expect(wrapper.text()).toContain('Link is active')
    await wrapper.get('dialog').trigger('cancel')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('keeps destination and alias validation in the shared form', async () => {
    vi.stubGlobal('useLinks', () => ({ create: vi.fn() }))
    const wrapper = mount(CreateLinkDialog, { attachTo: document.body, global: { components: { LinkForm } } })
    await flushPromises()
    const destination = wrapper.get('#destination')
    const alias = wrapper.get('#alias')
    expect((destination.element as HTMLInputElement).checkValidity()).toBe(false)
    await destination.setValue('not-a-url')
    expect((destination.element as HTMLInputElement).checkValidity()).toBe(false)
    await destination.setValue('https://example.com')
    await alias.setValue('bad alias')
    expect((alias.element as HTMLInputElement).checkValidity()).toBe(false)
    await alias.setValue('good-alias')
    expect((wrapper.get('form').element as HTMLFormElement).checkValidity()).toBe(true)
    wrapper.unmount()
  })

  it('creates with the existing payload and shows the canonical URL', async () => {
    const create = vi.fn().mockResolvedValue({ data: { ...demoLink, short_code: 'Ab12Cd', short_url: 'https://api.247.bd/Ab12Cd' } })
    vi.stubGlobal('useLinks', () => ({ create }))
    const wrapper = mount(CreateLinkDialog, { attachTo: document.body, global: {
      components: { LinkForm, CopyButton: copyStub },
    } })
    await flushPromises()
    await wrapper.get('#destination').setValue('https://example.com/campaign')
    await wrapper.get('#alias').setValue('summer-sale')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ destination_url: 'https://example.com/campaign', custom_alias: 'summer-sale' }))
    expect(wrapper.emitted('created')).toHaveLength(1)
    expect(wrapper.get('a[href="https://247.bd/Ab12Cd"]').text()).toBe('https://247.bd/Ab12Cd')
    expect(wrapper.get('[data-test="copy"]').attributes('data-text')).toBe('https://247.bd/Ab12Cd')
    await wrapper.get('[data-done]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('refreshes the list after creation and keeps row actions available', async () => {
    const links = ref([demoLink])
    const list = vi.fn().mockImplementation(async () => { links.value = [{ ...demoLink, id: 8, short_code: 'new-link', short_url: 'https://247.bd/new-link' }, demoLink] })
    const create = vi.fn().mockResolvedValue({ data: { ...demoLink, id: 8, short_code: 'new-link' } })
    const update = vi.fn().mockResolvedValue({ data: demoLink })
    const remove = vi.fn().mockResolvedValue({})
    vi.stubGlobal('useLinks', () => ({ links, meta: ref(null), loading: ref(false), list, create, update, remove }))
    vi.stubGlobal('confirm', () => true)
    const wrapper = mount(LinksPage, { attachTo: document.body, global: {
      components: { CreateLinkDialog, LinkForm, LinkTable, CopyButton: copyStub },
      stubs: { NuxtLink: linkStub, LoadingState: true },
    } })
    await wrapper.get('button.btn-primary').trigger('click')
    await flushPromises()
    await wrapper.get('#destination').setValue('https://example.com/new')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(list).toHaveBeenCalled()
    expect(wrapper.text()).toContain('new-link')
    expect(wrapper.find('a[href="/dashboard/links/7"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/dashboard/links/7/analytics"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="copy"]').exists()).toBe(true)
    const table = wrapper.findComponent(LinkTable)
    await table.findAll('button').find(button => button.text() === 'Disable')!.trigger('click')
    await flushPromises()
    expect(update).toHaveBeenCalledWith(8, { is_active: false })
    await table.findAll('button').find(button => button.text() === 'Delete')!.trigger('click')
    await flushPromises()
    expect(remove).toHaveBeenCalledWith(8)
    wrapper.unmount()
  })
})
