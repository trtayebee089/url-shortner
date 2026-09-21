import { MarketingLayout } from '@/layouts/MarketingLayout';
import { SectionHeading, Accordion, Button } from '@/components/ui';
import { useRouter } from '@/lib/router';

const faqs = [
  { q: 'Can I choose my own short link?', a: 'Yes — authenticated users can set a custom alias when creating a short link. Aliases must be unique and use URL-safe characters.' },
  { q: 'Do short links expire?', a: 'By default, short links never expire. Authenticated users can set an optional expiry date on any link from the dashboard.' },
  { q: 'What analytics are collected?', a: 'We track click counts, referrers, device types, browser, OS, and country-level location. We use daily-rotating visitor hashes — we never store raw IP addresses.' },
  { q: 'Can I use my own short domain?', a: 'Custom short domains are available on the Pro and Business plans.' },
  { q: 'Can I edit the destination of a short link?', a: 'Yes. Any authenticated user can update the destination URL of any link they own. The short URL stays the same.' },
  { q: 'Is there an API?', a: 'Yes — a versioned REST API with token-based authentication. API access is available on Pro and Business plans.' },
  { q: 'What happens when a link is disabled?', a: 'Visitors see a branded page explaining the link has been deactivated. You can re-enable it from your dashboard at any time.' },
  { q: 'How is privacy protected for visitors?', a: 'We derive a daily-expiring hash from visitor data for unique count estimation. We do not store raw IP addresses, and we do not sell data to third parties.' },
];

export function FAQPage() {
  const { navigate } = useRouter();

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions."
              subtitle="Straightforward answers about how 247URL works."/>
            <p className="mt-4 text-sm text-text-muted">
              Still have questions?{' '}
              <button onClick={() => navigate('/contact')} className="text-brand hover:underline">Contact us</button> — we respond quickly.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-xs)]">
            <Accordion items={faqs}/>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
