<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import type { ApiEnvelope, LinkRecord } from '~/types/api'

const { compact = false } = defineProps<{ compact?: boolean }>()
const destinationUrl = ref('')
const customAlias = ref('')
const loading = ref(false)
const result = ref<LinkRecord | null>(null)
const error = ref('')
const errors = ref<Record<string, string[]>>({})
const showQr = ref(false)
const { user } = useAuth()

async function submit() {
  loading.value = true; error.value = ''; errors.value = {}; result.value = null
  try {
    const endpoint = user.value ? '/api/backend/links' : '/api/backend/public/links'
    const response = await $fetch<ApiEnvelope<LinkRecord>>(endpoint, { method: 'POST', body: { destination_url: destinationUrl.value, custom_alias: customAlias.value || null } })
    result.value = response.data
  } catch (exception: any) {
    errors.value = exception?.data?.errors || {}
    error.value = exception?.data?.message || 'We could not create that short link. Please try again.'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="surface p-5 shadow-glow sm:p-7">
    <form class="grid gap-4" :class="compact ? 'lg:grid-cols-[1fr_14rem_auto]' : ''" novalidate @submit.prevent="submit">
      <div><label for="destination-url" class="label">Destination URL</label><input id="destination-url" v-model="destinationUrl" class="input" type="url" required placeholder="https://example.com/your-long-url" autocomplete="url" :aria-invalid="Boolean(errors.destination_url)" aria-describedby="destination-error"><p id="destination-error" class="mt-2 text-sm text-rose-300" role="alert">{{ errors.destination_url?.[0] }}</p></div>
      <div><label for="custom-alias" class="label">Custom alias <span class="font-normal text-slate-500">optional</span></label><input id="custom-alias" v-model="customAlias" class="input" type="text" maxlength="64" pattern="[A-Za-z0-9_-]+" placeholder="launch-2026" :aria-invalid="Boolean(errors.custom_alias)"><p class="mt-2 text-sm text-rose-300" role="alert">{{ errors.custom_alias?.[0] }}</p></div>
      <button class="btn-primary self-start lg:mt-7" type="submit" :disabled="loading || !destinationUrl">{{ loading ? 'Shortening…' : 'Shorten URL' }}</button>
    </form>
    <p v-if="error && !Object.keys(errors).length" class="mt-4 text-sm text-rose-300" role="alert">{{ error }}</p>
    <div v-if="result" class="mt-6 rounded-2xl border border-teal-300/25 bg-teal-300/5 p-5" aria-live="polite">
      <p class="text-sm font-semibold text-teal-200">Your short link is ready</p><div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"><a :href="result.short_url" target="_blank" rel="noopener noreferrer nofollow" class="min-w-0 flex-1 truncate text-lg font-bold text-white underline decoration-teal-300/40 underline-offset-4">{{ result.short_url }}</a><CopyButton :text="result.short_url" /><button class="btn-secondary" type="button" @click="showQr = !showQr">{{ showQr ? 'Hide QR' : 'Show QR' }}</button></div>
      <div v-if="showQr" class="mt-5 inline-block rounded-xl bg-white p-4"><QrcodeVue :value="result.short_url" :size="180" level="M" render-as="svg" /></div>
    </div>
  </div>
</template>
