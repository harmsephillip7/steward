'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Tier = 'solo' | 'firm' | 'enterprise';

const TIER_COPY: Record<Tier, { title: string; sub: string; price: string }> = {
  solo: {
    title: 'Solo Advisor',
    sub: 'Independent advisor — full platform on a shared, isolated database.',
    price: 'R 1 499 / advisor / month after the 14-day trial',
  },
  firm: {
    title: 'Firm',
    sub: '2–25 advisors with shared compliance, RBAC, SSO and KI oversight.',
    price: 'R 1 199 / advisor / month + R 999 platform fee (3-seat minimum)',
  },
  enterprise: {
    title: 'Enterprise',
    sub: 'White-label, dedicated database. Sales-assisted setup.',
    price: 'From R 35 000 / month + R 75 000 once-off setup',
  },
};

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useAuth();

  const initialTier = (params.get('tier') as Tier) || 'solo';
  const [tier, setTier] = useState<Tier>(initialTier);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    firm_name: '',
    fsp_number: '',
    seats: '3',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (tier === 'enterprise') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-brand-700 mb-2">Steward</h1>
        </Link>
        <h2 className="text-lg font-semibold text-brand-900 mb-2">Enterprise is sales-assisted</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enterprise tenants get a dedicated database, custom domain and white-label deployment.
          Setup is co-ordinated by our team to make sure your contract, DPA and DNS are right.
        </p>
        <Link
          href="/contact-sales?tier=enterprise"
          className="inline-block w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-lg transition mb-3"
        >
          Talk to sales
        </Link>
        <button
          onClick={() => setTier('firm')}
          className="text-sm text-brand-600 hover:text-brand-700"
        >
          ← Back to self-serve plans
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (tier === 'firm' && parseInt(form.seats, 10) < 3)
      return setError('Firm tier requires a minimum of 3 seats');

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        firm_name: form.firm_name,
        fsp_number: form.fsp_number || undefined,
      });

      const cookie = document.cookie
        .split('; ')
        .find((r) => r.startsWith('steward_auth='));
      const token = cookie
        ? JSON.parse(decodeURIComponent(cookie.split('=').slice(1).join('='))).token
        : null;

      if (token) {
        if (tier === 'firm') {
          await fetch(`${API_URL}/firm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: form.firm_name,
              fsp_number: form.fsp_number || null,
            }),
          });
        }

        await fetch(`${API_URL}/billing/subscription/start-trial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_code: tier,
            seats: tier === 'firm' ? parseInt(form.seats, 10) : 1,
          }),
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-bold text-brand-700">Steward</h1>
        </Link>
        <p className="text-muted-foreground mt-1 text-sm">Create your account</p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-brand-50 p-1.5 rounded-lg mb-6">
        {(['solo', 'firm', 'enterprise'] as Tier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`text-xs font-semibold py-2 rounded-md transition ${
              tier === t
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-brand-700/60 hover:text-brand-700'
            }`}
          >
            {TIER_COPY[t].title}
          </button>
        ))}
      </div>

      <div className="bg-brand-50/60 border border-brand-100 rounded-lg p-4 mb-6">
        <div className="text-sm font-semibold text-brand-900">{TIER_COPY[tier].title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{TIER_COPY[tier].sub}</div>
        <div className="text-xs text-brand-700 font-medium mt-2">{TIER_COPY[tier].price}</div>
        <div className="text-[11px] text-muted-foreground mt-2">
          14-day trial · no credit card required
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="advisor@yourfirm.co.za"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={set('password')}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Confirm</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            {tier === 'firm' ? 'Firm Name' : 'Practice / Trading Name'}
          </label>
          <input
            type="text"
            required
            value={form.firm_name}
            onChange={set('firm_name')}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Your Financial Services Company"
          />
        </div>

        <div className={tier === 'firm' ? 'grid grid-cols-2 gap-3' : ''}>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">
              FSP Number <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.fsp_number}
              onChange={set('fsp_number')}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. 12345"
            />
          </div>
          {tier === 'firm' && (
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Initial seats</label>
              <input
                type="number"
                min={3}
                required
                value={form.seats}
                onChange={set('seats')}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Start 14-day trial'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 px-4 py-12">
      <Suspense fallback={null}>
        <SignupInner />
      </Suspense>
    </div>
  );
}
