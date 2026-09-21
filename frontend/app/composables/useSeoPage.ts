export function useSeoPage(title: string, description: string, path = '/') {
  const config = useRuntimeConfig()
  const canonical = new URL(path, config.public.siteUrl).toString()
  useSeoMeta({ title, description, ogTitle: `${title} · 247URL`, ogDescription: description, ogType: 'website', ogUrl: canonical, twitterCard: 'summary', twitterTitle: `${title} · 247URL`, twitterDescription: description })
  useHead({ link: [{ rel: 'canonical', href: canonical }] })
}
