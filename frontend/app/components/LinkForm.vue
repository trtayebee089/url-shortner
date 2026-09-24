<script setup lang="ts">
import type { LinkRecord } from '~/types/api'
import { reactive, ref, watch } from 'vue'
const props = defineProps<{ link?: LinkRecord; submitLabel?: string; loading?: boolean; simpleCreate?: boolean }>()
const emit = defineEmits<{ submit: [payload: Record<string, unknown>]; change: [payload: Record<string, string | boolean>] }>()
const form = reactive({ destination_url: props.link?.destination_url || '', custom_alias: props.link?.custom_alias || '', title: props.link?.title || '', description: props.link?.description || '', expires_at: props.link?.expires_at?.slice(0, 16) || '', is_active: props.link?.is_active ?? true, tags: props.link?.tags?.join(', ') || '' })
const advancedOpen = ref(false)
watch(form, () => emit('change', { ...form }), { deep: true, immediate: true })
function submit() { emit('submit', { ...form, custom_alias: form.custom_alias || null, expires_at: form.expires_at || null, tags: form.tags.split(',').map(v => v.trim()).filter(Boolean) }) }
</script>
<template>
  <form class="surface grid gap-5 p-5 sm:p-6" @submit.prevent="submit">
    <div><label class="label" for="destination">Destination URL</label><input id="destination" v-model="form.destination_url" class="input" type="url" required placeholder="https://example.com/campaign"><p class="mt-1.5 text-xs text-text-muted">Only valid HTTP and HTTPS destinations are accepted.</p></div>
    <div :class="simpleCreate ? '' : 'grid gap-5 sm:grid-cols-2'"><div><label class="label" for="alias">Custom alias <span v-if="simpleCreate" class="text-text-muted">(optional)</span></label><div class="flex rounded-md border border-border bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"><span class="border-r border-border bg-surface2 px-2 py-2.5 text-xs text-text-muted">/</span><input id="alias" v-model="form.custom_alias" class="min-w-0 flex-1 rounded-r-md px-3 py-2 text-sm outline-none" pattern="[A-Za-z0-9_-]+" minlength="3" maxlength="64" placeholder="summer-sale"></div></div><div v-if="!simpleCreate"><label class="label" for="expires">Expiration</label><input id="expires" v-model="form.expires_at" class="input" type="datetime-local"></div></div>
    <div v-if="simpleCreate && !advancedOpen" class="flex justify-end"><button class="btn-primary" :disabled="loading">{{ loading ? 'Creating…' : (submitLabel || 'Create short link') }}</button></div>
    <button v-if="simpleCreate" type="button" class="flex w-full items-center justify-between rounded-md border border-border px-4 py-3 text-left text-sm font-medium text-text-secondary hover:bg-surface2" :aria-expanded="advancedOpen" aria-controls="advanced-link-options" @click="advancedOpen = !advancedOpen"><span>Advanced options</span><svg class="size-4 transition-transform" :class="advancedOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div v-if="!simpleCreate || advancedOpen" id="advanced-link-options" class="grid gap-5">
      <div v-if="simpleCreate"><label class="label" for="expires">Expiration</label><input id="expires" v-model="form.expires_at" class="input" type="datetime-local"></div>
      <div><label class="label" for="title">Title</label><input id="title" v-model="form.title" class="input" maxlength="160" placeholder="Summer campaign"></div>
      <div><label class="label" for="description">Description</label><textarea id="description" v-model="form.description" class="input min-h-24 resize-y" maxlength="2000" placeholder="Optional context for your team."/></div>
      <div><label class="label" for="tags">Tags</label><input id="tags" v-model="form.tags" class="input" placeholder="campaign, social, launch"><p class="mt-1.5 text-xs text-text-muted">Separate up to 10 tags with commas.</p></div>
      <label class="flex items-start justify-between gap-4 border-t border-border pt-4"><span><span class="block text-sm font-medium">Link is active</span><span class="block text-xs text-text-muted">Disabled links return an unavailable response.</span></span><input v-model="form.is_active" type="checkbox" class="mt-1 size-4 accent-brand"></label>
    </div>
    <div v-if="!simpleCreate || advancedOpen" class="flex justify-end"><button class="btn-primary" :disabled="loading"><span v-if="loading">Saving…</span><span v-else>{{ submitLabel || 'Save link' }}</span></button></div>
  </form>
</template>
