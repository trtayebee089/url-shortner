export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
  const paths = ['/', '/features', '/pricing', '/resources', '/resources/link-tracking-strategy', '/resources/how-url-shorteners-work', '/resources/api-getting-started', '/resources/utm-parameters-explained', '/resources/understanding-click-analytics', '/resources/link-security', '/about', '/contact', '/faq', '/terms', '/privacy']
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${siteUrl}${path}</loc><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq></url>`).join('')}</urlset>`
})
