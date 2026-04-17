import Link from 'next/link';

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
              Get Started
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
      <footer className="bg-brand-950 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <span>&copy; {new Date().getFullYear()} Steward. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
