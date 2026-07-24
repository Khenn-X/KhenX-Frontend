import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useUIStore } from "../../store/ui.store";
import { useLogout } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { cn, getInitials } from "../../lib/utils";
import logo from "../../assets/lg-trans.png";

const agentNavItems = [
  { label: "Dashboard", to: ROUTES.AGENT_DASHBOARD, icon: LayoutDashboard },
  { label: "My Listings", to: ROUTES.AGENT_LISTINGS, icon: Building2 },
  { label: "Enquiries", to: ROUTES.AGENT_ENQUIRIES, icon: MessageSquare },
  { label: "KYC Verification", to: ROUTES.AGENT_KYC, icon: ShieldCheck },
  { label: "Profile", to: ROUTES.AGENT_PROFILE, icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = agentNavItems.find((item) => item.to === location.pathname);

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

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out",
          // Desktop: collapsible width. Mobile: slide in/out entirely.
          isSidebarOpen ? "w-60 translate-x-0" : "w-60 -translate-x-full lg:w-16 lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-slate-100 shrink-0 overflow-hidden",
            isSidebarOpen ? "px-4" : "justify-center px-0"
          )}
        >
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-2 min-w-0 shrink-0"
            aria-label="Go to homepage"
          >
            <img
              src={logo}
              alt="KhenX"
              className={cn(
                "shrink-0 object-contain transition-all duration-300",
                isSidebarOpen ? "h-18 w-auto object-left" : "h-8 w-8 object-cover object-left rounded-md"
              )}
            />
            {isSidebarOpen && (
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                Agent Portal
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
          {agentNavItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={!isSidebarOpen ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150",
                  isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                  isActive
                    ? "bg-[#00C9A7]/10 text-[#00A88C]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[#00C9A7]" />
                  )}
                  <span
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all",
                      isActive
                        ? "bg-[#00C9A7]/15 text-[#00A88C]"
                        : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout + Collapse */}
        <div className="shrink-0 border-t border-slate-100 p-3 space-y-1">
          {isSidebarOpen && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 mb-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00C9A7] to-[#00A88C] text-xs font-bold text-white shadow-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#0F172A] truncate leading-none">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            title={!isSidebarOpen ? "Log out" : undefined}
            className={cn(
              "flex w-full items-center rounded-xl text-sm font-medium transition-colors",
              isSidebarOpen ? "gap-3 px-3 py-2" : "justify-center p-2.5",
              "text-red-400/80 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0">
              <LogOut className="h-4 w-4" />
            </span>
            {isSidebarOpen && <span className="text-xs">{isLoggingOut ? "Logging out…" : "Log out"}</span>}
          </button>

          {/* Collapse toggle — desktop only, sidebar always full-width on mobile */}
          <button
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Collapse" : "Expand"}
            className={cn(
              "hidden lg:flex w-full items-center rounded-xl text-xs font-medium transition-colors",
              isSidebarOpen ? "gap-3 px-3 py-2" : "justify-center p-2.5",
              "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0">
              <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
            </span>
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main
        className={cn(
          "flex-1 min-w-0 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:ml-60" : "lg:ml-16"
        )}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-4 sm:px-6 bg-[#F8FAFC]/90 backdrop-blur-sm border-b border-slate-200/80 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title / breadcrumb */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {currentPage?.label ?? "Dashboard"}
              </p>
              <p className="text-[11px] text-slate-400 hidden sm:block">Agent Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />
            </button>

            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[#0F172A] leading-none">{user.fullName}</p>
                  <p className="text-xs text-slate-400 capitalize mt-0.5">{user.role} account</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00C9A7] to-[#00A88C] text-sm font-bold text-white shadow-sm">
                  {getInitials(user.fullName)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 sm:px-6 py-4">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;