<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
onMounted(() => dialog.value?.showModal())
</script>
<template><dialog ref="dialog" class="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-0 text-text-primary shadow-xl backdrop:bg-black/35" aria-labelledby="admin-dialog-title" @cancel.prevent="emit('close')"><div class="flex items-center justify-between border-b border-border px-6 py-4"><h2 id="admin-dialog-title" class="text-lg font-semibold">{{ title }}</h2><button type="button" class="btn-ghost" aria-label="Close dialog" @click="emit('close')">×</button></div><div class="p-6"><slot/></div></dialog></template>
