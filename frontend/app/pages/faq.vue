<script setup lang="ts">
useSeoPage('FAQ', 'Answers about short links, analytics, privacy, expiration, and deployment.', '/faq')
const items = [['Can I choose my own alias?','Yes. Managed links support unique aliases using letters, numbers, hyphens, and underscores.'],['What happens when I edit a destination?','The same short URL begins redirecting to the new destination. The backend invalidates its cached redirect metadata immediately.'],['Do links expire?','Only when you set an expiration. Expired links return an unavailable response and are not redirected.'],['How are unique visitors counted?','The redirect layer creates a keyed, daily hash before queueing analytics. Raw IP addresses are not stored.'],['Can analytics delay a redirect?','No. A valid destination is returned as a 302 even if analytics dispatch is unavailable.'],['Does 247URL support custom domains?','The deployment architecture supports a separate short domain. A self-service verification workflow is not implemented yet.'],['Is billing active?','No. The current release is self-hosted and has no payment processor or entitlement enforcement.'],['How do API tokens work?','Tokens have scoped link and analytics abilities, expire by default after 90 days, and are shown only once when created.']]
const open = ref<number | null>(0)

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text },
      })),
    }),
  }],
})
</script>
<template><section class="container-shell grid gap-12 py-20 lg:grid-cols-[.75fr_1.25fr]"><div><p class="eyebrow">Support</p><h1 class="mt-3 text-5xl font-bold tracking-[-0.035em]">Frequently asked questions.</h1><p class="mt-5 text-base text-text-secondary">Clear answers about how the current product works. Still need help? <NuxtLink to="/contact" class="text-brand">Contact us.</NuxtLink></p></div><div class="divide-y divide-border border-y border-border"><div v-for="(item,i) in items" :key="item[0]"><button class="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium" :aria-expanded="open===i" @click="open=open===i?null:i"><span>{{ item[0] }}</span><span class="text-text-muted">{{ open===i?'−':'+' }}</span></button><p v-if="open===i" class="pb-4 text-sm leading-relaxed text-text-secondary">{{ item[1] }}</p></div></div></section></template>
