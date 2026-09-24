<script setup lang="ts">
const columns = [
  { title: 'Why 247URL', links: [['About', '/about'], ['Features', '/features'], ['Pricing', '/pricing'], ['Contact', '/contact']] },
  { title: 'Product', links: [['URL Shortener', '/features'], ['QR Codes', '/features'], ['Analytics', '/features'], ['Link Management', '/features']] },
  { title: 'Solutions', links: [['Marketing', '/features'], ['Campaigns', '/features'], ['Teams', '/features']] },
  { title: 'Resources', links: [['Resources', '/resources'], ['FAQ', '/faq'], ['Contact', '/contact']] },
  { title: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
]
</script>
<template>
  <footer class="border-t border-[#6366F1] bg-[#0b2742] text-white"><div class="marketing-container py-14 sm:py-16"><div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)] lg:gap-6"><div><AppLogo size="sm" inverse /><p class="mt-4 max-w-56 text-xs leading-6 text-slate-300">Short links, QR codes, and clear analytics from one focused workspace.</p></div><nav v-for="column in columns" :key="column.title" :aria-label="column.title"><h2 class="mb-3 text-xs font-bold text-[#A5B4FC]">{{ column.title }}</h2><NuxtLink v-for="link in column.links" :key="`${column.title}-${link[0]}`" class="block py-1 text-xs leading-5 text-slate-300 transition hover:text-white" :to="link[1]">{{ link[0] }}</NuxtLink></nav></div><div class="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>© {{ new Date().getFullYear() }} 247URL. All rights reserved.</p><p>Make every link count.</p></div></div></footer>
</template>
