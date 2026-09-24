<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description: string; points: string[]; view: 'links' | 'domain' | 'analytics' | 'qr' | 'create'; reverse?: boolean }>()
</script>
<template>
  <section class="container-shell grid min-w-0 items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-20">
    <div :class="reverse ? 'lg:order-2' : ''"><p class="eyebrow">{{ eyebrow }}</p><h2 class="mt-3 max-w-lg text-3xl font-bold leading-tight tracking-[-.035em] sm:text-4xl">{{ title }}</h2><p class="mt-4 max-w-lg text-base leading-7 text-text-secondary">{{ description }}</p><ul class="mt-6 space-y-3"><li v-for="point in points" :key="point" class="flex items-start gap-3 text-sm leading-6 text-text-secondary"><span class="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-brand-light text-[10px] font-bold text-brand">✓</span>{{ point }}</li></ul></div>
    <div class="min-w-0 rounded-2xl bg-[#EEF2FF] p-4 sm:p-7" :class="reverse ? 'lg:order-1' : ''"><MarketingProductPreview :view="view" compact /></div>
  </section>
</template>
