<script setup lang="ts">defineProps<{ label: string; value: string | number; detail?: string }>()</script>
<template><div class="surface p-5"><p class="text-sm font-semibold text-slate-400">{{ label }}</p><p class="mt-3 text-3xl font-black tracking-tight">{{ value }}</p><p v-if="detail" class="mt-2 text-xs text-slate-500">{{ detail }}</p></div></template>
