import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  MapPin,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { useLogout } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn, getInitials } from '../../lib/utils';

const agentNavItems = [
  { label: 'Dashboard', to: ROUTES.AGENT_DASHBOARD, icon: LayoutDashboard },
  { label: 'My Listings', to: ROUTES.AGENT_LISTINGS, icon: Building2 },
  { label: 'Enquiries', to: ROUTES.AGENT_ENQUIRIES, icon: MessageSquare },
  { label: 'KYC Verification', to: ROUTES.AGENT_KYC, icon: ShieldCheck },
  { label: 'Profile', to: ROUTES.AGENT_PROFILE, icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0A1628] transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {isSidebarOpen && (
            <button onClick={() => navigate(ROUTES.HOME)} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C9A7]">
                <MapPin className="h-3.5 w-3.5 text-[#0A1628]" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-white">
                Khen<span className="text-[#00C9A7]">X</span>
              </span>
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

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {agentNavItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-[#00C9A7]/15 text-[#00C9A7]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5 mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00C9A7] text-xs font-bold text-[#0A1628]">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
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
            {isSidebarOpen && <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'ml-60' : 'ml-16'
        )}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-slate-200 px-6 shadow-sm">
          <div /> {/* Spacer */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F172A]">{user.fullName}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role} account</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1628] text-sm font-bold text-[#00C9A7]">
                {getInitials(user.fullName)}
              </div>
            </div>
          )}
        </div>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
