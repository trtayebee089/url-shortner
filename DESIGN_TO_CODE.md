# 247URL design-to-code map

The React/Vite project in `Design Inspiration/` is the visual source of truth. It contains implemented reference screens rather than exported screenshots. Its global source is `src/index.css`, reusable controls are in `src/components/ui.tsx`, and the two application shells are in `src/layouts/`.

| Page | Design reference | Nuxt route | Existing implementation | Required implementation | Main components | Laravel API | Responsive notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | `HomePage.tsx` | `/` | Functional dark shortener | Editorial hero, real shortener success/error/QR, product preview, trust, features, FAQ, CTA | `AppHeader`, `UrlShortenerForm`, charts, accordion, `AppFooter` | `POST /api/v1/links` for guest or authenticated creation | Horizontal form becomes stacked; preview metrics become a compact grid |
| Features | `FeaturesPage.tsx` | `/features` | Small feature grid | Full product showcase and truthful capability matrix | Product previews, feature sections, charts, CTA | None (product links enter real flows) | Alternating sections collapse to one column |
| Pricing | `PricingPage.tsx` | `/pricing` | Single self-hosted card | Three-plan reference layout, explicitly marked configurable/planned where billing is absent | Plan cards, billing toggle, comparison, FAQ | None; no payment API exists | Cards stack; comparison scrolls |
| Resources | `ResourcesPage.tsx` | `/resources` | Missing | Searchable, filterable static content hub | `ResourceCard`, category tabs, search, CTA | None | Featured grid stacks; tabs scroll |
| Resource detail | `ResourcesPage.tsx` (`ResourceArticlePage`) | `/resources/[slug]` | Missing | SSR article template with related content and 404 | Article layout, breadcrumb, table of contents | None | TOC becomes inline/collapsible |
| FAQ | `FAQPage.tsx` | `/faq` | Basic FAQ | Two-column editorial FAQ | Accordion | None | Single column |
| About / Contact / Legal | `SimplePages.tsx` | `/about`, `/contact`, `/privacy`, `/terms` | Functional dark templates | Light editorial templates; preserve honest operator/legal notices | Marketing shell, content panels | None | Readable 680–760px column |
| Login | `LoginPage.tsx` | `/login` | Functional | Split auth layout and real errors/loading | `AuthShell`, inputs, password control | `POST /api/v1/auth/login` through session BFF | Brand panel hidden/condensed on small screens |
| Register | `RegisterPage.tsx` | `/register` | Functional | Split auth layout with password requirements | `AuthShell`, inputs | `POST /api/v1/auth/register` through session BFF | Single card |
| Forgot/reset password | `ForgotPasswordPage.tsx` and design brief | `/forgot-password`, `/reset-password` | Functional | Matching auth shell, success/error states | `AuthShell` | `POST /api/v1/auth/forgot-password`, `/reset-password` | Single card |
| Verify email | design brief | `/verify-email` | Missing | Truthful verification/resend state | Auth status card | `POST /api/v1/auth/email/verification-notification` | Single card |
| Dashboard overview | `DashboardOverview.tsx` | `/dashboard` | Real metrics, minimal UI | Designed shell, real summary cards/recent/top links; no fake trends | `DashboardSidebar`, `StatCard`, link lists | `GET /api/v1/dashboard` | Drawer navigation; 2-column then 1-column metrics |
| Links | `LinksPage.tsx` | `/dashboard/links` | Real list/search/filter/sort | Designed toolbar/table/mobile cards, pagination, confirmations, toasts | `LinkTable`, pagination, modal/toast | `GET/PATCH/DELETE /api/v1/links/*` | Table becomes cards below desktop |
| Create link | `CreateLinkPage.tsx` | `/dashboard/links/create` | Real form | Two-column form/live preview with QR and validation | `LinkForm`, preview card | `POST /api/v1/links` | Preview follows form on mobile |
| Link details | `LinkDetailsPage.tsx` | `/dashboard/links/[id]` | Edit-focused real page | Real detail/edit workspace with QR/actions; analytics links only where data exists | `LinkForm`, status badge, QR | `GET/PATCH /api/v1/links/{id}`, QR endpoint | Modular grid stacks |
| Link analytics | `AnalyticsPage.tsx` visual language | `/dashboard/links/[id]/analytics` | Real per-link analytics | Responsive charts/tables and all returned dimensions | Charts, progress rows, range tabs | `GET /api/v1/links/{id}/analytics?period=` | Cards stack, charts stay fluid |
| Global analytics | `AnalyticsPage.tsx` | `/dashboard/analytics` | Link-picker placeholder | Real link picker and explicit scope; backend has no global aggregate endpoint | Link list/analytics entry points | `GET /api/v1/links` | Stacked picker cards |
| Domains | `SettingsPage.tsx` domains section | `/dashboard/domains` | Missing/backend absent | Truthful unsupported empty/foundation state; never claims verification | Empty state | No domain API exists | Single panel |
| API tokens | `SettingsPage.tsx` API section | `/dashboard/api` | Combined settings tab | Real create-once/revoke token workflow | Modal, token table, copy warning | `GET/POST/DELETE /api/v1/api-tokens` | Table becomes rows/cards |
| Settings/profile | `SettingsPage.tsx`, `ProfilePage.tsx` | `/dashboard/settings`, `/dashboard/profile` | Token settings + real profile | Separate truthful preferences shell and real profile/password forms | Settings panel, profile forms | `PATCH /api/v1/profile`, `PUT /api/v1/profile/password` | Panels become full-width |
| Error states | design brief | Nuxt error boundary and API states | Partial inline errors | Designed 401/403/404/429/500 and expired/disabled backend page styling | `error.vue`, empty/loading/error panels | Laravel error status remains authoritative | Centered compact panel |

## Design system translation

- Colors: canvas `#F8FAFC`, surface `#FFFFFF`, surface-muted `#F1F5F9`, text `#111827`, slate `#64748B`, muted `#94A3B8`, border `#E2E8F0`, brand `#4F46E5`, brand-dark `#4338CA`, violet `#7C3AED`.
- Typography: Inter-compatible system stack for CSP-safe production; JetBrains Mono-compatible monospace stack for code and URLs. Marketing headings use tight tracking; dashboard copy remains compact.
- Radius: inputs/buttons 8px, cards 12px, large sections 16px. Shadows are the exact subtle reference shadows.
- Breakpoints: Tailwind defaults map the supplied 390, 768, 1280, and 1440 layouts. Mobile dashboard navigation is a modal drawer, and data tables have purpose-built card rows.
- Interaction: 150–200ms hover/focus transitions, visible focus ring, Escape/overlay-close dialogs, `aria-live` notifications, semantic links/buttons.

## Truthful capability boundaries

Billing, team management, webhooks, global analytics aggregation, account deletion, active-session management, custom-domain provisioning/verification, and a CMS do not currently have Laravel APIs. Their UI must be explanatory, planned/configurable, or an honest empty state—not an operational claim. Resource content is local typed data that can later be replaced by a CMS. Per-link analytics, links, profile/password, QR, and API tokens use the existing real API.
