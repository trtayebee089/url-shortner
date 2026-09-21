<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const items = [{ to: '/dashboard', label: 'Overview', icon: '⌂' }, { to: '/dashboard/links', label: 'Links', icon: '↗' }, { to: '/dashboard/analytics', label: 'Analytics', icon: '⌁' }, { to: '/dashboard/settings', label: 'Settings', icon: '⚙' }, { to: '/dashboard/profile', label: 'Profile', icon: '○' }]
</script>

<template>
  <aside class="border-b border-white/10 bg-ink-900 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
    <div class="flex items-center justify-between p-5 lg:block"><NuxtLink to="/" class="text-xl font-black text-white">↗ 247URL</NuxtLink><button type="button" class="text-sm text-slate-300 hover:text-white lg:hidden" @click="logout">Sign out</button></div>
    <nav class="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid" aria-label="Dashboard">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to" class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold" :class="route.path === item.to || (item.to !== '/dashboard' && route.path.startsWith(item.to)) ? 'bg-teal-300 text-ink-950' : 'text-slate-300 hover:bg-white/5'" :aria-current="route.path === item.to ? 'page' : undefined"><span>{{ item.icon }}</span>{{ item.label }}</NuxtLink>
    </nav>
    <div class="hidden border-t border-white/10 p-5 lg:block"><p class="truncate text-sm font-semibold">{{ user?.name }}</p><p class="truncate text-xs text-slate-500">{{ user?.email }}</p><button class="mt-4 text-sm text-slate-300 hover:text-white" @click="logout">Sign out</button></div>
  </aside>
</template>
