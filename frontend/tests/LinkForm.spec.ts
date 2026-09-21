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
})
