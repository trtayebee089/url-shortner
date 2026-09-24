<script setup lang="ts">
import { nextTick, ref } from 'vue'

const config = useRuntimeConfig()
const pending = ref<'google' | 'apple' | null>(null)
const error = ref('')

async function connect(provider: 'google' | 'apple') {
  if (pending.value) return
  pending.value = provider
  error.value = ''
  try {
    await nextTick()
    await navigateTo(`${config.public.apiBase.replace(/\/$/, '')}/auth/${provider}/redirect`, { external: true })
  } catch {
    error.value = `Unable to start ${provider === 'google' ? 'Google' : 'Apple'} sign-in. Please try again.`
    pending.value = null
  }
}
</script>

<template>
  <div class="mt-6">
    <div class="flex items-center gap-3 text-xs text-text-muted"><span class="h-px flex-1 bg-border"/><span>or continue with</span><span class="h-px flex-1 bg-border"/></div>
    <div class="mt-4 grid gap-2">
      <button type="button" class="btn-secondary w-full cursor-pointer" :disabled="pending !== null" @click="connect('google')">
        <svg class="size-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.22c0-.68-.06-1.36-.18-2.02H12v3.82h5.24a4.49 4.49 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.18Z"/><path fill="#34A853" d="M12 21.73c2.62 0 4.83-.87 6.44-2.33l-3.14-2.44c-.87.59-1.98.94-3.3.94-2.54 0-4.68-1.71-5.45-4.01H3.31v2.52A9.73 9.73 0 0 0 12 21.73Z"/><path fill="#FBBC05" d="M6.55 13.89a5.85 5.85 0 0 1 0-3.78V7.59H3.31a9.73 9.73 0 0 0 0 8.82l3.24-2.52Z"/><path fill="#EA4335" d="M12 6.1c1.39 0 2.63.48 3.61 1.42l2.71-2.71A9.27 9.27 0 0 0 12 2.27a9.73 9.73 0 0 0-8.69 5.32l3.24 2.52C7.32 7.81 9.46 6.1 12 6.1Z"/></svg>
        {{ pending === 'google' ? 'Connecting…' : 'Continue with Google' }}
      </button>
      <button type="button" class="btn-secondary w-full cursor-pointer" :disabled="pending !== null" @click="connect('apple')">
        <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 12.54c.02 2.15 1.88 2.86 1.9 2.87-.02.05-.3 1.03-.98 2.04-.59.87-1.2 1.74-2.17 1.76-.95.02-1.25-.57-2.33-.57-1.08 0-1.42.55-2.32.59-.94.03-1.65-.94-2.24-1.81-1.22-1.76-2.15-4.98-.9-7.15a3.48 3.48 0 0 1 2.93-1.79c.92-.02 1.79.63 2.35.63.56 0 1.61-.78 2.72-.66.47.02 1.8.19 2.66 1.44-.07.04-1.59.93-1.62 2.65ZM15.3 7.3a3.82 3.82 0 0 0 .88-2.79c-.84.04-1.86.56-2.46 1.26a3.63 3.63 0 0 0-.9 2.7c.94.07 1.9-.48 2.48-1.17Z"/></svg>
        {{ pending === 'apple' ? 'Connecting…' : 'Continue with Apple' }}
      </button>
    </div>
    <p v-if="error" class="mt-3 text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
