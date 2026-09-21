<script setup lang="ts">withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })</script>
<template><div class="grid gap-3" aria-live="polite" aria-label="Loading"><div v-for="i in rows" :key="i" class="h-20 animate-pulse rounded-lg border border-border bg-surface"><div class="m-5 h-3 w-2/3 rounded bg-surface2"/></div></div></template>
