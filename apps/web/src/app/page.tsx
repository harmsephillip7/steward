import Link from 'next/link';

const features = [
  {
    title: 'Christian Values Screening',
    desc: 'AI-powered screening aligns every portfolio with biblical principles — automatically flagging holdings that conflict with your clients\u2019 faith convictions.',
    icon: '\u2720',
  },
  {
    title: 'Portfolio Management',
    desc: 'Track holdings, asset allocations, and performance across all client portfolios in one centralised dashboard.',
    icon: '\uD83D\uDCC8',
  },
  {
    title: 'Compliance & FAIS',
    desc: 'Built-in FAIS compliance checks, replacement policy reviews and full audit trails keep you regulation-ready.',
    icon: '\u2705',
  },
  {
    title: 'Financial Needs Analysis',
    desc: 'Guided workflows for risk profiling, behavioural assessments and comprehensive financial needs analyses.',
    icon: '\uD83D\uDCCB',
  },
  {
    title: 'AI Advisory Co-pilot',
    desc: 'An intelligent assistant that helps draft recommendations, screen funds and answer complex regulatory questions.',
    icon: '\uD83E\uDD16',
  },
  {
    title: 'Client Relationship Management',
    desc: 'Manage client records, dependents, documents and communication from a single, secure workspace.',
    icon: '\uD83D\uDC65',
  },
  {
    title: 'Fund Research',
    desc: 'Search and compare South African unit trusts with built-in fact sheets, fees, and values-alignment scores.',
    icon: '\uD83D\uDD0D',
  },
  {
    title: 'Professional Reports',
    desc: 'Generate branded client reports, record-of-advice documents and portfolio reviews with a single click.',
    icon: '\uD83D\uDCC4',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Nav */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-brand-700">Steward</Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-brand-700 hover:text-brand-900 transition">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Faith-Based Financial Advisory,<br className="hidden sm:block" /> Simplified
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Steward empowers South African financial advisors to manage portfolios, ensure compliance, and align every investment decision with Christian values — all from one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="border border-white/40 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/10 transition text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-brand-50/40">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-900 mb-6">Our Vision</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We believe finances should serve a higher purpose. Too often, faith-driven investors unknowingly fund industries that conflict with their deepest convictions. Steward was created to bridge that gap — giving advisors the tools to honour God with every rand invested, while still delivering excellent financial outcomes for their clients.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-brand-900 text-center mb-4">Everything You Need</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            A complete practice-management suite built specifically for South African financial advisors who care about values-aligned investing.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-border rounded-xl p-6 hover:shadow-lg transition">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-semibold text-brand-800 mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-900 to-brand-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Invest with Integrity?</h2>
          <p className="text-white/80 mb-8">
            Join a growing community of South African advisors using Steward to align portfolios with faith-based principles.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Steward. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-brand-700 transition">Sign In</Link>
            <Link href="/signup" className="hover:text-brand-700 transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
