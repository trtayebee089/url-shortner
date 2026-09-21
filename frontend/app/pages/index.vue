<script setup lang="ts">
useSeoPage('Short links that move at internet speed', 'Create branded short URLs, privacy-conscious analytics, and QR codes with a fast, reliable redirect platform.')
useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: '247URL', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }) }] })
const faqs = [
  ['Can I choose my own short link?', 'Yes. Add a custom alias when you shorten a URL. Reserved and already-used aliases are protected.'],
  ['Do short links expire?', 'Only when you choose an expiration date in your dashboard. Expired links remain in your account and are not deleted.'],
  ['What analytics are collected?', 'We record aggregate click trends, referrers, device categories, and coarse location only when configured. Raw IP addresses are not stored.'],
  ['Can I use another short domain?', 'Yes. The short-link domain is configuration-driven, so a dedicated domain can be added without changing link logic.'],
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-white/10 py-16 sm:py-24">
      <div class="pointer-events-none absolute inset-x-0 top-0 mx-auto h-96 max-w-4xl rounded-full bg-teal-300/10 blur-3xl" />
      <div class="container-shell relative">
        <div class="mx-auto max-w-4xl text-center"><p class="eyebrow">Fast by design. Clear by default.</p><h1 class="mt-5 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">Turn unwieldy URLs into links people trust.</h1><p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Create a clean short link in seconds. Sign in when you need campaign analytics, editable destinations, QR codes, and organized link management.</p></div>
        <div class="mx-auto mt-10 max-w-5xl"><UrlShortenerForm compact /></div>
        <p class="mt-5 text-center text-sm text-slate-500">HTTP and HTTPS links only. We never fetch your destination from our servers.</p>
      </div>
    </section>

    <section class="container-shell py-20" aria-labelledby="how-heading"><div class="max-w-2xl"><p class="eyebrow">How it works</p><h2 id="how-heading" class="mt-3 text-3xl font-black sm:text-4xl">One short path from paste to publish.</h2></div><ol class="mt-10 grid gap-5 md:grid-cols-3"><li v-for="(item, i) in [['Paste the destination', 'Keep query strings, fragments, and campaign parameters intact.'], ['Choose your link', 'Use a collision-resistant code or claim a memorable custom alias.'], ['Share and learn', 'Copy, download a QR code, and view click trends from your dashboard.']]" :key="item[0]" class="surface p-6"><span class="text-sm font-black text-teal-300">0{{ i + 1 }}</span><h3 class="mt-8 text-xl font-bold">{{ item[0] }}</h3><p class="mt-3 leading-7 text-slate-400">{{ item[1] }}</p></li></ol></section>

    <section class="border-y border-white/10 bg-ink-900/60 py-20"><div class="container-shell"><div class="grid items-end gap-8 lg:grid-cols-2"><div><p class="eyebrow">Built for real traffic</p><h2 class="mt-3 text-3xl font-black sm:text-4xl">The redirect stays fast, even when analytics get busy.</h2></div><p class="leading-7 text-slate-400">Cached resolution keeps popular links close to the edge of the application. Click analysis runs asynchronously, so a reporting delay never blocks a valid destination.</p></div><div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div v-for="feature in [['Redis-first redirects', 'Frequently used link metadata is cached and invalidated on every sensitive change.'], ['Private by design', 'Daily visitor hashes support unique counts without indefinitely storing raw IP addresses.'], ['Editable controls', 'Disable, schedule expiry, retitle, tag, or update destinations from one place.'], ['API-ready', 'Versioned endpoints and token authentication support integrations from day one.']]" :key="feature[0]" class="rounded-2xl border border-white/10 p-5"><h3 class="font-bold text-white">{{ feature[0] }}</h3><p class="mt-2 text-sm leading-6 text-slate-400">{{ feature[1] }}</p></div></div></div></section>

    <section class="container-shell py-20" aria-labelledby="faq-heading"><div class="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p class="eyebrow">Questions, answered</p><h2 id="faq-heading" class="mt-3 text-3xl font-black">Know what happens behind every click.</h2><NuxtLink to="/faq" class="mt-6 inline-block font-semibold text-teal-300">View all FAQs →</NuxtLink></div><div class="grid gap-3"><details v-for="faq in faqs" :key="faq[0]" class="surface group p-5"><summary class="cursor-pointer list-none font-bold marker:hidden">{{ faq[0] }}<span class="float-right text-teal-300 group-open:rotate-45">+</span></summary><p class="mt-3 leading-7 text-slate-400">{{ faq[1] }}</p></details></div></div></section>

    <section class="container-shell pb-20"><div class="rounded-3xl bg-teal-300 p-8 text-ink-950 sm:p-12"><div class="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><h2 class="text-3xl font-black">Your next useful link starts here.</h2><p class="mt-2 max-w-xl text-ink-800">Create an account to edit destinations, organize links, and measure results over time.</p></div><NuxtLink to="/register" class="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-ink-950 px-6 font-bold text-white">Create free account</NuxtLink></div></div></section>
  </div>
</template>
