<script setup lang="ts">
import type { LinkRecord } from '~/types/api'

defineProps<{ links: LinkRecord[] }>()
defineEmits<{ delete: [link: LinkRecord]; toggle: [link: LinkRecord] }>()

const shortDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : 'Never'
const status = (link: LinkRecord) => link.is_expired ? 'Expired' : link.is_active ? 'Active' : 'Disabled'
const label = (link: LinkRecord) => link.title || link.custom_alias || link.short_code
const destination = (url: string) => url.replace(/^https?:\/\//i, '')
</script>

<template>
  <div>
    <div class="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-xs xl:block">
      <div class="grid grid-cols-[minmax(165px,1.2fr)_minmax(180px,1.5fr)_68px_80px_96px_300px] items-center gap-3 border-b border-border bg-canvas px-4 py-2.5 text-[11px] font-semibold text-text-muted"><span>Short link</span><span>Destination</span><span>Clicks</span><span>Status</span><span>Created</span><span class="text-right">Actions</span></div>
      <article v-for="link in links" :key="link.id" class="grid min-h-[64px] grid-cols-[minmax(165px,1.2fr)_minmax(180px,1.5fr)_68px_80px_96px_300px] items-center gap-3 border-b border-border px-4 py-2 last:border-0 hover:bg-canvas/70">
        <div class="min-w-0"><a :href="link.short_url" target="_blank" rel="noopener noreferrer" class="block truncate text-sm font-semibold text-text-primary hover:text-brand">{{ label(link) }}</a><p class="truncate text-xs text-brand">{{ link.short_url.replace(/^https?:\/\//, '') }}</p></div>
        <p class="truncate text-xs text-text-secondary" :title="link.destination_url">{{ destination(link.destination_url) }}</p>
        <p class="text-sm font-semibold">{{ link.clicks_count.toLocaleString() }}</p>
        <span class="w-fit" :class="status(link) === 'Active' ? 'badge-success' : status(link) === 'Expired' ? 'badge-warning' : 'badge-danger'">{{ status(link) }}</span>
        <p class="text-xs text-text-secondary">{{ shortDate(link.created_at) }}</p>
        <div class="flex items-center justify-end gap-0.5 whitespace-nowrap"><CopyButton :text="link.short_url"/><NuxtLink :to="`/dashboard/links/${link.id}`" class="btn-ghost h-8 px-1.5 text-[11px]">Edit</NuxtLink><NuxtLink :to="`/dashboard/links/${link.id}/analytics`" class="btn-ghost h-8 px-1.5 text-[11px]">Analytics</NuxtLink><button type="button" class="btn-ghost h-8 px-1.5 text-[11px]" @click="$emit('toggle', link)">{{ link.is_active ? 'Disable' : 'Enable' }}</button><button type="button" class="btn-ghost h-8 px-1.5 text-[11px] text-danger" @click="$emit('delete', link)">Delete</button></div>
      </article>
    </div>

    <div class="grid gap-3 lg:grid-cols-2 xl:hidden">
      <article v-for="link in links" :key="link.id" class="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-xs">
        <div class="flex min-w-0 items-start justify-between gap-3"><div class="min-w-0"><a :href="link.short_url" target="_blank" rel="noopener noreferrer" class="block truncate text-sm font-semibold text-text-primary hover:text-brand">{{ label(link) }}</a><p class="mt-0.5 truncate text-xs text-brand">{{ link.short_url.replace(/^https?:\/\//, '') }}</p></div><span class="shrink-0" :class="status(link) === 'Active' ? 'badge-success' : status(link) === 'Expired' ? 'badge-warning' : 'badge-danger'">{{ status(link) }}</span></div>
        <div class="mt-3 flex items-center gap-2 text-xs"><strong>{{ link.clicks_count.toLocaleString() }} clicks</strong><span class="text-text-muted">· {{ shortDate(link.created_at) }}</span></div>
        <p class="mt-1 truncate text-xs text-text-secondary" :title="link.destination_url">{{ destination(link.destination_url) }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-3"><CopyButton :text="link.short_url"/><NuxtLink :to="`/dashboard/links/${link.id}`" class="btn-ghost h-8 px-2 text-xs">Edit</NuxtLink><NuxtLink :to="`/dashboard/links/${link.id}/analytics`" class="btn-ghost h-8 px-2 text-xs">Analytics</NuxtLink><button type="button" class="btn-ghost h-8 px-2 text-xs" @click="$emit('toggle', link)">{{ link.is_active ? 'Disable' : 'Enable' }}</button><button type="button" class="btn-ghost h-8 px-2 text-xs text-danger" @click="$emit('delete', link)">Delete</button></div>
      </article>
    </div>
  </div>
</template>
