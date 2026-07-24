import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function SubscribeBar() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Enter your email to subscribe.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setSubmitted(true);
    // TODO: wire to actual subscribe endpoint
  };

  return (
    <section className="py-16 bg-[#0A1628]">
      <PageWrapper>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#00C9A7]/10 mb-5">
            <Mail className="h-5 w-5 text-[#00C9A7]" />
          </div>

          <h4 className="text-2xl font-bold text-white">Stay informed</h4>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-sm mx-auto">
            Get weekly Lagos real estate insights and verified listings delivered straight to your inbox.
          </p>

          {submitted ? (
            <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-[#00C9A7]/10 border border-[#00C9A7]/20 px-5 py-4 text-sm font-semibold text-[#00C9A7]">
              <CheckCircle2 className="h-4 w-4" />
              You're subscribed — check your inbox to confirm.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7">
              <div
                className={`flex items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-lg transition-shadow ${
                  error ? 'ring-2 ring-red-400/60' : 'focus-within:shadow-xl'
                }`}
              >
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="flex-1 min-w-0 bg-transparent text-[#0F172A] placeholder:text-slate-400 text-sm px-4 py-2.5 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-[#00C9A7] px-5 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
                >
                  Subscribe
                </button>
              </div>

              <div className="mt-3 min-h-[1.25rem] text-left px-1">
                {error ? (
                  <p className="text-xs text-red-400">{error}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    No spam. Unsubscribe anytime.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </PageWrapper>
    </section>
  );
}