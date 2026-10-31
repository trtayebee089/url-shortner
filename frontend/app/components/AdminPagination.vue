<script setup lang="ts">
defineProps<{ current: number; last: number; total: number; pending?: boolean }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>
<template><div class="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-text-muted"><span>{{ total }} records · Page {{ current }} of {{ last }}</span><div class="flex gap-2"><button class="btn-secondary" :disabled="current<=1 || pending" @click="emit('change',current-1)">Previous</button><button class="btn-secondary" :disabled="current>=last || pending" @click="emit('change',current+1)">Next</button></div></div></template>
