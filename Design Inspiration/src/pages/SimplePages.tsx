import { MarketingLayout } from '@/layouts/MarketingLayout';
import { SectionHeading, Button } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <SectionHeading eyebrow="About" title="Built for links that actually need to work."
          subtitle="247URL is URL infrastructure designed around reliability, privacy, and simplicity. We believe the link layer should be boring in the best sense: fast, predictable, and out of your way."/>
        <div className="mt-10 flex flex-col gap-5 text-sm text-text-secondary leading-relaxed">
          <p>We started 247URL because we were frustrated with services that buried simple features behind opaque pricing, collected more data than they disclosed, and broke links without warning.</p>
          <p>Our goals: fast redirects, honest analytics, and no surprises. Short links should work as long as you want. Analytics should tell you what you need, without storing what you don't want stored.</p>
          <p className="text-text-muted">247URL is a small product made by a small team. We're available at the contact address below.</p>
        </div>
      </div>
    </MarketingLayout>
  );
}

export function ContactPage() {
  const { navigate } = useRouter();
  return (
    <MarketingLayout>
      <div className="max-w-xl mx-auto px-6 pt-20 pb-24">
        <SectionHeading eyebrow="Contact" title="Get in touch." subtitle="We respond to every message." />
        <div className="mt-10 bg-surface border border-border rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-xs)] flex flex-col gap-4">
          {[{ l: 'Name', p: 'Alex Morgan', t: 'text' }, { l: 'Email', p: 'alex@example.com', t: 'email' }].map((f) => (
            <div key={f.l} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-primary">{f.l}</label>
              <input type={f.t} placeholder={f.p}
                className="w-full bg-canvas border border-border text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"/>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-primary">Message</label>
            <textarea rows={4} placeholder="How can we help?"
              className="w-full bg-canvas border border-border text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors resize-none"/>
          </div>
          <Button variant="primary" size="md">Send message</Button>
        </div>
      </div>
    </MarketingLayout>
  );
}

export function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <SectionHeading eyebrow="Legal" title="Privacy Policy." />
        <div className="mt-10 flex flex-col gap-6 text-sm text-text-secondary leading-relaxed">
          {[
            { h: 'What we collect', p: 'When you create a short link, we store the destination URL, your alias or generated code, and your account identifier. When a visitor clicks, we record click count, derived country, device type, referrer, and a daily-rotating anonymized visitor hash. We do not store raw IP addresses.' },
            { h: 'How we use it', p: 'Click data is used solely to provide analytics within your dashboard. We do not sell, rent, or share your data with third parties for advertising or marketing purposes.' },
            { h: 'Data retention', p: 'Free users retain 30 days of analytics. Pro users retain 1 year. Business users retain unlimited analytics. Account data is retained until you delete your account.' },
            { h: 'Your rights', p: 'You may export or delete your data at any time from the dashboard. Account deletion permanently removes all associated links and analytics.' },
            { h: 'Cookies', p: 'We use a session cookie to keep you signed in. We do not use tracking or advertising cookies.' },
          ].map((s) => (
            <div key={s.h} className="border-b border-border pb-6 last:border-0">
              <h2 className="text-sm font-semibold text-text-primary mb-2">{s.h}</h2>
              <p>{s.p}</p>
            </div>
          ))}
          <p className="text-xs text-text-muted">Last updated: September 2024</p>
        </div>
      </div>
    </MarketingLayout>
  );
}

export function TermsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <SectionHeading eyebrow="Legal" title="Terms of Service." />
        <div className="mt-10 flex flex-col gap-6 text-sm text-text-secondary leading-relaxed">
          {[
            { h: 'Acceptable use', p: 'You may not use 247URL to shorten links to illegal content, malware, phishing pages, or any content that violates applicable law. We reserve the right to disable any link without notice.' },
            { h: 'No warranty', p: '247URL is provided "as is." While we work hard to maintain high availability, we do not guarantee uptime for any specific time period.' },
            { h: 'Link persistence', p: 'We aim to keep your short links working as long as your account is active and in good standing. Free accounts inactive for more than 12 months may be subject to link expiry.' },
            { h: 'Account termination', p: 'We reserve the right to terminate accounts that violate these terms. You may delete your account at any time from settings.' },
            { h: 'Changes', p: 'We may update these terms. Continued use after changes constitutes acceptance.' },
          ].map((s) => (
            <div key={s.h} className="border-b border-border pb-6 last:border-0">
              <h2 className="text-sm font-semibold text-text-primary mb-2">{s.h}</h2>
              <p>{s.p}</p>
            </div>
          ))}
          <p className="text-xs text-text-muted">Last updated: September 2024</p>
        </div>
      </div>
    </MarketingLayout>
  );
}
