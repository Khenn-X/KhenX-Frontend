import { FormEvent, useState } from 'react';
import { CheckCircle, Crown, Mail, UserPlus } from 'lucide-react';
import { useCreateAdmin } from '../../hooks/useSuperAdmin';
import { cn } from '../../lib/utils';

const SuperadminAdminRequestsPage = () => {
  const { mutate: createAdmin, isPending, error, data } = useCreateAdmin();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessEmail(null);

    createAdmin(
      { fullName: fullName.trim(), email: email.trim() },
      {
        onSuccess: (response) => {
          const createdEmail = response.data.data.user.email;
          setSuccessEmail(createdEmail);
          setFullName('');
          setEmail('');
        },
      },
    );
  };

  const apiError = error as Error | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#0A1628] to-[#0F172A] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
              <Crown className="h-3 w-3" />
              Superadmin
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Create Admin</h1>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              Invite a new administrator directly. The account is created immediately and the invite email is sent right away.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Admin"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@khenx.com"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {isPending ? 'Creating admin…' : 'Create Admin'}
            </button>
          </div>
        </form>

        {successEmail && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Admin account created, invite sent to <span className="font-semibold">{successEmail}</span>.
              </span>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{apiError.message || 'Failed to create the admin account.'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminAdminRequestsPage;