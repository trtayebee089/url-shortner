export default defineEventHandler((event) => {
  const siteUrl = new URL(useRuntimeConfig(event).public.siteUrl)
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\nDisallow: /verify-email\nSitemap: ${new URL('/sitemap.xml', siteUrl).toString()}\n`
})
