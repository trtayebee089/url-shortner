<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

withDefaults(defineProps<{ view?: 'links' | 'qr' | 'analytics' | 'create'; compact?: boolean }>(), { view: 'links', compact: false })

const links = [
  { title: 'Spring launch', code: 'spring-launch', destination: 'example.com/launch', clicks: '624', status: 'Active' },
  { title: 'Event registration', code: 'event', destination: 'example.com/event', clicks: '412', status: 'Active' },
  { title: 'Product update', code: 'update', destination: 'example.com/update', clicks: '248', status: 'Disabled' },
]
</script>

<template>
  <div class="w-full min-w-0 overflow-hidden rounded-2xl border border-[#d8dce5] bg-white text-[#10243c] shadow-[0_24px_60px_rgba(8,28,52,.13)]" aria-label="Illustrative 247URL product interface">
    <div class="flex min-h-11 items-center justify-between gap-3 border-b border-[#e6e9ef] bg-[#fbfcfe] px-4 sm:px-5">
      <span class="flex items-center gap-2 text-xs font-bold"><span class="grid size-5 place-items-center rounded bg-brand text-[12px] text-white">↗</span>247URL <span class="hidden font-medium text-[#7b8799] sm:inline">/ Demo workspace</span></span>
      <span class="text-[10px] font-medium text-[#7b8799]">Illustrative product UI · demo data</span>
    </div>
    <div class="grid min-w-0" :class="compact ? '' : 'sm:grid-cols-[72px_minmax(0,1fr)]'">
      <aside v-if="!compact" class="hidden border-r border-[#e6e9ef] bg-[#f8f9fc] px-3 py-5 sm:block" aria-hidden="true"><div class="grid justify-items-center gap-5 text-sm text-[#8a94a5]"><span class="grid size-8 place-items-center rounded-md bg-brand-light font-bold text-brand">▦</span><span>↗</span><span>⌁</span><span>▣</span></div></aside>
      <div class="min-w-0" :class="compact ? 'p-4' : 'p-5 sm:p-7'">
        <template v-if="view === 'links'">
          <div class="flex flex-wrap items-center justify-between gap-2"><div><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#8994a5]">Link management</p><p class="mt-1 text-xl font-bold sm:text-2xl">Your links</p></div><span class="rounded-md bg-brand px-3 py-2 text-[11px] font-semibold text-white">+ Create link</span></div>
          <div class="mt-5 grid grid-cols-3 gap-2.5"><div v-for="item in [['3', 'Links'], ['1,284', 'Clicks'], ['860', 'Visitors']]" :key="item[1]" class="rounded-lg border border-[#e5e8ee] bg-[#fbfcfe] p-3"><p class="text-lg font-bold sm:text-xl">{{ item[0] }}</p><p class="text-[10px] text-[#7a8799]">{{ item[1] }}</p></div></div>
          <div class="mt-5 overflow-hidden rounded-lg border border-[#e5e8ee]"><div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-[#e5e8ee] bg-[#f8f9fc] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#8490a1] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_70px_72px]"><span>Short link</span><span class="hidden md:block">Destination</span><span class="hidden md:block">Clicks</span><span>Status</span></div><div v-for="link in links" :key="link.code" class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-[#edf0f4] px-3 py-3 last:border-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_70px_72px]"><div class="min-w-0"><p class="truncate text-xs font-semibold">{{ link.title }}</p><p class="truncate text-[11px] font-medium text-brand">247.bd/{{ link.code }}</p></div><span class="hidden truncate text-[11px] text-[#7a8799] md:block">{{ link.destination }}</span><span class="hidden text-[11px] font-semibold md:block">{{ link.clicks }}</span><span class="rounded-full px-2 py-1 text-center text-[10px] font-medium" :class="link.status === 'Active' ? 'bg-[#ebf8f0] text-[#188351]' : 'bg-[#f1f3f6] text-[#7d8999]'">{{ link.status }}</span></div></div>
        </template>
        <template v-else-if="view === 'qr'">
          <p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#8994a5]">QR codes</p><p class="mt-1 text-xl font-bold sm:text-2xl">Share one link anywhere.</p><p class="mt-2 text-xs leading-5 text-[#697789]">A QR code opens the same short destination.</p><div class="mt-5 flex flex-wrap items-center justify-center gap-5 rounded-xl border border-[#e5e8ee] bg-[#f8f9fc] p-5 sm:justify-start"><div class="rounded-lg border border-[#e5e8ee] bg-white p-3 shadow-sm"><QrcodeVue value="https://247.bd/event" :size="compact ? 116 : 156" level="M" render-as="svg" /></div><div class="min-w-0"><p class="text-[10px] font-bold uppercase tracking-wide text-[#8a94a5]">Example link</p><p class="mt-2 text-sm font-bold text-brand">247.bd/event</p><p class="mt-1 text-xs text-[#697789]">Scan to open a demo destination.</p><span class="mt-4 inline-block rounded-md border border-[#d8dce5] bg-white px-3 py-1.5 text-[11px] font-semibold">QR ready</span></div></div>
        </template>
        <template v-else-if="view === 'analytics'">
          <p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#8994a5]">Analytics</p><p class="mt-1 text-xl font-bold sm:text-2xl">See what works.</p><div class="mt-4 grid grid-cols-2 gap-2.5"><div class="rounded-lg border border-[#e5e8ee] p-3"><p class="text-[10px] text-[#7a8799]">Clicks</p><p class="mt-1 text-xl font-bold">1,284</p></div><div class="rounded-lg border border-[#e5e8ee] p-3"><p class="text-[10px] text-[#7a8799]">Visitors</p><p class="mt-1 text-xl font-bold">860</p></div></div><div class="mt-3 rounded-lg border border-[#e5e8ee] bg-white p-3"><div class="flex justify-between text-[10px] text-[#7a8799]"><span>Clicks over time</span><span>30 days</span></div><svg class="mt-3 h-24 w-full sm:h-32" viewBox="0 0 500 130" preserveAspectRatio="none" role="img" aria-label="Illustrative upward click trend"><defs><linearGradient id="home-preview-chart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f46e5" stop-opacity=".16"/><stop offset="1" stop-color="#4f46e5" stop-opacity="0"/></linearGradient></defs><path d="M0 112 L45 97 L90 101 L135 81 L180 88 L225 69 L270 72 L315 47 L360 54 L405 36 L450 43 L500 15 L500 130 L0 130Z" fill="url(#home-preview-chart)"/><path d="M0 112 L45 97 L90 101 L135 81 L180 88 L225 69 L270 72 L315 47 L360 54 L405 36 L450 43 L500 15" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        </template>
        <template v-else>
          <p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#8994a5]">Create a link</p><p class="mt-1 text-xl font-bold sm:text-2xl">From long to memorable.</p><div class="mt-5 space-y-4 rounded-xl border border-[#e5e8ee] bg-[#f8f9fc] p-4"><div><p class="text-[10px] font-bold uppercase tracking-wide text-[#7a8799]">Destination URL</p><div class="mt-1 rounded-md border border-[#d8dce5] bg-white px-3 py-2.5 text-xs text-[#697789]">https://example.com/your-campaign</div></div><div><p class="text-[10px] font-bold uppercase tracking-wide text-[#7a8799]">Custom alias</p><div class="mt-1 rounded-md border border-[#d8dce5] bg-white px-3 py-2.5 text-xs text-brand">spring-launch</div></div><span class="inline-block rounded-md bg-brand px-4 py-2 text-[11px] font-semibold text-white">Create short link</span></div>
        </template>
      </div>
    </div>
  </div>
</template>
