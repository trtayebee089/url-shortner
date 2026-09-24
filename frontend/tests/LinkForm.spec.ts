import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LinkForm from '../app/components/LinkForm.vue'

describe('LinkForm', () => {
  it('normalizes tags and optional values before submission', async () => {
    const wrapper = mount(LinkForm)
    await wrapper.get('#destination').setValue('https://example.com/path?x=1')
    await wrapper.get('#tags').setValue('campaign, social, campaign')
    await wrapper.get('form').trigger('submit')
    const payload = wrapper.emitted('submit')?.[0]?.[0] as Record<string, unknown>
    expect(payload.destination_url).toBe('https://example.com/path?x=1')
    expect(payload.custom_alias).toBeNull()
    expect(payload.expires_at).toBeNull()
    expect(payload.tags).toEqual(['campaign', 'social', 'campaign'])
  })

  it('shows a simple creation form and keeps all advanced fields available', async () => {
    const wrapper = mount(LinkForm, { props: { simpleCreate: true, submitLabel: 'Create short link' } })
    expect(wrapper.text()).toContain('Custom alias (optional)')
    expect(wrapper.text()).toContain('Create short link')
    expect(wrapper.find('#expires').exists()).toBe(false)
    expect(wrapper.find('#title').exists()).toBe(false)
    expect(wrapper.find('#description').exists()).toBe(false)
    expect(wrapper.find('#tags').exists()).toBe(false)
    expect(wrapper.get('#destination').attributes('required')).toBeDefined()
    expect(wrapper.get('#alias').attributes('required')).toBeUndefined()
    await wrapper.get('button[aria-controls="advanced-link-options"]').trigger('click')
    expect(wrapper.find('#expires').exists()).toBe(true)
    expect(wrapper.find('#title').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('#tags').exists()).toBe(true)
    await wrapper.get('#destination').setValue('https://example.com')
    await wrapper.get('#expires').setValue('2030-01-01T12:00')
    await wrapper.get('#title').setValue('Campaign')
    await wrapper.get('#tags').setValue('social, launch')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ destination_url: 'https://example.com', custom_alias: null, expires_at: '2030-01-01T12:00', title: 'Campaign', tags: ['social', 'launch'] })
  })
})
