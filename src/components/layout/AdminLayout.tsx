import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, ShieldCheck,
  AlertTriangle, Users, LogOut, MapPin, ChevronLeft, ChevronRight, UserCheck,
  Menu, Bell,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useLogout } from '../../hooks/useAuth';
import { useAdminStats } from '../../hooks/useAdmin';
import { ROUTES } from '../../constants/routes';
import { cn, getInitials } from '../../lib/utils';
import logo from '../../assets/kgreen.png';

// Nav items for plain admin
const adminNavItems = [
  { label: 'Dashboard',        to: ROUTES.ADMIN_DASHBOARD,     icon: LayoutDashboard, badgeKey: null },
  { label: 'Neighbourhood Data', to: ROUTES.ADMIN_NEIGHBOURHOODS, icon: MapPin, badgeKey: null },
  { label: 'Listings',         to: ROUTES.ADMIN_LISTINGS,      icon: Building2,       badgeKey: 'listings.pending' },
  { label: 'KYC Verification', to: ROUTES.ADMIN_KYC,           icon: ShieldCheck,     badgeKey: 'agents.pendingKYC' },
  { label: 'Fraud Reports',    to: ROUTES.ADMIN_FRAUD,          icon: AlertTriangle,   badgeKey: 'fraud.open' },
  { label: 'Agents',           to: ROUTES.ADMIN_AGENTS,         icon: Users,           badgeKey: null },
];

// Nav items for superadmin — Dashboard points to THEIR route, plus extra item
const superadminNavItems = [
  { label: 'Dashboard',        to: ROUTES.SUPERADMIN_DASHBOARD,       icon: LayoutDashboard, badgeKey: null },
  { label: 'Admin Approvals',  to: ROUTES.SUPERADMIN_ADMIN_REQUESTS,  icon: UserCheck,       badgeKey: 'adminApprovals.pending' },
  { label: 'Neighbourhood Data', to: ROUTES.ADMIN_NEIGHBOURHOODS, icon: MapPin, badgeKey: null },
  { label: 'Listings',         to: ROUTES.ADMIN_LISTINGS,             icon: Building2,       badgeKey: 'listings.pending' },
  { label: 'KYC Verification', to: ROUTES.ADMIN_KYC,                  icon: ShieldCheck,     badgeKey: 'agents.pendingKYC' },
  { label: 'Fraud Reports',    to: ROUTES.ADMIN_FRAUD,                 icon: AlertTriangle,   badgeKey: 'fraud.open' },
  { label: 'Agents',           to: ROUTES.ADMIN_AGENTS,                icon: Users,           badgeKey: null },
];

type NavItem = { label: string; to: string; icon: React.ElementType; badgeKey: string | null };

interface AdminLayoutProps { children: React.ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: statsData } = useAdminStats();
  const navigate = useNavigate();
  const location = useLocation();

  const stats = statsData?.data?.data;
  const isSuperadmin = user?.role === 'superadmin';
  const navItems: NavItem[] = isSuperadmin ? superadminNavItems : adminNavItems;

  const getBadgeCount = (badgeKey: string | null): number | null => {
    if (!badgeKey || !stats) return null;
    const [group, field] = badgeKey.split('.');
    const val = (stats as any)[group]?.[field];
    return typeof val === 'number' && val > 0 ? val : null;
  };

  const currentPage = navItems.find((item) => item.to === location.pathname);

  // Aggregate pending count across every nav item that tracks one — drives the topbar bell.
  const totalPending = navItems.reduce((sum, item) => sum + (getBadgeCount(item.badgeKey) ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* ── Mobile backdrop ──────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out',
        // Desktop: collapsible width. Mobile: slide in/out entirely.
        isSidebarOpen ? 'w-60 translate-x-0' : 'w-60 -translate-x-full lg:w-16 lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-slate-100 shrink-0 overflow-hidden',
          isSidebarOpen ? 'px-4' : 'justify-center px-0'
        )}>
          <button onClick={() => navigate(ROUTES.HOME)} className="flex items-center gap-2 min-w-0 shrink-0">
            <img
              src={logo}
              alt="KhenX"
              className={cn(
                'shrink-0 object-contain transition-all duration-300',
                isSidebarOpen ? 'h-8 w-auto object-left' : 'h-8 w-8 object-cover object-left rounded-md'
              )}
            />
            {isSidebarOpen && (
              <span className="mt-0.5 inline-block rounded-full bg-[#F59E0B]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#B45309] uppercase tracking-wide shrink-0">
                {isSuperadmin ? 'Superadmin' : 'Admin'}
              </span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {isSidebarOpen && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 select-none">
              Menu
            </p>
          )}
          {navItems.map(({ label, to, icon: Icon, badgeKey }) => {
            const badge = getBadgeCount(badgeKey);
            return (
              <NavLink
                key={to}
                to={to}
                title={!isSidebarOpen ? label : undefined}
                className={({ isActive }) => cn(
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150',
                  isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                  isActive
                    ? 'bg-[#F59E0B]/10 text-[#B45309]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[#F59E0B]" />
                    )}
                    <span className={cn(
                      'relative flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all',
                      isActive
                        ? 'bg-[#F59E0B]/15 text-[#B45309]'
                        : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                    )}>
                      <Icon className="h-4 w-4" />
                      {!isSidebarOpen && badge !== null && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </span>
                    {isSidebarOpen && (
                      <>
                        <span className="flex-1 truncate">{label}</span>
                        {badge !== null && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout + Collapse */}
        <div className="shrink-0 border-t border-slate-100 p-3 space-y-1">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 mb-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-xs font-bold text-white shadow-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#0F172A] truncate leading-none">{user.fullName}</p>
                <p className="text-[10px] text-[#B45309] mt-0.5">{isSuperadmin ? 'Superadmin' : 'Administrator'}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            title={!isSidebarOpen ? 'Log out' : undefined}
            className={cn(
              'flex w-full items-center rounded-xl text-sm font-medium transition-colors',
              isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5',
              'text-red-400/80 hover:bg-red-50 hover:text-red-500 disabled:opacity-50'
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0">
              <LogOut className="h-4 w-4" />
            </span>
            {isSidebarOpen && <span className="text-xs">{isLoggingOut ? 'Logging out…' : 'Log out'}</span>}
          </button>

          {/* Collapse toggle — desktop only, sidebar is always full-width on mobile */}
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Collapse' : 'Expand'}
            className={cn(
              'hidden lg:flex w-full items-center rounded-xl text-xs font-medium transition-colors',
              isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5',
              'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0">
              <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', !isSidebarOpen && 'rotate-180')} />
            </span>
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className={cn('flex-1 min-w-0 transition-all duration-300 ease-in-out', isSidebarOpen ? 'lg:ml-60' : 'lg:ml-16')}>
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-4 sm:px-6 bg-[#F8FAFC]/90 backdrop-blur-sm border-b mb-4 border-slate-200/80 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {currentPage?.label ?? 'Dashboard'}
              </p>
              <span className="inline-block rounded-full bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#B45309] uppercase tracking-wide">
                {isSuperadmin ? 'Superadmin Panel' : 'Admin Panel'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label={totalPending > 0 ? `${totalPending} pending items` : 'Notifications'}
              title={totalPending > 0 ? `${totalPending} pending across your queues` : 'No pending items'}
            >
              <Bell className="h-4.5 w-4.5" />
              {totalPending > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#F8FAFC]">
                  {totalPending > 99 ? '99+' : totalPending}
                </span>
              )}
            </button>

            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[#0F172A] leading-none">{user.fullName}</p>
                  <p className="text-xs text-[#B45309] mt-0.5">{isSuperadmin ? 'Superadmin' : 'Administrator'}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-sm font-bold text-white shadow-sm">
                  {getInitials(user.fullName)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;