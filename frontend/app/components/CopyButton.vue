<script setup lang="ts">
const props = defineProps<{ text: string }>()
const copied = ref(false)
async function copy() { await navigator.clipboard.writeText(props.text); copied.value = true; setTimeout(() => copied.value = false, 1800) }
</script>
<template><button type="button" class="btn-secondary" :aria-label="copied ? 'Copied' : 'Copy short URL'" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button></template>
