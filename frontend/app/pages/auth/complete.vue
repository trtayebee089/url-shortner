<script setup lang="ts">
import { onMounted, ref } from 'vue'

useSeoPage('Completing sign-in', 'Completing your secure social sign-in.', '/auth/complete')
const route = useRoute()
const { finishSocialLogin } = useAuth()
const error = ref('')

onMounted(async () => {
  const ticket = route.query.ticket
  window.history.replaceState(window.history.state, '', '/auth/complete')
  if (typeof ticket !== 'string' || ticket.length !== 64) {
    error.value = 'This sign-in link is invalid. Please try again.'
    return
  }

  try {
    const response = await finishSocialLogin(ticket)
    await navigateTo(response.data.user.email_verified_at ? '/dashboard' : '/verify-email', { replace: true })
  } catch {
    error.value = 'Social sign-in expired or could not be completed. Please try again.'
  }
})
</script>

<template>
  <AuthShell title="Completing sign-in" description="Securing your 247URL account.">
    <p v-if="!error" class="text-sm text-text-secondary" role="status">Connecting your account…</p>
    <div v-else role="alert"><p class="rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger">{{ error }}</p><NuxtLink to="/login" class="btn-secondary mt-4">Return to sign in</NuxtLink></div>
  </AuthShell>
</template>
