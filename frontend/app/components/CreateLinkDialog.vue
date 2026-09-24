<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { LinkRecord } from '~/types/api'

const emit = defineEmits<{ close: []; created: [link: LinkRecord] }>()
const { create } = useLinks()
const dialog = ref<HTMLDialogElement | null>(null)
const loading = ref(false)
const error = ref('')
const created = ref<LinkRecord | null>(null)
const showQr = ref(false)
let opener: HTMLElement | null = null

const canonicalUrl = computed(() => created.value ? `https://247.bd/${encodeURIComponent(created.value.short_code)}` : '')

onMounted(async () => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value?.showModal()
  await nextTick()
  dialog.value?.querySelector<HTMLInputElement>('#destination')?.focus()
})

onBeforeUnmount(() => { if (dialog.value?.open) dialog.value.close() })

function close() { dialog.value?.close() }
function onClose() { opener?.focus(); emit('close') }
function onCancel(event: Event) { event.preventDefault(); close() }
function onBackdropClick(event: MouseEvent) { if (event.target === dialog.value) close() }

async function submit(payload: Record<string, unknown>) {
  loading.value = true
  error.value = ''
  try {
    const response = await create(payload)
    created.value = response.data
    emit('created', response.data)
    await nextTick()
    dialog.value?.querySelector<HTMLButtonElement>('[data-done]')?.focus()
  } catch (e: any) {
    error.value = Object.values(e?.data?.errors || {}).flat().join(' ') || e?.data?.message || 'Unable to create link.'
  } finally { loading.value = false }
}

function createAnother() {
  created.value = null
  showQr.value = false
  nextTick(() => dialog.value?.querySelector<HTMLInputElement>('#destination')?.focus())
}
</script>

<template>
  <dialog ref="dialog" role="dialog" aria-modal="true" class="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] overflow-hidden rounded-2xl border border-border bg-white p-0 text-text-primary shadow-modal backdrop:bg-slate-900/45" aria-labelledby="create-link-title" aria-describedby="create-link-description" @cancel="onCancel" @close="onClose" @click="onBackdropClick">
    <div class="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div><h2 id="create-link-title" class="text-lg font-semibold">Create a short link</h2><p id="create-link-description" class="mt-1 text-sm text-text-secondary">Create a link and save it to your workspace.</p></div>
      <button type="button" class="grid size-7 shrink-0 place-items-center rounded text-xl text-text-muted hover:bg-surface2 hover:text-text-primary" aria-label="Close create link dialog" @click="close">×</button>
    </div>
    <div class="max-h-[calc(100dvh-8rem)] overflow-y-auto px-5 py-5 sm:px-6">
      <p v-if="error" class="mb-4 rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger" role="alert">{{ error }}</p>
      <LinkForm v-if="!created" simple-create modal submit-label="Create link" :loading="loading" @submit="submit" @cancel="close" />
      <section v-else aria-live="polite">
        <h3 class="text-base font-semibold text-success">✓ Link created</h3>
        <p class="mt-1 text-sm text-text-secondary">Saved to your links.</p>
        <a :href="canonicalUrl" target="_blank" rel="noopener noreferrer" class="mt-4 block break-all rounded-md border border-border bg-brand-light p-3 text-sm font-semibold text-brand">{{ canonicalUrl }}</a>
        <div class="mt-4 flex flex-wrap gap-2"><CopyButton :text="canonicalUrl" /><button type="button" class="btn-secondary h-8 px-3 text-xs" @click="showQr = !showQr">{{ showQr ? 'Hide QR code' : 'QR code' }}</button></div>
        <div v-if="showQr" class="mt-4 inline-block rounded-md border border-border bg-white p-3"><QrcodeVue :value="canonicalUrl" :size="160" level="M" render-as="svg" /></div>
        <div class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4"><button type="button" class="text-sm font-medium text-brand hover:underline" @click="createAnother">Create another</button><button data-done type="button" class="btn-primary" @click="close">Done</button></div>
      </section>
    </div>
  </dialog>
</template>
