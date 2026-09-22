<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import type { ApiEnvelope, LinkRecord } from '~/types/api'
import { ref } from 'vue'
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const destinationUrl = ref(''); const customAlias = ref(''); const loading = ref(false); const result = ref<LinkRecord | null>(null); const error = ref(''); const errors = ref<Record<string, string[]>>({}); const showQr = ref(false)
const { user } = useAuth(); const { show } = useToast(); const { request } = useApi()
async function submit() {
  loading.value = true; error.value = ''; errors.value = {}; result.value = null
  try { const endpoint = user.value ? 'links' : 'public/links'; const response = await request<ApiEnvelope<LinkRecord>>(endpoint, { method: 'POST', body: { destination_url: destinationUrl.value, custom_alias: customAlias.value || null } }); result.value = response.data; show('Short link created.') }
  catch (exception: any) { errors.value = exception?.data?.errors || {}; error.value = exception?.status === 429 ? 'Rate limit reached. Please wait and try again.' : exception?.data?.message || 'We could not create that short link. Check your connection and try again.' }
  finally { loading.value = false }
}
</script>
<template>
  <div class="rounded-xl border border-border bg-canvas p-5 shadow-sm sm:p-6">
    <div class="mb-4 flex items-center gap-2"><span class="size-2 rounded-full bg-success"/><span class="text-xs font-medium text-text-secondary">Try it — no account needed</span></div>
    <form class="grid gap-3" :class="compact ? 'sm:grid-cols-[1fr_11rem_auto] sm:items-start' : 'lg:grid-cols-[1fr_12rem_auto] lg:items-start'" novalidate @submit.prevent="submit">
      <div><label for="destination-url" class="label">Destination URL</label><input id="destination-url" v-model="destinationUrl" class="input" :class="errors.destination_url ? 'border-danger' : ''" type="url" required placeholder="https://your-long-url.com/example/campaign" autocomplete="url" :aria-invalid="Boolean(errors.destination_url)" aria-describedby="destination-error"><p id="destination-error" class="field-error" role="alert">{{ errors.destination_url?.[0] }}</p></div>
      <div><label for="custom-alias" class="label">Custom alias</label><input id="custom-alias" v-model="customAlias" class="input" type="text" maxlength="64" pattern="[A-Za-z0-9_-]+" placeholder="summer-sale" :aria-invalid="Boolean(errors.custom_alias)"><p class="field-error" role="alert">{{ errors.custom_alias?.[0] }}</p></div>
      <button class="btn-primary btn-lg self-start lg:mt-[22px]" type="submit" :disabled="loading || !destinationUrl"><svg v-if="loading" class="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>{{ loading ? 'Shortening…' : 'Shorten link' }}</button>
    </form>
    <p v-if="error && !Object.keys(errors).length" class="mt-4 rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger" role="alert">{{ error }}</p>
    <div v-if="result" class="mt-5 rounded-lg border border-success-border bg-success-bg p-4" aria-live="polite"><div class="flex flex-col gap-3 sm:flex-row sm:items-center"><div class="min-w-0 flex-1"><p class="text-xs font-medium text-success">Your short link is ready</p><a :href="result.short_url" target="_blank" rel="noopener noreferrer nofollow" class="mt-1 block truncate font-semibold text-text-primary">{{ result.short_url }}</a><p class="mt-0.5 truncate text-xs text-text-muted">{{ result.destination_url }}</p></div><CopyButton :text="result.short_url"/><button class="btn-secondary h-8 px-3 text-xs" type="button" @click="showQr = !showQr">{{ showQr ? 'Hide QR' : 'Show QR' }}</button></div><div v-if="showQr" class="mt-4 inline-block rounded-md border border-border bg-white p-3"><QrcodeVue :value="result.short_url" :size="160" level="M" render-as="svg"/></div></div>
    <div class="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-text-muted"><span>✓ No credit card required</span><span>✓ Fast redirects</span><span>✓ Privacy-conscious analytics</span></div>
  </div>
</template>
