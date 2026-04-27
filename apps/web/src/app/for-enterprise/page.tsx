import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/marketing/marketing-chrome';

export const metadata = {
  title: 'Steward Enterprise — White-label & dedicated database',
  description: 'A fully white-labelled deployment of Steward, running on a dedicated PostgreSQL database and dedicated R2 bucket.',
};

export default function ForEnterprisePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <section className="pt-32 pb-16 bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            Enterprise
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Your firm. Your brand. Your database.
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            A fully white-labelled deployment on a dedicated PostgreSQL instance and dedicated
            R2 bucket. Bring your own OpenAI and SigniFlow keys. SAML SSO. Named CSM. 99.9% SLA.
          </p>
          <Link
            href="/contact-sales?tier=enterprise"
            className="inline-block bg-white text-brand-900 font-semibold px-7 py-3.5 rounded-lg hover:bg-brand-50 transition"
          >
            Contact sales
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-brand-900 mb-8 text-center">
            What makes Enterprise different
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              ['Dedicated PostgreSQL', 'A separate Neon project per Enterprise tenant. Your data never sits in a row alongside another firm\u2019s. Point-in-time recovery up to 30 days.'],
              ['Dedicated object storage', 'A dedicated Cloudflare R2 bucket for documents, reports and signed PDFs. Cross-region replication included.'],
              ['Custom domain', 'app.your-firm.co.za and clients.your-firm.co.za with automated SSL. Full DNS hand-off.'],
              ['Full white-label', 'Your logo, colours, fonts and footer disclaimers across the dashboard, client portal and every PDF report.'],
              ['BYO OpenAI', 'Use your own OpenAI account for AI screening and advisory co-pilot. Your data, your tokens, your bill.'],
              ['BYO SigniFlow', 'Issue Advanced Electronic Signatures (AES) under your own SigniFlow tenancy.'],
              ['SAML SSO', 'Connect Okta, Entra ID, Ping or any SAML 2.0 IdP. SCIM provisioning available.'],
              ['Named CSM', 'A dedicated customer success manager. Quarterly business reviews. 99.9% SLA with service credits.'],
              ['DPA & POPIA addendum', 'Counter-signed at contract. We process as your operator under POPIA — never as a controller.'],
              ['On-prem option', 'For banks and financial-services groups: a self-hosted Steward in your VPC, managed by us.'],
            ].map(([t, d]) => (
              <div key={t} className="border border-border rounded-xl p-6">
                <h3 className="font-semibold text-brand-900 mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-50 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-2xl font-medium text-brand-900 mb-3 leading-snug">
            From R 35 000 / month + R 75 000 once-off setup.
          </p>
          <p className="text-muted-foreground mb-8">
            Final pricing depends on advisor count, infrastructure region and integration scope.
          </p>
          <Link
            href="/contact-sales?tier=enterprise"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-lg transition"
          >
            Request a proposal
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
