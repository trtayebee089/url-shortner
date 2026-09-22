// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',

  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: false,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
  ],

  css: [
    '~/assets/css/main.css',
  ],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  runtimeConfig: {
    /**
     * Server-only API base URL.
     *
     * Production:
     * https://api.247.bd/api/v1
     *
     * Development can override this with:
     * NUXT_API_BASE=http://localhost:8000/api/v1
     */
    apiBase:
      process.env.NUXT_API_BASE ||
      'https://api.247.bd/api/v1',

    public: {
      /**
       * Public website URL.
       */
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ||
        'https://247.bd',

      /**
       * Public short-link domain.
       *
       * IMPORTANT:
       * This is NOT the API domain.
       *
       * Example:
       * https://247.bd/Ab12Cd
       *
       * If you later use a dedicated short domain such as:
       * https://247url.com
       *
       * change this environment variable without changing
       * the rest of the application.
       */
      shortUrlDomain:
        process.env.NUXT_PUBLIC_SHORT_URL_DOMAIN ||
        'https://247.bd',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },

      titleTemplate: '%s · 247URL',

      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
      ],

      meta: [
        {
          name: 'theme-color',
          content: '#4F46E5',
        },

        {
          name: 'color-scheme',
          content: 'light',
        },
      ],
    },
  },

  routeRules: {
    /**
     * Public marketing pages.
     *
     * SWR allows Nuxt/Nitro to cache the rendered page while
     * still allowing it to refresh periodically.
     */
    '/': {
      swr: 3600,
    },

    '/features': {
      swr: 86400,
    },

    '/pricing': {
      swr: 86400,
    },

    '/resources': {
      swr: 86400,
    },

    '/resources/**': {
      swr: 86400,
    },

    '/about': {
      swr: 86400,
    },

    '/faq': {
      swr: 86400,
    },

    '/contact': {
      swr: 86400,
    },

    '/terms': {
      swr: 86400,
    },

    '/privacy': {
      swr: 86400,
    },

    /**
     * Authenticated application.
     *
     * Do not cache dashboard pages.
     *
     * noindex prevents search engines from indexing
     * authenticated application pages.
     */
    '/dashboard/**': {
      ssr: false,

      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },

    /**
     * Authentication pages.
     */
    '/login': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },

    '/register': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },

    '/forgot-password': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },

    '/reset-password': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
        'Referrer-Policy': 'no-referrer',
      },
    },

    '/verify-email': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },

    /**
     * If Nuxt itself exposes any /api/* routes,
     * prevent them from being indexed or cached publicly.
     */
    '/api/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
})