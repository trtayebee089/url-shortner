// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:8000/api/v1',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      shortUrlDomain: process.env.NUXT_PUBLIC_SHORT_URL_DOMAIN || 'http://localhost:8000',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · 247URL',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'theme-color', content: '#07111f' }],
    },
  },
  routeRules: {
    '/': { swr: 3600 },
    '/features': { swr: 86400 },
    '/pricing': { swr: 86400 },
    '/resources': { swr: 86400 },
    '/resources/**': { swr: 86400 },
    '/about': { swr: 86400 },
    '/faq': { swr: 86400 },
    '/terms': { swr: 86400 },
    '/privacy': { swr: 86400 },
    '/dashboard/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/register': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/forgot-password': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/reset-password': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' } },
    '/verify-email': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/api/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
  },
  nitro: { compressPublicAssets: true },
})
