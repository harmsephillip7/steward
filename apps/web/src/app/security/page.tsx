import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/marketing/marketing-chrome';

export const metadata = {
  title: 'Security & Trust — Steward',
  description: 'How Steward protects your firm and clients\u2019 data: tenant isolation, encryption, audit hash chain, POPIA compliance.',
};

const subProcessors = [
  { name: 'Neon', purpose: 'Managed PostgreSQL (data at rest, AES-256)', region: 'EU / US' },
  { name: 'Cloudflare R2', purpose: 'Encrypted object storage (documents, reports)', region: 'EU' },
  { name: 'OpenAI', purpose: 'Christian-values screening (no PII transmitted)', region: 'US' },
  { name: 'Stripe', purpose: 'Card payments processor', region: 'EU / US' },
  { name: 'Peach Payments', purpose: 'ZA debit-order & EFT processor', region: 'South Africa' },
  { name: 'SigniFlow', purpose: 'Advanced electronic signatures (ECTA-compliant)', region: 'South Africa' },
  { name: 'Railway', purpose: 'Application hosting (API)', region: 'EU' },
  { name: 'Vercel', purpose: 'Application hosting (web)', region: 'Global edge' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <section className="pt-32 pb-12 bg-gradient-to-b from-brand-900 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            Security & Compliance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Trust is the product.
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Steward stores some of the most sensitive data your firm holds. Here\u2019s exactly how
            we protect it — at every layer, for every tier.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          {[
            {
              t: 'Tenant isolation',
              d: 'Solo and Firm tenants share a hardened PostgreSQL cluster. Every row is scoped by firm and protected by Postgres Row Level Security policies. Enterprise tenants run on a dedicated PostgreSQL instance with a dedicated R2 bucket — no shared infrastructure.',
            },
            {
              t: 'Encryption',
              d: 'TLS 1.3 in transit. AES-256 at rest (Neon, R2). Sensitive fields (BYO API keys, dedicated-DB connection strings) are encrypted at the column level using a key managed in Railway secrets.',
            },
            {
              t: 'Audit hash chain',
              id: 'audit',
              d: 'Every write — every client edit, every report generation, every portal acceptance — is recorded in an append-only audit log. Each row hashes the previous, producing a tamper-evident chain. Auditors can verify continuity in one query.',
            },
            {
              t: 'Authentication & RBAC',
              d: 'Passwords hashed with bcrypt (12 rounds). 8-hour JWT sessions. Firm tier supports SSO (Google, Microsoft); Enterprise adds SAML. Five built-in roles (owner, admin, advisor, assistant, compliance officer) with granular permissions.',
            },
            {
              t: 'POPIA compliance',
              d: 'We are an Information Officer registered processor. One-click export and one-click delete fulfil POPIA Sections 23 & 24. Data is processed only for the purposes set out in our DPA, which Enterprise customers counter-sign at contract.',
            },
            {
              t: 'Backup & recovery',
              d: 'Point-in-time recovery up to 7 days (Solo / Firm), 30 days (Enterprise). Documents and reports replicated across two R2 regions. Quarterly disaster-recovery drills.',
            },
            {
              t: 'Independent assurance',
              d: 'Annual penetration test by an external CREST-accredited firm. SOC 2 Type II in progress. ISO 27001 on the roadmap for FY27.',
            },
            {
              t: 'Incident response',
              d: 'Security incidents are triaged within 1 hour and material breaches are notified to affected firms within 72 hours, in line with POPIA Section 22.',
            },
          ].map((card) => (
            <div
              key={card.t}
              id={card.id}
              className="border border-border rounded-xl p-6 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-brand-900 mb-2">{card.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-brand-50" id="sub-processors">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-brand-900 mb-2 text-center">Sub-processors</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Every third party that touches your data, with what they do and where they sit.
          </p>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-100/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-brand-800">Provider</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">Region</th>
                </tr>
              </thead>
              <tbody>
                {subProcessors.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-brand-900">{p.name}</td>
                    <td className="px-4 py-3 text-foreground/80">{p.purpose}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            We notify customers in writing 30 days before adding any new sub-processor.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-brand-900 mb-3">Need our security pack?</h2>
          <p className="text-muted-foreground mb-6">
            DPA, sub-processor list, latest pen-test summary and our POPIA addendum — sent the
            same business day.
          </p>
          <Link
            href="/contact-sales?reason=security_pack"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3 rounded-lg transition"
          >
            Request security pack
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
