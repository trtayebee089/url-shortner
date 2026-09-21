<script setup lang="ts">
const props = withDefaults(defineProps<{ points: Array<{ date: string; clicks: number; unique_clicks?: number }>; height?: number }>(), { height: 160 })
const width = 800; const pad = 6
const max = computed(() => Math.max(...props.points.map(p => p.clicks), 1))
const path = computed(() => props.points.map((p, i) => `${i ? 'L' : 'M'}${pad + (i / Math.max(props.points.length - 1, 1)) * (width - pad * 2)},${props.height - pad - (p.clicks / max.value) * (props.height - pad * 2)}`).join(' '))
const area = computed(() => props.points.length ? `${path.value} L${width - pad},${props.height} L${pad},${props.height} Z` : '')
</script>
<template><div class="surface p-5"><svg v-if="points.length" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="w-full" :style="{ height: `${height}px` }" role="img" :aria-label="`Clicks over ${points.length} days`"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4F46E5" stop-opacity=".16"/><stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/></linearGradient></defs><path :d="area" fill="url(#chart-fill)"/><path :d="path" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><div v-else class="grid h-40 place-items-center text-sm text-text-muted">No analytics data yet.</div><div v-if="points.length" class="mt-3 flex justify-between text-[10px] text-text-muted"><span>{{ points[0]?.date }}</span><span>{{ points.at(-1)?.date }}</span></div></div></template>
