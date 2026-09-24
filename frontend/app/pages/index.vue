<script setup lang="ts">
useSeoPage('Short links. Serious results.', 'Create branded short links, manage destinations, generate QR codes, and understand every click.', '/')

const capabilities = [
  { title: 'URL Shortener', copy: 'Create memorable links for every destination and keep them easy to manage.', view: 'create' as const },
  { title: 'QR Codes', copy: 'Connect print and digital touchpoints with a QR code for your link.', view: 'qr' as const },
  { title: 'Analytics', copy: 'See click trends, visitors, referrers, and devices in one clear view.', view: 'analytics' as const },
]
const stories = [
  { eyebrow: 'Short links that work', title: 'Create links that are easy to share and remember.', description: 'Turn a long destination into a concise 247URL link. Give managed links a unique alias, then keep them organized as your campaign grows.', points: ['Create a short link in seconds.', 'Choose a custom alias for a managed link.', 'Update its destination without replacing the short URL.'], view: 'links' as const },
  { eyebrow: 'QR codes', title: 'Connect campaigns wherever people find you.', description: 'Take a link beyond the screen. A QR code gives people a simple route from a sign, flyer, or event to your destination.', points: ['Display a QR code from your dashboard.', 'Share the same destination across channels.', 'Keep the short link under your control.'], view: 'qr' as const },
  { eyebrow: 'Clear analytics', title: 'Understand what happens after every click.', description: 'See how your links perform over time and explore the traffic sources and devices behind each visit.', points: ['Review click and approximate visitor trends.', 'Explore referrers, devices, browsers, and optional country data.', 'Compare 7, 30, and 90 day views.'], view: 'analytics' as const },
]
const useCases = [
  { category: 'Marketing', title: 'Keep campaigns connected.', copy: 'Use short links to share campaigns and follow their click trends.', path: '247.bd/launch', icon: '↗', tint: 'bg-[#f0edff]' },
  { category: 'Social media', title: 'Make every profile link count.', copy: 'Share concise destinations across posts, bios, and messages.', path: '247.bd/social', icon: '◎', tint: 'bg-[#eaf2fc]' },
  { category: 'E-commerce', title: 'Send shoppers to the right page.', copy: 'Create a memorable route to a product or collection.', path: '247.bd/product', icon: '▣', tint: 'bg-[#EDE9FE]' },
  { category: 'Events', title: 'Connect print and digital.', copy: 'Pair an event link with a QR code people can scan.', path: '247.bd/event', icon: '▦', tint: 'bg-[#eaf6ef]' },
  { category: 'Creators', title: 'Make new content easy to find.', copy: 'Give your audience a short route to your latest destination.', path: '247.bd/creator', icon: '✦', tint: 'bg-[#F1EFFF]' },
  { category: 'Businesses', title: 'Stay in control of links.', copy: 'Manage destinations, expiration dates, and link status.', path: '247.bd/business', icon: '⌁', tint: 'bg-[#eff1f6]' },
]
const values = [
  ['↗', 'Fast redirects', 'A short route to the destination you choose.'],
  ['⌁', 'Clear analytics', 'Trends and traffic sources for managed links.'],
  ['✎', 'Editable links', 'Change a destination without changing its short URL.'],
  ['◉', 'Privacy-conscious tracking', 'Approximate unique counts without storing raw IP addresses.'],
]
const benefits = [
  ['Create with confidence', 'Start with a validated destination and a short URL that is ready to share.'],
  ['Learn what works', 'Find clicks, referrers, devices, and trends in one focused workspace.'],
  ['Keep links useful', 'Edit, expire, or disable managed links as your plans change.'],
]
const faqs = [
  ['What is a URL shortener?', 'A URL shortener creates a compact link that redirects to a longer destination URL.'],
  ['How does 247URL work?', 'Paste an HTTP or HTTPS destination and 247URL creates a short URL. An account lets you manage your links.'],
  ['Can I customize my short links?', 'Yes. Managed links support unique custom aliases using letters, numbers, hyphens, and underscores.'],
  ['Can I track clicks?', 'Yes. Managed links include click trends and breakdowns for referrers, devices, browsers, and more.'],
  ['Can I generate QR codes?', 'Yes. You can display a QR code for a short link in the dashboard.'],
  ['Can I edit a destination?', 'Yes. You can update the destination of a managed link while keeping its short URL.'],
  ['Can I use 247URL without an account?', 'The quick form supports anonymous link creation when the operator enables it. An account is needed to manage links.'],
  ['Do short links expire?', 'Links do not expire by default. Managed links can be given an expiration date or disabled.'],
]
const openFaq = ref<number | null>(0)
</script>

<template>
  <div class="bg-[#F8F9FF]">
    <section class="bg-[#102b46] text-white"><div class="marketing-container pb-44 pt-20 text-center md:pb-52 md:pt-24 lg:pt-28">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-[#A5B4FC]">The 247URL link platform</p>
      <h1 class="mx-auto mt-5 max-w-[930px] text-[clamp(2.7rem,6.3vw,5rem)] font-bold leading-[1.04] tracking-[-.055em]">Short links.<br><span class="text-[#A5B4FC]">Serious results.</span></h1>
      <p class="mx-auto mt-6 max-w-[720px] text-base leading-7 text-slate-200 md:text-lg">Create branded short links, manage destinations, generate QR codes, and understand every click — all from one simple workspace.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3"><NuxtLink to="/register" class="inline-flex h-11 items-center rounded-md bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-dark">Get started free <span class="ml-2" aria-hidden="true">→</span></NuxtLink><NuxtLink to="/features" class="inline-flex h-11 items-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10">Explore features</NuxtLink></div>
      <div class="mx-auto mt-10 w-full max-w-[900px] rounded-2xl border border-white/15 bg-white/5 p-2 text-left sm:p-3"><UrlShortenerForm landing /></div>
    </div></section>

    <section class="marketing-container relative z-10 -mt-32 md:-mt-40" aria-label="247URL dashboard preview"><div class="mx-auto w-full max-w-[1080px]"><HomeProductPreview view="links" /></div></section>
    <section class="marketing-container py-14 text-center md:py-16"><p class="text-xs font-bold uppercase tracking-[.15em] text-text-muted">Powering smarter link experiences</p><div class="mt-5 flex flex-wrap justify-center gap-x-9 gap-y-3 text-sm font-semibold text-[#6e7b8c] md:text-base"><span>Short links</span><span>QR sharing</span><span>Click insights</span><span>Destination control</span></div></section>

    <section class="bg-[#F5F6FF]"><div class="marketing-container py-20 text-center md:py-24 lg:py-28"><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">The platform</p><h2 class="mx-auto mt-4 max-w-[820px] text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">Everything you need to make every link work harder.</h2><p class="mx-auto mt-5 max-w-[690px] text-base leading-7 text-text-secondary md:text-lg">Create, share, measure, and manage from one focused workspace.</p><div class="mt-12 grid gap-6 text-left md:grid-cols-2 lg:grid-cols-3"><article v-for="item in capabilities" :key="item.title" class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCDDFC] bg-white transition hover:-translate-y-1 hover:shadow-lg"><div class="flex-1 bg-[#EDEBFF] p-4"><HomeProductPreview :view="item.view" compact /></div><div class="flex items-start justify-between gap-4 border-t border-[#DCDDFC] p-6"><div><h3 class="text-2xl font-bold tracking-[-.03em]">{{ item.title }}</h3><p class="mt-2 text-sm leading-6 text-text-secondary">{{ item.copy }}</p></div><span class="text-2xl text-brand" aria-hidden="true">↗</span></div></article></div></div></section>

    <HomeFeatureStory v-for="(story, i) in stories" :key="story.eyebrow" v-bind="story" :reverse="i === 1" />

    <section class="bg-[#F5F6FF]"><div class="marketing-container py-20 text-center md:py-24 lg:py-28"><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">One focused workspace</p><h2 class="mx-auto mt-4 max-w-[850px] text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">Manage every link from one focused workspace.</h2><p class="mx-auto mt-5 max-w-[670px] text-base leading-7 text-text-secondary md:text-lg">Create, manage, and analyze every link from one place.</p><div class="mx-auto mt-12 w-full max-w-[1100px] text-left"><HomeProductPreview view="links" /></div><NuxtLink to="/register" class="btn-primary btn-lg mt-9">Get started for free <span aria-hidden="true">→</span></NuxtLink></div></section>

    <section class="bg-white"><div class="marketing-container py-20 md:py-24 lg:py-28"><div class="text-center"><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">Made for sharing</p><h2 class="mt-4 text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">Built for every kind of campaign.</h2><p class="mx-auto mt-5 max-w-[680px] text-base leading-7 text-text-secondary md:text-lg">A clear link can take people from any channel to the right destination.</p></div><div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><article v-for="item in useCases" :key="item.category" class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCDDFC] bg-white"><div class="p-7"><p class="text-xs font-bold uppercase tracking-[.13em] text-brand">{{ item.category }}</p><h3 class="mt-4 text-2xl font-bold tracking-[-.03em]">{{ item.title }}</h3><p class="mt-3 text-sm leading-6 text-text-secondary md:text-base">{{ item.copy }}</p></div><div class="mt-auto flex min-h-[118px] items-center justify-between gap-4 px-7" :class="item.tint"><span class="min-w-0 truncate rounded-lg border border-[#DCDDFC] bg-white px-4 py-2.5 text-sm font-semibold text-brand shadow-sm">{{ item.path }}</span><span class="text-5xl text-brand/40" aria-hidden="true">{{ item.icon }}</span></div></article></div></div></section>

    <section class="bg-[#F5F6FF]"><div class="marketing-container py-20 text-center md:py-24"><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">Product value</p><h2 class="mt-4 text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">A stronger way to work with links.</h2><div class="mt-11 grid gap-5 text-left sm:grid-cols-2 xl:grid-cols-4"><article v-for="item in values" :key="item[1]" class="rounded-2xl border border-[#DCDDFC] bg-white p-6"><span class="grid size-11 place-items-center rounded-lg bg-brand-light text-2xl text-brand" aria-hidden="true">{{ item[0] }}</span><h3 class="mt-6 text-xl font-bold">{{ item[1] }}</h3><p class="mt-3 text-sm leading-6 text-text-secondary">{{ item[2] }}</p></article></div></div></section>

    <section class="bg-white"><div class="marketing-container py-20 text-center md:py-24"><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">Why 247URL</p><h2 class="mx-auto mt-4 max-w-[830px] text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">Useful from the first share to the next campaign.</h2><div class="mt-11 grid gap-6 text-left md:grid-cols-3"><article v-for="item in benefits" :key="item[0]" class="border-t-[3px] border-brand bg-[#F8F7FF] px-6 py-7"><span class="text-2xl text-brand" aria-hidden="true">✦</span><h3 class="mt-5 text-2xl font-bold tracking-[-.03em]">{{ item[0] }}</h3><p class="mt-3 text-sm leading-6 text-text-secondary md:text-base">{{ item[1] }}</p></article></div></div></section>

    <section class="border-t border-[#DCDDFC] bg-[#F8F9FF]"><div class="marketing-container grid gap-12 py-20 md:py-24 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p class="text-xs font-bold uppercase tracking-[.15em] text-brand">Good to know</p><h2 class="mt-4 text-[clamp(2.1rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-.045em]">Frequently asked questions.</h2><p class="mt-5 text-base leading-7 text-text-secondary">Need a hand? <NuxtLink to="/contact" class="font-semibold text-brand hover:underline">Contact the team.</NuxtLink></p></div><div class="divide-y divide-[#DCDDFC] border-y border-[#DCDDFC]"><div v-for="(item, i) in faqs" :key="item[0]"><h3><button type="button" class="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold" :aria-expanded="openFaq === i" :aria-controls="`home-faq-${i}`" @click="openFaq = openFaq === i ? null : i"><span>{{ item[0] }}</span><span class="text-xl font-normal text-brand" aria-hidden="true">{{ openFaq === i ? '−' : '+' }}</span></button></h3><p v-show="openFaq === i" :id="`home-faq-${i}`" class="pb-5 text-sm leading-7 text-text-secondary md:text-base">{{ item[1] }}</p></div></div></div></section>

    <section class="bg-[#102b46] text-white"><div class="marketing-container py-20 text-center md:py-24"><p class="text-xs font-bold uppercase tracking-[.18em] text-[#A5B4FC]">Your next link starts here</p><h2 class="mt-4 text-[clamp(2.2rem,4.8vw,4rem)] font-bold leading-[1.06] tracking-[-.05em] text-[#A5B4FC]">More than a link shortener.</h2><p class="mx-auto mt-5 max-w-[690px] text-base leading-7 text-slate-200 md:text-lg">Create, manage, measure, and improve every link from one simple workspace.</p><NuxtLink to="/register" class="mt-7 inline-flex h-11 items-center rounded-md border border-white/50 px-6 text-sm font-semibold text-white transition hover:bg-white/10">Get started for free <span class="ml-2" aria-hidden="true">→</span></NuxtLink><div class="mx-auto mt-12 w-full max-w-[1040px] text-left"><HomeProductPreview view="create" /></div></div></section>
  </div>
</template>
