<script setup lang="ts">
import type { LinkRecord } from '~/types/api'
defineProps<{ links: LinkRecord[] }>()
defineEmits<{ delete: [link: LinkRecord]; toggle: [link: LinkRecord] }>()
const shortDate = (value: string | null) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : 'Never'
</script>
<template>
  <div class="overflow-hidden rounded-2xl border border-white/10">
    <div class="hidden grid-cols-[1.2fr_2fr_.6fr_.7fr_.8fr_auto] gap-4 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 lg:grid"><span>Short URL</span><span>Destination</span><span>Clicks</span><span>Status</span><span>Created</span><span>Actions</span></div>
    <article v-for="link in links" :key="link.id" class="grid gap-4 border-t border-white/10 p-5 first:border-t-0 lg:grid-cols-[1.2fr_2fr_.6fr_.7fr_.8fr_auto] lg:items-center">
      <div class="min-w-0"><a :href="link.short_url" class="truncate font-bold text-teal-300" target="_blank" rel="noopener noreferrer">{{ link.short_code }}</a><p class="mt-1 text-xs text-slate-500 lg:hidden">Short URL</p></div>
      <p class="truncate text-sm text-slate-300" :title="link.destination_url">{{ link.destination_url }}</p><p class="font-bold">{{ link.clicks_count.toLocaleString() }}</p>
      <span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold" :class="link.is_expired || !link.is_active ? 'bg-rose-400/10 text-rose-300' : 'bg-teal-300/10 text-teal-200'">{{ link.is_expired ? 'Expired' : link.is_active ? 'Active' : 'Disabled' }}</span>
      <p class="text-sm text-slate-400">{{ shortDate(link.created_at) }}</p>
      <div class="flex flex-wrap gap-2"><CopyButton :text="link.short_url" /><NuxtLink :to="`/dashboard/links/${link.id}`" class="btn-secondary">Edit</NuxtLink><NuxtLink :to="`/dashboard/links/${link.id}/analytics`" class="btn-secondary">Analytics</NuxtLink><a :href="`/api/backend/links/${link.id}/qr`" class="btn-secondary" download>QR</a><button class="btn-secondary" type="button" @click="$emit('toggle', link)">{{ link.is_active ? 'Disable' : 'Enable' }}</button><button class="btn-secondary text-rose-300" type="button" @click="$emit('delete', link)">Delete</button></div>
    </article>
  </div>
</template>
