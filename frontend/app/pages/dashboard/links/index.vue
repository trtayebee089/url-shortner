<script setup lang="ts">
import type { LinkRecord } from '~/types/api'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoPage('Links', 'Search, filter, and manage your short links.', '/dashboard/links')

const { links, meta, loading, list, update, remove } = useLinks()
const { show } = useToast()
const search = ref('')
const status = ref('')
const sort = ref('created_at')
const page = ref(1)
const error = ref('')
const createOpen = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let refreshingAfterCreate = false

async function load() {
  error.value = ''
  try { await list({ search: search.value, status: status.value, sort: sort.value, page: page.value }) }
  catch (e: any) { error.value = e?.data?.message || 'Unable to load links.' }
}

async function refreshAfterCreate() {
  if (timer) clearTimeout(timer)
  refreshingAfterCreate = true
  search.value = ''
  status.value = ''
  sort.value = 'created_at'
  page.value = 1
  await nextTick()
  refreshingAfterCreate = false
  await load()
}

async function toggle(link: LinkRecord) {
  try { await update(link.id, { is_active: !link.is_active }); show(link.is_active ? 'Link disabled.' : 'Link enabled.'); await load() }
  catch (e: any) { show(e?.data?.message || 'Unable to update link.', 'error') }
}

async function destroy(link: LinkRecord) {
  if (!confirm(`Delete ${link.short_url}? This cannot be undone.`)) return
  try { await remove(link.id); show('Link deleted.'); await load() }
  catch (e: any) { show(e?.data?.message || 'Unable to delete link.', 'error') }
}

watch([status, sort, page], () => { if (!refreshingAfterCreate) load() })
watch(search, () => {
  if (refreshingAfterCreate) return
  if (timer) clearTimeout(timer)
  page.value = 1
  timer = setTimeout(load, 300)
})
onMounted(load)
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="dashboard-page">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div><h1 class="page-title">Links</h1><p class="mt-0.5 text-sm text-text-secondary">Manage all your short links.</p></div>
      <button type="button" class="btn-primary shrink-0" @click="createOpen = true">+ Create link</button>
    </div>

    <div class="mt-5 grid gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_160px_160px]">
      <label class="relative min-w-0"><span class="sr-only">Search links</span><svg class="absolute left-3 top-3 text-text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input v-model="search" class="input pl-9" type="search" placeholder="Search links"></label>
      <select v-model="status" class="input" aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="expired">Expired</option></select>
      <select v-model="sort" class="input" aria-label="Sort links"><option value="created_at">Newest first</option><option value="clicks_count">Most clicks</option><option value="title">Title</option><option value="expires_at">Expiration</option></select>
    </div>

    <LoadingState v-if="loading" class="mt-4" />
    <div v-else-if="error" class="mt-4 rounded-lg border border-danger-border bg-danger-bg p-4"><p class="text-sm text-danger">{{ error }}</p><button type="button" class="btn-secondary mt-3" @click="load">Try again</button></div>
    <EmptyState v-else-if="!links.length" class="mt-4 !py-9" :title="search || status ? 'No matching links' : 'No links yet'" :message="search || status ? 'Try another search or clear the current filters.' : 'Create your first short link to get started.'">
      <button v-if="search || status" type="button" class="btn-secondary" @click="search = ''; status = ''">Clear filters</button>
      <button v-else type="button" class="btn-primary" @click="createOpen = true">+ Create link</button>
    </EmptyState>
    <LinkTable v-else class="mt-4" :links="links" @toggle="toggle" @delete="destroy" />

    <nav v-if="meta && meta.last_page > 1" class="mt-4 flex items-center justify-between gap-3" aria-label="Pagination"><button type="button" class="btn-secondary" :disabled="page <= 1" @click="page--">Previous</button><span class="text-xs text-text-muted">Page {{ meta.current_page }} of {{ meta.last_page }} · {{ meta.total }} links</span><button type="button" class="btn-secondary" :disabled="page >= meta.last_page" @click="page++">Next</button></nav>
    <CreateLinkDialog v-if="createOpen" @close="createOpen = false" @created="refreshAfterCreate" />
  </div>
</template>
