<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoPage('Create link', 'Create a new managed short link.', '/dashboard/links/create')
const { create } = useLinks(); const error = ref('')
async function submit(payload: Record<string, unknown>) { try { const response = await create(payload); await navigateTo(`/dashboard/links/${response.data.id}`) } catch (e: any) { error.value = Object.values(e?.data?.errors || {}).flat().join(' ') || e?.data?.message || 'Unable to create link.' } }
</script>
<template><div class="mx-auto max-w-3xl"><NuxtLink to="/dashboard/links" class="text-sm text-teal-300">← Back to links</NuxtLink><h1 class="mt-4 text-3xl font-black">Create a managed link</h1><p class="mt-2 text-slate-400">Add context, expiration, and tags now or update them later.</p><p v-if="error" class="mt-5 rounded-xl bg-rose-400/10 p-4 text-rose-300" role="alert">{{ error }}</p><LinkForm class="mt-7" submit-label="Create link" @submit="submit"/></div></template>
