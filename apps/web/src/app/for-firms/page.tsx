import Link from 'next/link';
import { MarketingNav, MarketingFooter } from '@/components/marketing/marketing-chrome';

export const metadata = {
  title: 'Steward for Firms',
  description: 'Run your whole practice from one workspace: teams, RBAC, KI oversight, shared compliance register and SSO.',
};

export default function ForFirmsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <section className="pt-32 pb-16 bg-gradient-to-b from-brand-900 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Built for practices that grew up.
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            When two or more advisors work together, your tooling has to keep up. Steward Firm
            adds team workflows, supervisor oversight and a single firm-wide compliance view —
            without losing the per-advisor focus that made Solo work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup?tier=firm"
              className="bg-white text-brand-800 font-semibold px-7 py-3 rounded-lg hover:bg-brand-50 transition"
            >
              Start 14-day trial
            </Link>
            <Link
              href="/contact-sales?tier=firm"
              className="border border-white/30 text-white font-medium px-7 py-3 rounded-lg hover:bg-white/10 transition"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          {[
            ['Firm console', 'Dashboard view of every advisor: pipeline, AUM, FAIS readiness, CPD progress, complaints status.'],
            ['Teams & RBAC', 'Group advisors into teams, assign clients to teams, and grant role-based permissions (owner / admin / advisor / assistant / compliance officer).'],
            ['KI & supervisor oversight', 'Built-in supervision queue: a KI signs off on records of advice, replacement comparisons and high-risk recommendations before they go to the client.'],
            ['Shared compliance register', 'Fit-and-proper attestations, CPD, complaints and sanctions screens — one register, drillable per advisor.'],
            ['Single sign-on', 'Google and Microsoft SSO. SCIM provisioning on request.'],
            ['Priority support', 'Response within 4 business hours. 99.5% uptime SLA.'],
          ].map(([t, d]) => (
            <div key={t} className="border border-border rounded-xl p-6">
              <h3 className="font-semibold text-brand-900 mb-2">{t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-brand-50 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-2xl font-medium text-brand-900 mb-3 leading-snug">
            R 1 199 per advisor, per month — minimum 3 seats — plus a R 999 platform fee.
          </p>
          <p className="text-muted-foreground mb-8">14 days free. No card required.</p>
          <Link
            href="/signup?tier=firm"
            className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-lg transition"
          >
            Start free trial
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
