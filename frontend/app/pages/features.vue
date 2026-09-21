<script setup lang="ts">
useSeoPage('Features', 'Fast short links, editable controls, QR codes, privacy-conscious analytics, and a versioned API.', '/features')
const features = [
  ['Fast redirect resolution', 'Redis-cached metadata and indexed code lookups keep the redirect request intentionally small.'],
  ['Custom aliases', 'Claim readable aliases with configurable reserved routes and database-enforced uniqueness.'],
  ['Link controls', 'Edit destinations, schedule expiration, disable access, add titles, descriptions, and tags.'],
  ['Asynchronous analytics', 'Clicks enter a queue after resolution, separating reporting work from the visitor’s redirect.'],
  ['Useful audience context', 'Compare trends, referrers, countries, devices, browsers, and operating systems without invasive tracking.'],
  ['QR codes', 'Preview or download a standards-based SVG QR code for any managed short link.'],
  ['Versioned API', 'Sanctum tokens and /api/v1 endpoints provide a stable base for integrations.'],
  ['Abuse controls', 'Rate limits, domain policies, reporting, moderation foundations, and an extensible safety provider are built in.'],
]
</script>
<template><section class="container-shell py-20"><div class="max-w-3xl"><p class="eyebrow">Product</p><h1 class="mt-4 text-4xl font-black sm:text-6xl">Everything needed to operate short links responsibly.</h1><p class="mt-6 text-lg leading-8 text-slate-400">A focused toolset for campaigns, documentation, social posts, and integrations—with redirect reliability treated as the core feature.</p></div><div class="mt-14 grid gap-5 md:grid-cols-2"><article v-for="(feature, i) in features" :key="feature[0]" class="surface p-6"><span class="text-sm font-black text-teal-300">{{ String(i + 1).padStart(2, '0') }}</span><h2 class="mt-5 text-xl font-bold">{{ feature[0] }}</h2><p class="mt-3 leading-7 text-slate-400">{{ feature[1] }}</p></article></div><div class="mt-12"><NuxtLink to="/register" class="btn-primary">Create an account</NuxtLink></div></section></template>
