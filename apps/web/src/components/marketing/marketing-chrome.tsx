import Link from 'next/link';

export function MarketingNav() {
  return (
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
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-brand-950 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <div className="text-white font-semibold mb-3">Steward</div>
            <p className="text-white/50 leading-relaxed">
              Faith-aligned wealth management software for South African advisors and firms.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/for-firms" className="hover:text-white">For Firms</Link></li>
              <li><Link href="/for-enterprise" className="hover:text-white">Enterprise</Link></li>
              <li><Link href="/security" className="hover:text-white">Security</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/contact-sales" className="hover:text-white">Contact sales</Link></li>
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-white">Start free trial</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Trust</div>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/security" className="hover:text-white">POPIA & data residency</Link></li>
              <li><Link href="/security#sub-processors" className="hover:text-white">Sub-processors</Link></li>
              <li><Link href="/security#audit" className="hover:text-white">Audit trail</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Steward (Pty) Ltd. All rights reserved.</span>
          <span>Made in South Africa &middot; ZAR pricing ex-VAT</span>
        </div>
      </div>
    </footer>
  );
}
