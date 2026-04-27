import Link from 'next/link';

const pricingTiers = [
  {
    name: 'Solo Advisor',
    price: 'R 1 499',
    sub: 'per advisor / month',
    cta: { label: 'Start free trial', href: '/signup?tier=solo' },
    highlights: ['All core modules', 'Up to 150 clients', '14-day free trial'],
  },
  {
    name: 'Firm',
    price: 'R 1 199',
    sub: 'per advisor / month + R 999 platform fee',
    cta: { label: 'Start free trial', href: '/signup?tier=firm' },
    highlights: ['Everything in Solo', 'Team & RBAC', '3-seat minimum'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'From R 35 000',
    sub: 'per month + once-off setup',
    cta: { label: 'Contact sales', href: '/contact-sales?tier=enterprise' },
    highlights: ['Dedicated database', 'White-label branding', 'Custom SLA'],
  },
];

const features = [
  {
    title: 'Christian Values Screening',
    desc: 'AI-powered screening aligns every portfolio with biblical principles — automatically flagging holdings that conflict with your clients\u2019 faith convictions.',
    initials: 'CV',
  },
  {
    title: 'Portfolio Management',
    desc: 'Track holdings, asset allocations, and performance across all client portfolios in one centralised dashboard.',
    initials: 'PM',
  },
  {
    title: 'Compliance & FAIS',
    desc: 'Built-in FAIS compliance checks, replacement policy reviews and full audit trails keep you regulation-ready.',
    initials: 'CF',
  },
  {
    title: 'Financial Needs Analysis',
    desc: 'Guided workflows for risk profiling, behavioural assessments and comprehensive financial needs analyses.',
    initials: 'FN',
  },
  {
    title: 'AI Advisory Co-pilot',
    desc: 'An intelligent assistant that helps draft recommendations, screen funds and answer complex regulatory questions.',
    initials: 'AI',
  },
  {
    title: 'Client Management',
    desc: 'Manage client records, dependents, documents and communication from a single, secure workspace.',
    initials: 'CM',
  },
  {
    title: 'Fund Research',
    desc: 'Search and compare South African unit trusts with built-in fact sheets, fees, and values-alignment scores.',
    initials: 'FR',
  },
  {
    title: 'Professional Reports',
    desc: 'Generate branded client reports, record-of-advice documents and portfolio reviews with a single click.',
    initials: 'PR',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-700">
            Steward
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-brand-700/80">
            <Link href="/pricing" className="hover:text-brand-700 transition">Pricing</Link>
            <Link href="/for-firms" className="hover:text-brand-700 transition">For Firms</Link>
            <Link href="/for-enterprise" className="hover:text-brand-700 transition">Enterprise</Link>
            <Link href="/security" className="hover:text-brand-700 transition">Security</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-700 hover:text-brand-500 transition px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-lg transition shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-24 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 text-white overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 border border-white/20 text-white/90 rounded-full px-4 py-1.5 mb-6">
            Faith-Driven Investing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Financial Advisory,{' '}
            <span className="text-brand-200">Aligned with Faith</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Steward empowers South African financial advisors to manage portfolios, ensure compliance, and align every investment decision with Christian values — all from one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-brand-800 font-semibold px-8 py-3.5 rounded-lg hover:bg-brand-50 transition shadow-lg shadow-black/20 text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3 block">
            Our Vision
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 mb-6">
            Investing with Purpose
          </h2>
          <p className="text-brand-700/80 text-lg leading-relaxed">
            We believe finances should serve a higher purpose. Too often, faith-driven investors unknowingly fund industries that conflict with their deepest convictions. Steward was created to bridge that gap — giving advisors the tools to honour God with every rand invested, while still delivering excellent financial outcomes for their clients.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3 block">
              Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete practice-management suite built specifically for South African financial advisors who care about values-aligned investing.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-border rounded-xl p-6 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/40 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold mb-4 group-hover:bg-brand-100 transition-colors">
                  {f.initials}
                </div>
                <h3 className="font-semibold text-brand-800 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3 block">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 mb-4">
              Transparent, ZAR-only pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No hidden fees. Start with a 14-day free trial — no credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {pricingTiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  t.popular
                    ? 'border-2 border-brand-600 bg-white shadow-xl shadow-brand-100/60 relative'
                    : 'border border-border bg-white'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-8 bg-brand-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-brand-900 mb-1">{t.name}</h3>
                <div className="text-3xl font-extrabold text-brand-900 mt-3 mb-1">{t.price}</div>
                <div className="text-xs text-muted-foreground mb-5">{t.sub}</div>
                <ul className="space-y-2 text-sm text-foreground/80 flex-1 mb-6">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-brand-600">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.cta.href}
                  className={`block text-center font-semibold py-2.5 rounded-lg transition text-sm ${
                    t.popular
                      ? 'bg-brand-600 hover:bg-brand-500 text-white'
                      : 'bg-brand-900 hover:bg-brand-800 text-white'
                  }`}
                >
                  {t.cta.label}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/pricing" className="text-sm font-medium text-brand-600 hover:text-brand-500 underline underline-offset-4">
              See full pricing, add-ons &amp; FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />
        <div className="relative max-w-2xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to Invest with Integrity?
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Join a growing community of South African advisors using Steward to align portfolios with faith-based principles.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-brand-800 font-semibold px-8 py-3.5 rounded-lg hover:bg-brand-50 transition shadow-lg shadow-black/20"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-sm text-white/50">
            <div>
              <div className="text-white font-bold text-lg mb-3">Steward</div>
              <p className="leading-relaxed">
                Faith-driven financial advisory software for South African advisors.
              </p>
            </div>
            <div>
              <div className="text-white/80 font-semibold mb-3 uppercase text-xs tracking-widest">Product</div>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/for-firms" className="hover:text-white transition">For Firms</Link></li>
                <li><Link href="/for-enterprise" className="hover:text-white transition">Enterprise</Link></li>
                <li><Link href="/contact-sales" className="hover:text-white transition">Contact Sales</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-white/80 font-semibold mb-3 uppercase text-xs tracking-widest">Trust</div>
              <ul className="space-y-2">
                <li><Link href="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-white/80 font-semibold mb-3 uppercase text-xs tracking-widest">Account</div>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Start Free Trial</Link></li>
                <li><Link href="/client-portal/login" className="hover:text-white transition">Client Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <span>&copy; {new Date().getFullYear()} Steward. All rights reserved.</span>
            <span>ZAR pricing, ex-VAT. 14-day free trial. No card required.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
