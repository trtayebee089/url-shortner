<script setup lang="ts">
const open = ref(false)
const route = useRoute()
const { user } = useAuth()
const dark = computed(() => route.path === '/features')
const links = [{ to: '/features', label: 'Product' }, { to: '/features', label: 'Features' }, { to: '/pricing', label: 'Pricing' }, { to: '/resources', label: 'Resources' }]
watch(() => route.fullPath, () => { open.value = false })
</script>
<template>
  <header class="sticky top-0 z-40 flex h-[64px] items-center border-b backdrop-blur" :class="dark ? 'border-white/10 bg-[#0b2742]/95 text-white' : 'border-border bg-surface/95'">
    <div class="marketing-container flex items-center justify-between gap-8"><AppLogo :inverse="dark" /><nav class="hidden flex-1 items-center justify-center gap-0.5 md:flex" aria-label="Main navigation"><NuxtLink v-for="link in links" :key="`${link.to}-${link.label}`" :to="link.to" class="rounded-md px-3 py-2 text-sm transition" :class="dark ? 'text-slate-200 hover:bg-white/10 hover:text-white' : route.path === link.to ? 'text-brand hover:bg-surface2' : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'">{{ link.label }}</NuxtLink></nav><div class="hidden items-center gap-2 md:flex"><NuxtLink v-if="!user" to="/login" class="btn" :class="dark ? 'text-white hover:bg-white/10' : 'text-text-secondary hover:bg-surface2'">Sign in</NuxtLink><NuxtLink :to="user ? '/dashboard' : '/register'" class="btn-primary">{{ user ? 'Dashboard' : 'Get started' }}</NuxtLink></div><button type="button" class="grid size-9 place-items-center rounded-md md:hidden" :class="dark ? 'text-white' : 'text-text-secondary'" :aria-expanded="open" aria-controls="mobile-navigation" aria-label="Toggle menu" @click="open = !open"><svg v-if="open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg><svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button></div>
    <nav v-if="open" id="mobile-navigation" class="absolute inset-x-0 top-full border-b border-border bg-surface px-5 py-3 text-text-primary shadow-md md:hidden" aria-label="Mobile navigation"><div class="mx-auto flex max-w-6xl flex-col gap-0.5"><NuxtLink v-for="link in links" :key="`${link.to}-${link.label}`" :to="link.to" class="rounded-md px-3 py-2.5 text-sm text-text-secondary hover:bg-surface2 hover:text-text-primary">{{ link.label }}</NuxtLink><div class="mt-2 grid gap-2 border-t border-border pt-3"><NuxtLink v-if="!user" to="/login" class="btn-secondary">Sign in</NuxtLink><NuxtLink :to="user ? '/dashboard' : '/register'" class="btn-primary">{{ user ? 'Dashboard' : 'Get started' }}</NuxtLink></div></div></nav>
  </header>
</template>
