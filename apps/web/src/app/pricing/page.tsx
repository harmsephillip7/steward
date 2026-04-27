import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/marketing/marketing-chrome';

interface Tier {
  code: 'solo' | 'firm' | 'enterprise';
  name: string;
  tagline: string;
  priceLabel: string;
  priceSub: string;
  cta: { label: string; href: string };
  highlighted?: boolean;
  features: string[];
  caps: string[];
}

const tiers: Tier[] = [
  {
    code: 'solo',
    name: 'Solo Advisor',
    tagline: 'For independent advisors running their own practice.',
    priceLabel: 'R 1 499',
    priceSub: 'per advisor / month, ex-VAT',
    cta: { label: 'Start 14-day trial', href: '/signup?tier=solo' },
    features: [
      'All core modules: clients, portfolios, FNA',
      'Christian values screening (1 000 / month)',
      'Compliance register (FAIS, FICA, CPD, complaints)',
      'Reports engine with audit hash chain',
      'Client portal with e-signature (50 docs / month)',
      'Email support · 99% target uptime',
    ],
    caps: ['Up to 150 clients', '1 advisor seat', 'Shared, isolated database'],
  },
  {
    code: 'firm',
    name: 'Firm',
    tagline: 'For practices with 2–25 advisors who collaborate.',
    priceLabel: 'R 1 199',
    priceSub: 'per advisor / month + R 999 platform fee',
    cta: { label: 'Start 14-day trial', href: '/signup?tier=firm' },
    highlighted: true,
    features: [
      'Everything in Solo',
      'Firm console, teams & RBAC',
      'KI / Supervisor oversight workflows',
      'SSO (Google, Microsoft)',
      'Christian values screening (5 000 / month)',
      'E-signature (250 docs / month)',
      'Priority support · 99.5% SLA',
    ],
    caps: ['3-seat minimum', '250 clients per advisor', 'Shared, isolated database'],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    tagline: 'White-label deployment for large firms, banks and networks.',
    priceLabel: 'From R 35 000',
    priceSub: 'per month + R 75 000 once-off setup',
    cta: { label: 'Contact sales', href: '/contact-sales?tier=enterprise' },
    features: [
      'Everything in Firm',
      'Dedicated PostgreSQL database',
      'Dedicated R2 storage bucket',
      'Custom domain & full white-label branding',
      'BYO OpenAI / SigniFlow keys',
      'SAML SSO',
      'Named CSM · 99.9% SLA',
      'DPA, POPIA addendum, on-prem option',
    ],
    caps: ['Unlimited clients & advisors', 'Bespoke contract', 'Dedicated infrastructure'],
  },
];

const faqs = [
  {
    q: 'Can I switch tiers later?',
    a: 'Yes. Solo → Firm is a one-click upgrade in Settings → Billing. Firm → Enterprise involves a short setup window for the dedicated database and is co-ordinated by your CSM.',
  },
  {
    q: 'What happens during the 14-day trial?',
    a: 'You get full access to your chosen tier without entering a card. We send a friendly nudge from day 10. If you don\u2019t add a payment method, the workspace becomes read-only at day 14 and is archived after 30 days.',
  },
  {
    q: 'Is each firm\u2019s data isolated?',
    a: 'Yes. Solo and Firm tenants share a hardened multi-tenant database with row-level scoping by firm and Postgres Row Level Security. Enterprise tenants get a dedicated PostgreSQL instance and a dedicated R2 bucket.',
  },
  {
    q: 'How is AI screening usage counted?',
    a: 'A "screen" is one fund or holding evaluated by our Christian-values screening engine. Soft caps apply per tier; overage is billed at R 0.85 per screen. We will alert you well before you hit the cap.',
  },
  {
    q: 'Do you support debit-order or EFT billing?',
    a: 'Yes. We accept South African debit orders and EFT via Peach Payments in addition to credit cards via Stripe.',
  },
];

export const metadata = {
  title: 'Pricing — Steward',
  description: 'Three transparent tiers in ZAR — Solo, Firm, and Enterprise (white-label, dedicated database).',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <section className="pt-32 pb-12 bg-gradient-to-b from-brand-900 to-brand-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Pricing built for South African advisors
          </h1>
          <p className="text-white/70 text-lg">
            Transparent, ZAR-only pricing. No hidden onboarding fees on Solo or Firm tiers.
            14-day free trial — no credit card required.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.code}
              className={`rounded-2xl p-8 flex flex-col ${
                t.highlighted
                  ? 'border-2 border-brand-600 shadow-xl shadow-brand-100/60 bg-brand-50/30 relative'
                  : 'border border-border bg-white'
              }`}
            >
              {t.highlighted && (
                <span className="absolute -top-3 left-8 bg-brand-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-brand-900 mb-1">{t.name}</h3>
                <p className="text-sm text-foreground">{t.tagline}</p>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-brand-900">{t.priceLabel}</div>
                <div className="text-xs text-foreground/85 mt-1">{t.priceSub}</div>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground mb-6 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-600 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-4 mb-6 space-y-1">
                {t.caps.map((c) => (
                  <div key={c} className="text-xs text-foreground/85">
                    {c}
                  </div>
                ))}
              </div>
              <Link
                href={t.cta.href}
                className={`block text-center font-semibold py-3 rounded-lg transition ${
                  t.highlighted
                    ? 'bg-brand-600 hover:bg-brand-500 text-white'
                    : 'bg-brand-900 hover:bg-brand-800 text-white'
                }`}
              >
                {t.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-brand-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-brand-900 mb-2 text-center">Add-ons</h2>
          <p className="text-center text-foreground/70 text-sm mb-8">
            Available on every tier. Charged monthly only when used.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { k: 'E-signature overage', v: 'R 25 / document over plan cap' },
              { k: 'AI screening overage', v: 'R 0.85 / screen over plan cap' },
              { k: 'Storage', v: 'R 1.20 / GB / month' },
              { k: 'Bespoke report template', v: 'R 8 000 once-off' },
            ].map((x) => (
              <div key={x.k} className="bg-white border border-border rounded-lg p-4 flex justify-between">
                <span className="text-foreground/80">{x.k}</span>
                <span className="text-brand-700 font-medium">{x.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-brand-900 mb-8 text-center">Frequently asked</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="border border-border rounded-lg p-5 group">
                <summary className="font-medium text-brand-900 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-brand-500 text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
