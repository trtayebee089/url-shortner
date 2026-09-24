<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
useSeoPage('Sign in', 'Sign in to manage your 247URL links and analytics.', '/login')
const route = useRoute(); const { request } = useApi(); const { login } = useAuth(); const form = reactive({ email: '', password: '', remember: false }); const errors = ref<Record<string,string[]>>({}); const error = ref(''); const loading = ref(false); const verified = ref(false)
const oauthErrors: Record<string, string> = {
  configuration: 'Social sign-in is not configured yet. Please use email and password for now.',
  cancelled: 'Sign-in was cancelled. You can try again.',
  state: 'The sign-in request expired or could not be verified. Please try again.',
  callback: 'The provider did not complete sign-in. Please try again.',
  provider: 'The provider could not complete sign-in. Please try again later.',
  email: 'The provider did not supply a verified email address. Please use another sign-in method.',
  identity: 'The provider did not supply a valid account identity.',
  disabled: 'This account is disabled. Please contact support.',
}
const oauthError = computed(() => typeof route.query.oauth_error === 'string' ? oauthErrors[route.query.oauth_error] || '' : '')
onMounted(async () => {
  if (route.query.verified !== '1' || typeof route.query.proof !== 'string') return
  try {
    const response = await request<{ verified: boolean }>('auth/email/verification-proof', { method: 'POST', body: { proof: route.query.proof } })
    verified.value = response.verified
  } catch { verified.value = false }
  finally {
    const url = new URL(window.location.href)
    url.searchParams.delete('verified'); url.searchParams.delete('proof')
    window.history.replaceState(window.history.state, '', url)
  }
})
async function submit() { loading.value=true; errors.value={}; error.value=''; try { const response = await login(form); await navigateTo(response.data.user.email_verified_at ? '/dashboard' : '/verify-email') } catch (e:any) { errors.value=e?.data?.errors||{}; error.value=e?.data?.message||'Unable to sign in. Please check your connection.' } finally { loading.value=false } }
</script>
<template><AuthShell title="Welcome back" description="Sign in to manage links and understand every click."><div v-if="verified" class="mb-5 rounded-lg border border-success-border bg-success-bg p-4 text-sm" role="status"><p class="font-semibold text-success">✓ Email verified successfully!</p><p class="mt-1 text-text-secondary">Your email has been verified. You can now sign in to your account.</p></div><p v-if="oauthError" class="mb-5 rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger" role="alert">{{ oauthError }}</p><form class="grid gap-5" @submit.prevent="submit"><div><label class="label" for="email">Email address</label><input id="email" v-model="form.email" class="input" type="email" autocomplete="email" required :aria-invalid="Boolean(errors.email)"><p class="field-error">{{ errors.email?.[0] }}</p></div><div><div class="flex justify-between"><label class="label" for="password">Password</label><NuxtLink to="/forgot-password" class="text-xs text-brand">Forgot password?</NuxtLink></div><input id="password" v-model="form.password" class="input" type="password" autocomplete="current-password" required></div><label class="flex items-center gap-2 text-xs text-text-secondary"><input v-model="form.remember" type="checkbox" class="size-4 accent-brand">Keep me signed in for 30 days</label><p v-if="error && !Object.keys(errors).length" class="rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger" role="alert">{{ error }}</p><button class="btn-primary w-full" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button></form><SocialAuthOptions/><p class="mt-6 text-center text-sm text-text-secondary">New here? <NuxtLink to="/register" class="font-medium text-brand">Create an account</NuxtLink></p></AuthShell></template>
