<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description: string; points: string[]; view: 'links' | 'qr' | 'analytics' | 'create'; reverse?: boolean }>()
</script>

<template>
  <section class="border-t border-[#DCDDFC] bg-white">
    <div class="marketing-container grid min-w-0 items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24 xl:gap-24">
      <div class="min-w-0" :class="reverse ? 'lg:order-2' : ''"><p class="text-xs font-bold uppercase tracking-[.16em] text-brand">{{ eyebrow }}</p><h2 class="mt-4 text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">{{ title }}</h2><p class="mt-5 text-base leading-7 text-text-secondary lg:text-lg">{{ description }}</p><ul class="mt-7 space-y-3"><li v-for="point in points" :key="point" class="flex items-start gap-3 text-sm leading-6 text-text-secondary lg:text-base"><span class="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-light text-xs font-bold text-brand">✓</span><span>{{ point }}</span></li></ul></div>
      <div class="min-w-0 rounded-2xl bg-[#EEF2FF] p-4 md:p-6 lg:p-8" :class="reverse ? 'lg:order-1' : ''"><HomeProductPreview :view="view" /></div>
    </div>
  </section>
</template>
