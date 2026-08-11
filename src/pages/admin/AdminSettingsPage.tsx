import { Link } from 'react-router-dom';
import { ChevronRight, KeyRound, Mail } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { ROUTES } from '../../constants/routes';
import SharedAccountSettings, { SectionCard } from '../../components/settings/SharedAccountSettings';
// NOTE: adjust the shared-component import path/location if you place
// SharedAccountSettings.tsx somewhere other than src/pages/admin/.

export default function AdminSettingsPage() {
  return (
    <PageWrapper className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account, security, and preferences.</p>
        </div>

        <SectionCard title="Account" icon={<KeyRound className="h-4 w-4" />}>
          <p className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            Name, email, and phone are managed from your Profile page.
          </p>
          <Link to={ROUTES.ADMIN_PROFILE} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00A88C] hover:text-[#00A88C]/80">
            View in Profile <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </SectionCard>

        <SharedAccountSettings />
      </div>
    </PageWrapper>
  );
}