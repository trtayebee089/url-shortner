<script setup lang="ts">
useSeoMeta({ robots: 'noindex, nofollow' })
const route = useRoute()
const { user, logout } = useAuth()
const open = ref(false)
const links = [ ['Overview', '/admin', '▦'], ['Customers', '/admin/customers', '♙'], ['Plans', '/admin/plans', '▤'], ['Subscriptions', '/admin/subscriptions', '↻'], ['Manual payments', '/admin/payments', '▣'], ['Moderation', '/admin/moderation', '◇'], ['Audit log', '/admin/audit', '◷'] ]
watch(() => route.path, () => { open.value = false })
</script>
<template>
  <div class="min-h-screen bg-canvas md:flex">
    <button v-if="open" class="fixed inset-0 z-40 bg-black/30 md:hidden" aria-label="Close navigation" @click="open=false" />
    <aside class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-surface transition-transform md:translate-x-0" :class="open ? 'translate-x-0' : '-translate-x-full'">
      <div class="border-b border-border px-6 py-6"><AppLogo size="sm"/><div class="mt-4 flex items-center gap-2"><span class="size-1.5 rounded-full bg-brand"/><span class="text-[10px] font-bold uppercase tracking-[.16em] text-text-muted">Administration</span></div></div>
      <nav class="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Administration"><NuxtLink v-for="[label,to,icon] in links" :key="to" :to="to!" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm" :class="(to==='/admin' ? route.path===to : route.path.startsWith(to!)) ? 'bg-brand-light font-semibold text-brand' : 'text-text-secondary hover:bg-surface2'" :aria-current="route.path===to ? 'page' : undefined"><span aria-hidden="true" class="w-4 text-center">{{ icon }}</span>{{ label }}</NuxtLink></nav>
      <div class="space-y-3 border-t border-border p-5"><p class="truncate text-xs font-semibold">{{ user?.email }}</p><NuxtLink to="/dashboard" class="block text-xs text-text-secondary">← Customer workspace</NuxtLink><button class="text-xs text-text-muted" @click="logout">Sign out</button></div>
    </aside>
    <div class="min-w-0 flex-1 md:ml-60"><header class="flex h-16 items-center justify-between border-b border-border bg-surface px-5 sm:px-8"><div class="flex items-center gap-3"><button class="btn-ghost md:hidden" aria-label="Open navigation" @click="open=true">☰</button><span class="text-sm font-medium">247URL control center</span></div><span class="badge-brand">Superadmin</span></header><main class="mx-auto max-w-[1500px] px-5 py-8 sm:px-8"><slot/></main><footer class="px-8 pb-6 text-xs text-text-muted">247URL · Secure administration</footer></div>
  </div>
</template>
