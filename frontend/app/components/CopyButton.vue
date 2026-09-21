<script setup lang="ts">
const props = withDefaults(defineProps<{ text: string; label?: string }>(), { label: 'Copy' })
const copied = ref(false)
const { show } = useToast()
async function copy() { try { await navigator.clipboard.writeText(props.text); copied.value = true; show('Link copied to clipboard.'); setTimeout(() => { copied.value = false }, 1800) } catch { show('Copy failed. Select and copy the link manually.', 'error') } }
</script>
<template><button type="button" class="btn-secondary h-8 px-3 text-xs" :aria-label="copied ? 'Copied' : `Copy ${label.toLowerCase()}`" @click="copy"><svg v-if="copied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>{{ copied ? 'Copied!' : label }}</button></template>
