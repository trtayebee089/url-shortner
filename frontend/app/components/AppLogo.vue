<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; inverse?: boolean }>(), { size: 'md', inverse: false })
</script>

<template>
  <NuxtLink to="/" class="inline-flex items-center gap-2" aria-label="247URL home">
    <span class="grid shrink-0 place-items-center rounded-sm bg-brand" :class="size === 'sm' ? 'size-[22px]' : size === 'lg' ? 'size-[30px]' : 'size-[26px]'">
      <svg viewBox="0 0 14 14" fill="none" class="h-[55%] w-[55%]" aria-hidden="true"><path d="M5.5 8.5L8.5 5.5M6 4l.5-.5a2.828 2.828 0 014 4L10 8M8 10l-.5.5a2.828 2.828 0 01-4-4L4 6" stroke="white" stroke-width="1.6" stroke-linecap="round"/></svg>
    </span>
    <span class="font-bold tracking-[-0.025em]" :class="[inverse ? 'text-white' : 'text-text-primary', size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-xl' : 'text-[17px]']">247URL</span>
  </NuxtLink>
</template>
