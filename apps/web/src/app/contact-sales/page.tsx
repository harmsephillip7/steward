'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketingNav, MarketingFooter } from '@/components/marketing/marketing-chrome';

export default function ContactSalesPage() {
  const params = useSearchParams();
  const initialTier = (params.get('tier') as 'solo' | 'firm' | 'enterprise') || 'enterprise';
  const [form, setForm] = useState({
    contact_name: '',
    email: '',
    phone: '',
    firm_name: '',
    advisor_count: '',
    notes: '',
    tier_interest: initialTier,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/sales/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          advisor_count: form.advisor_count ? parseInt(form.advisor_count, 10) : null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <section className="pt-32 pb-16 bg-gradient-to-b from-brand-900 to-brand-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Talk to sales
          </h1>
          <p className="text-white/70 text-lg">
            For firms and enterprise enquiries. We respond within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-6">
          {submitted ? (
            <div className="border border-brand-200 bg-brand-50 rounded-xl p-8 text-center">
              <h2 className="text-xl font-semibold text-brand-900 mb-2">Thank you.</h2>
              <p className="text-muted-foreground">
                Your enquiry has been received. A member of our team will be in touch within one
                business day.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Your name</label>
                <input
                  required
                  value={form.contact_name}
                  onChange={set('contact_name')}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Work email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={set('phone')}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Firm name</label>
                  <input
                    required
                    value={form.firm_name}
                    onChange={set('firm_name')}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Advisors</label>
                  <input
                    type="number"
                    min={1}
                    value={form.advisor_count}
                    onChange={set('advisor_count')}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Tier of interest</label>
                <select
                  value={form.tier_interest}
                  onChange={set('tier_interest')}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="solo">Solo</option>
                  <option value="firm">Firm</option>
                  <option value="enterprise">Enterprise (white-label)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">
                  How can we help?
                </label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={set('notes')}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
