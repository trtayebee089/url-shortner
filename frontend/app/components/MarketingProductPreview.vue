<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

withDefaults(defineProps<{ view?: 'links' | 'domain' | 'analytics' | 'qr' | 'create'; compact?: boolean }>(), { view: 'links', compact: false })
const demoLinks = [
  { name: 'Spring launch', path: '/spring-launch', destination: 'example.com/spring-launch', status: 'Active' },
  { name: 'Event registration', path: '/event', destination: 'example.com/events', status: 'Active' },
  { name: 'Product update', path: '/update', destination: 'example.com/updates', status: 'Disabled' },
]
const chart = [12, 19, 16, 31, 25, 38, 29, 45, 43, 52, 48, 64].map((clicks, i) => ({ date: `Day ${i + 1}`, clicks }))
</script>

<template>
  <div class="preview-window overflow-hidden rounded-2xl border border-[#dcdce8] bg-white shadow-[0_22px_55px_rgba(8,28,52,.13)]" aria-label="Illustrative 247URL product preview">
    <div class="flex items-center justify-between border-b border-border bg-[#F8F7FF] px-4 py-2.5 text-[11px] text-text-muted sm:px-6">
      <span class="flex items-center gap-2 font-semibold text-text-primary"><span class="grid size-5 place-items-center rounded bg-brand text-[10px] text-white">↗</span>247URL workspace</span>
      <span>Illustrative preview</span>
    </div>
    <div class="grid min-w-0" :class="compact ? '' : 'sm:grid-cols-[64px_1fr]'">
      <div v-if="!compact" class="hidden border-r border-border bg-[#F8F7FF] py-5 text-center text-sm text-text-muted sm:grid sm:content-start sm:gap-5"><span class="text-brand">▦</span><span>↗</span><span>⌁</span><span>▣</span></div>
      <div class="min-w-0 p-4 sm:p-6">
        <template v-if="view === 'links'">
          <div class="flex flex-wrap items-center justify-between gap-2"><div><p class="text-[10px] uppercase tracking-wider text-text-muted">Link management</p><h3 class="text-lg font-bold">Your links</h3></div><span class="rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-white">Create link</span></div>
          <div class="mt-4 flex gap-2 border-b border-border pb-3 text-[10px] font-medium"><span class="rounded bg-brand-light px-2 py-1 text-brand">All links</span><span class="px-2 py-1 text-text-muted">Active</span><span class="px-2 py-1 text-text-muted">Disabled</span></div>
          <div v-for="link in demoLinks" :key="link.path" class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-border py-3 last:border-0"><div class="min-w-0"><p class="truncate text-xs font-semibold">{{ link.name }}</p><p class="truncate text-[11px] text-brand">247.bd{{ link.path }} <span class="text-text-muted">→ {{ link.destination }}</span></p></div><span class="rounded-full px-2 py-0.5 text-[10px] font-medium" :class="link.status === 'Active' ? 'bg-success-bg text-success' : 'bg-surface2 text-text-muted'">{{ link.status }}</span></div>
        </template>
        <template v-else-if="view === 'domain'"><p class="text-[10px] uppercase tracking-wider text-text-muted">Custom aliases</p><h3 class="mt-1 text-lg font-bold">Make links easy to recognize.</h3><p class="mt-2 text-xs text-text-secondary">Choose a memorable alias for a managed link.</p><div class="mt-5 rounded-lg border border-border bg-canvas p-4"><p class="text-[10px] font-semibold text-text-muted">SHORT LINK</p><div class="mt-2 flex min-w-0 items-center rounded-md border border-border bg-white text-xs"><span class="border-r border-border bg-surface2 px-3 py-2.5">247.bd/</span><span class="min-w-0 truncate px-3 font-semibold text-brand">spring-launch</span></div><p class="mt-3 truncate text-[11px] text-text-muted">Destination: example.com/spring-launch</p></div></template>
        <template v-else-if="view === 'analytics'"><p class="text-[10px] uppercase tracking-wider text-text-muted">Click analytics</p><h3 class="mt-1 text-lg font-bold">See what happens after the click.</h3><div class="mt-4 grid grid-cols-2 gap-2"><div class="rounded-lg border border-border p-3"><p class="text-[10px] text-text-muted">Total clicks</p><p class="mt-1 text-lg font-bold">—</p></div><div class="rounded-lg border border-border p-3"><p class="text-[10px] text-text-muted">Unique visitors</p><p class="mt-1 text-lg font-bold">—</p></div></div><div class="mt-3 rounded-lg border border-border p-3"><AnalyticsChart :points="chart" /></div><p class="mt-2 text-[10px] text-text-muted">Demo chart shape; no customer data shown.</p></template>
        <template v-else-if="view === 'qr'"><p class="text-[10px] uppercase tracking-wider text-text-muted">QR codes</p><h3 class="mt-1 text-lg font-bold">One link, more ways to share.</h3><div class="mt-4 flex flex-col items-center gap-3 rounded-lg border border-border bg-[#F8F7FF] p-5"><div class="rounded-lg border border-border bg-white p-3"><QrcodeVue value="https://example.com/demo" :size="132" level="M" render-as="svg" /></div><p class="text-[11px] text-text-muted">Example QR code · demo destination</p></div></template>
        <template v-else><p class="text-[10px] uppercase tracking-wider text-text-muted">Create a link</p><h3 class="mt-1 text-lg font-bold">A shorter path from idea to share.</h3><div class="mt-4 space-y-3 rounded-lg border border-border bg-canvas p-4"><div><p class="text-[10px] font-semibold text-text-muted">DESTINATION URL</p><div class="mt-1 rounded-md border border-border bg-white px-3 py-2 text-xs text-text-secondary">https://example.com/your-campaign</div></div><div><p class="text-[10px] font-semibold text-text-muted">CUSTOM ALIAS</p><div class="mt-1 rounded-md border border-border bg-white px-3 py-2 text-xs text-text-secondary">spring-launch</div></div><span class="inline-block rounded-md bg-brand px-3 py-2 text-[11px] font-semibold text-white">Create short link</span></div></template>
      </div>
    </div>
  </div>
</template>
