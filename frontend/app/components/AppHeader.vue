<script setup lang="ts">
const open = ref(false)
const { user } = useAuth()
const links = [{ to: '/features', label: 'Features' }, { to: '/pricing', label: 'Pricing' }, { to: '/faq', label: 'FAQ' }, { to: '/about', label: 'About' }]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-ink-950/90 backdrop-blur-xl">
    <div class="container-shell flex h-18 items-center justify-between py-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-lg font-black tracking-tight" aria-label="247URL home"><span class="grid size-9 place-items-center rounded-xl bg-teal-300 text-ink-950">↗</span>247URL</NuxtLink>
      <nav class="hidden items-center gap-7 md:flex" aria-label="Primary navigation"><NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="text-sm font-semibold text-slate-300 hover:text-white">{{ link.label }}</NuxtLink></nav>
      <div class="hidden items-center gap-3 md:flex"><NuxtLink v-if="!user" to="/login" class="btn-secondary">Sign in</NuxtLink><NuxtLink :to="user ? '/dashboard' : '/register'" class="btn-primary">{{ user ? 'Dashboard' : 'Create account' }}</NuxtLink></div>
      <button class="rounded-lg p-2 md:hidden" type="button" :aria-expanded="open" aria-label="Toggle menu" @click="open = !open">☰</button>
    </div>
    <nav v-if="open" class="container-shell grid gap-2 border-t border-white/10 py-4 md:hidden" aria-label="Mobile navigation"><NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="rounded-lg px-3 py-2 hover:bg-white/5" @click="open = false">{{ link.label }}</NuxtLink><NuxtLink to="/login" class="rounded-lg px-3 py-2">Sign in</NuxtLink></nav>
  </header>
</template>
