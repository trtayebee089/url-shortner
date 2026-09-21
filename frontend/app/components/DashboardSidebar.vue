<script setup lang="ts">
defineProps<{ mobile?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const { user, logout } = useAuth()
const groups = [
  { label: '', items: [{ to: '/dashboard', label: 'Overview', icon: '▦' }, { to: '/dashboard/links', label: 'Links', icon: '↗' }, { to: '/dashboard/analytics', label: 'Analytics', icon: '⌁' }] },
  { label: 'Workspace', items: [{ to: '/dashboard/domains', label: 'Domains', icon: '◎' }, { to: '/dashboard/api', label: 'API', icon: '⌘' }] },
  { label: 'Management', items: [{ to: '/dashboard/settings', label: 'Settings', icon: '⚙' }] },
]
const active = (to: string) => to === '/dashboard' ? route.path === to : route.path.startsWith(to)
const initials = computed(() => user.value?.name?.split(/\s+/).map(v => v[0]).slice(0, 2).join('').toUpperCase() || 'U')
</script>
<template>
  <aside class="flex h-full w-52 flex-col border-r border-border bg-surface"><div class="flex h-[60px] shrink-0 items-center justify-between border-b border-border px-4"><AppLogo size="sm"/><button v-if="mobile" class="grid size-7 place-items-center text-text-muted" aria-label="Close navigation" @click="emit('close')">×</button></div><nav class="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation"><div v-for="group in groups" :key="group.label || 'primary'"><p v-if="group.label" class="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">{{ group.label }}</p><div class="flex flex-col gap-0.5"><NuxtLink v-for="item in group.items" :key="item.to" :to="item.to" class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition" :class="active(item.to) ? 'bg-brand-light font-medium text-brand' : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'" :aria-current="active(item.to) ? 'page' : undefined" @click="emit('close')"><span class="w-4 text-center" aria-hidden="true">{{ item.icon }}</span>{{ item.label }}</NuxtLink></div></div></nav><div class="border-t border-border p-3"><NuxtLink to="/dashboard/profile" class="flex items-center gap-3 rounded-md px-2.5 py-2 hover:bg-surface2" @click="emit('close')"><span class="grid size-7 shrink-0 place-items-center rounded-full border border-brand-mid bg-brand-light text-[10px] font-bold text-brand">{{ initials }}</span><span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold">{{ user?.name }}</span><span class="block truncate text-[10px] text-text-muted">{{ user?.email }}</span></span></NuxtLink><button type="button" class="mt-1 w-full rounded-md px-2.5 py-2 text-left text-xs text-text-muted hover:bg-surface2 hover:text-text-primary" @click="logout">Sign out</button></div></aside>
</template>
