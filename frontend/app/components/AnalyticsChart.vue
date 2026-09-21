<script setup lang="ts">
const props = defineProps<{ points: Array<{ date: string; clicks: number }> }>()
const max = computed(() => Math.max(...props.points.map(point => point.clicks), 1))
</script>
<template><div class="surface p-6"><div class="flex h-56 items-end gap-1" role="img" :aria-label="`Clicks over ${points.length} days`"><div v-for="point in points" :key="point.date" class="group relative flex min-w-0 flex-1 flex-col justify-end"><span class="sr-only">{{ point.date }}: {{ point.clicks }} clicks</span><div class="min-h-1 rounded-t bg-teal-300 transition group-hover:bg-teal-200" :style="{ height: `${Math.max((point.clicks / max) * 100, 2)}%` }" :title="`${point.date}: ${point.clicks}`" /></div></div><div class="mt-3 flex justify-between text-xs text-slate-500"><span>{{ points[0]?.date }}</span><span>{{ points.at(-1)?.date }}</span></div></div></template>
