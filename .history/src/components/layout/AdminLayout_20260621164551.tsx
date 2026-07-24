import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Users,
  LogOut,
  MapPin,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useLogout } from '../../hooks/useAuth';
import { useAdminStats } from '../../hooks/useAdmin';
import { ROUTES } from '../../constants/routes';
import { cn, getInitials } from '../../lib/utils';

const adminNavItems = [
  { label: 'Dashboard',        to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, badgeKey: null },
  { label: 'Listings',         to: ROUTES.ADMIN_LISTINGS,  icon: Building2,        badgeKey: 'listings.pending' },
  { label: 'KYC Verification', to: ROUTES.ADMIN_KYC,       icon: ShieldCheck,      badgeKey: 'agents.pendingKYC' },
  { label: 'Fraud Reports',    to: ROUTES.ADMIN_FRAUD,      icon: AlertTriangle,    badgeKey: 'fraud.open' },
  { label: 'Agents',           to: ROUTES.ADMIN_AGENTS,     icon: Users,            badgeKey: null },
] as const;

const superadminOnlyItems = [
  { label: 'Admin Approvals', to: ROUTES.SUPERADMIN_ADMIN_REQUESTS, icon: ShieldCheck, badgeKey: 'adminApprovals.pending' },
] as const;

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  badgeKey: string | null;
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: statsData } = useAdminStats();
  const navigate = useNavigate();

  // res.data.data = the nested stats object
  const stats = statsData?.data?.data;
  const isSuperadmin = user?.role === 'superadmin';

  const navItems: NavItem[] = isSuperadmin
    ? [...adminNavItems, ...superadminOnlyItems]
    : [...adminNavItems];

  // Resolve dot-notation badge keys against the nested stats object
  // e.g. 'listings.pending' → stats.listings.pending
  const getBadgeCount = (badgeKey: string | null): number | null => {
    if (!badgeKey || !stats) return null;
    const [group, field] = badgeKey.split('.') as [string, string];
    const groupObj = stats[group as keyof typeof stats] as Record<string, number> | undefined;
    const val = groupObj?.[field];
    return typeof val === 'number' && val > 0 ? val : null;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0A1628] transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {isSidebarOpen && (
            <button onClick={() => navigate(ROUTES.HOME)} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C9A7]">
                <MapPin className="h-3.5 w-3.5 text-[#0A1628]" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-base font-bold text-white">
                  Khen<span className="text-[#00C9A7]">X</span>
                </span>
                <span className="ml-2 rounded-full bg-[#F59E0B]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#F59E0B] uppercase tracking-wide">
                  {isSuperadmin ? 'Superadmin' : 'Admin'}
                </span>
              </div>
            </button>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              'text-slate-400 hover:text-white transition-colors rounded-md p-1',
              !isSidebarOpen && 'mx-auto'
            )}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ label, to, icon: Icon, badgeKey }) => {
            const badge = getBadgeCount(badgeKey);
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group relative',
                    isActive
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <div className="relative shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                  {!isSidebarOpen && badge !== null && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                {isSidebarOpen && (
                  <>
                    <span className="flex-1">{label}</span>
                    {badge !== null && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-bold text-[#0A1628]">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-[#F59E0B]">
                  {isSuperadmin ? 'Superadmin' : 'Administrator'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors',
              !isSidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isSidebarOpen && <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'ml-60' : 'ml-16'
        )}
      >
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-slate-200 px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F59E0B]/15 px-2.5 py-1 text-xs font-semibold text-[#F59E0B] uppercase tracking-wide">
              {isSuperadmin ? 'Superadmin Panel' : 'Admin Panel'}
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F172A]">{user.fullName}</p>
                <p className="text-xs text-[#F59E0B]">
                  {isSuperadmin ? 'Superadmin' : 'Administrator'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-bold text-[#0A1628]">
                {getInitials(user.fullName)}
              </div>
            </div>
          )}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;