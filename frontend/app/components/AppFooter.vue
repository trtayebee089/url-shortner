<template>
  <footer class="border-t border-white/10 py-12">
    <div class="container-shell grid gap-8 md:grid-cols-[1fr_auto_auto]">
      <div><p class="text-lg font-black">247URL</p><p class="mt-2 max-w-sm text-sm text-slate-400">Short links with fast redirects, useful analytics, and privacy-conscious defaults.</p></div>
      <nav class="grid gap-2 text-sm text-slate-300" aria-label="Product"><NuxtLink to="/features">Features</NuxtLink><NuxtLink to="/pricing">Pricing</NuxtLink><NuxtLink to="/faq">FAQ</NuxtLink></nav>
      <nav class="grid gap-2 text-sm text-slate-300" aria-label="Legal"><NuxtLink to="/privacy">Privacy</NuxtLink><NuxtLink to="/terms">Terms</NuxtLink><NuxtLink to="/contact">Contact</NuxtLink></nav>
    </div>
    <p class="container-shell mt-10 text-xs text-slate-500">© {{ new Date().getFullYear() }} 247URL. All rights reserved.</p>
  </footer>
</template>
