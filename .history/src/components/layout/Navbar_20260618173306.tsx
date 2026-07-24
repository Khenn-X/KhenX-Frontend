import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu, X, MapPin, Heart, LayoutDashboard, LogOut, User,
  ChevronDown, Search, Home, Building2, Zap, ShieldCheck,
  FileText, Users, BarChart3, AlertTriangle, ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn, getInitials } from '../../lib/utils';

// ─── Nav data ────────────────────────────────────────────────────────────────

const propertyLinks = [
  {
    label: 'Browse Listings',
    to: ROUTES.LISTINGS,
    icon: Home,
    desc: 'Search verified properties across Lagos',
  },
  {
    label: 'AI Property Search',
    to: `${ROUTES.LISTINGS}?ai=true`,
    icon: Search,
    desc: 'Describe what you need in plain English',
  },
  {
    label: 'Saved Properties',
    to: ROUTES.SAVED,
    icon: Heart,
    desc: 'Properties you have bookmarked',
    authRequired: true,
  },
];

const intelligenceLinks = [
  {
    label: 'Intelligence Hub',
    to: ROUTES.NEIGHBOURHOOD,
    icon: BarChart3,
    desc: 'Area scores across power, flood, security & commute',
  },
  {
    label: 'Explore an Area',
    to: `${ROUTES.NEIGHBOURHOOD}/yaba`,
    icon: MapPin,
    desc: 'Deep-dive into any Lagos neighbourhood',
  },
  {
    label: 'Data Methodology',
    to: `${ROUTES.NEIGHBOURHOOD}/methodology`,
    icon: FileText,
    desc: 'How our intelligence scores are calculated',
  },
  {
    label: 'Submit Area Data',
    to: `${ROUTES.NEIGHBOURHOOD}/submit`,
    icon: ClipboardList,
    desc: 'Share your neighbourhood experience',
  },
];

const agentLinks = [
  {
    label: 'Agent Dashboard',
    to: ROUTES.AGENT_DASHBOARD,
    icon: LayoutDashboard,
    desc: 'Your listings, enquiries and stats',
  },
  {
    label: 'My Listings',
    to: ROUTES.AGENT_LISTINGS,
    icon: Building2,
    desc: 'Manage all your property listings',
  },
  {
    label: 'KYC Verification',
    to: ROUTES.AGENT_KYC,
    icon: ShieldCheck,
    desc: 'Get your verified badge',
  },
  {
    label: 'Agent Profile',
    to: ROUTES.AGENT_PROFILE,
    icon: User,
    desc: 'Edit your public profile',
  },
];

const adminLinks = [
  {
    label: 'Admin Dashboard',
    to: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
    desc: 'Platform overview and stats',
  },
  {
    label: 'Manage Listings',
    to: ROUTES.ADMIN_LISTINGS,
    icon: Building2,
    desc: 'Approve, reject or feature listings',
  },
  {
    label: 'Manage Agents',
    to: ROUTES.ADMIN_AGENTS,
    icon: Users,
    desc: 'KYC review and agent management',
  },
  {
    label: 'Fraud Reports',
    to: ROUTES.ADMIN_FRAUD,
    icon: AlertTriangle,
    desc: 'Review and resolve fraud reports',
  },
];

// ─── Reusable dropdown panel ──────────────────────────────────────────────────

type DropdownItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  desc: string;
  authRequired?: boolean;
};

const DropdownPanel = ({
  items,
  isAuthenticated,
  onClose,
  badge,
}: {
  items: DropdownItem[];
  isAuthenticated: boolean;
  onClose: () => void;
  badge?: string;
}) => (
  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50">
    {badge && (
      <div className="px-4 py-2 bg-[#00C9A7]/8 border-b border-[#00C9A7]/20">
        <span className="text-[11px] font-semibold text-[#00C9A7] uppercase tracking-wider">
          {badge}
        </span>
      </div>
    )}
    <ul className="py-2">
      {items.map((item) => {
        if (item.authRequired && !isAuthenticated) return null;
        const Icon = item.icon;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onClose}
              className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-[#00C9A7]/15 transition-colors">
                <Icon className="h-4 w-4 text-slate-500 group-hover:text-[#00C9A7] transition-colors" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#0F172A] group-hover:text-[#0A1628]">
                  {item.label}
                </span>
                <span className="block text-xs text-slate-400 mt-0.5 leading-snug">
                  {item.desc}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);

// ─── Nav trigger button ───────────────────────────────────────────────────────

const NavTrigger = ({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors select-none',
      isOpen
        ? 'text-[#0A1628] bg-slate-100'
        : 'text-slate-600 hover:text-[#0A1628] hover:bg-slate-50'
    )}
  >
    {label}
    <ChevronDown
      className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
    />
  </button>
);

// ─── Mobile accordion section ─────────────────────────────────────────────────

const MobileSection = ({
  label,
  items,
  isAuthenticated,
  onClose,
}: {
  label: string;
  items: DropdownItem[];
  isAuthenticated: boolean;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0A1628]"
      >
        {label}
        <ChevronDown
          className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="pb-2">
          {items.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:text-[#0A1628] hover:bg-slate-50 transition-colors"
              >
                <Icon className="h-4 w-4 text-[#00C9A7] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleDropdown = (key: string) =>
    setActiveDropdown((prev) => (prev === key ? null : key));

  const closeAll = () => {
    setActiveDropdown(null);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    closeAll();
    logout();
  };

  const getDashboardRoute = () => {
    if (user?.role === 'admin') return ROUTES.ADMIN_DASHBOARD;
    if (user?.role === 'agent') return ROUTES.AGENT_DASHBOARD;
    return ROUTES.DASHBOARD;
  };

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to={ROUTES.HOME}
            onClick={closeAll}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A1628]">
              <MapPin className="h-4 w-4 text-[#00C9A7]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-[#0A1628] tracking-tight font-poppins">
              Khen<span className="text-[#00C9A7]">X</span>
            </span>
          </Link>

          {/* ── Desktop Nav ─────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">

            {/* Properties */}
            <div className="relative">
              <NavTrigger
                label="Properties"
                isOpen={activeDropdown === 'properties'}
                onClick={() => toggleDropdown('properties')}
              />
              {activeDropdown === 'properties' && (
                <DropdownPanel
                  items={propertyLinks}
                  isAuthenticated={isAuthenticated}
                  onClose={closeAll}
                  badge="Find a property"
                />
              )}
            </div>

            {/* Intelligence */}
            <div className="relative">
              <NavTrigger
                label="Intelligence"
                isOpen={activeDropdown === 'intelligence'}
                onClick={() => toggleDropdown('intelligence')}
              />
              {activeDropdown === 'intelligence' && (
                <DropdownPanel
                  items={intelligenceLinks}
                  isAuthenticated={isAuthenticated}
                  onClose={closeAll}
                  badge="Neighbourhood data"
                />
              )}
            </div>

            {/* Agent tools — only for agents */}
            {isAgent && (
              <div className="relative">
                <NavTrigger
                  label="My Listings"
                  isOpen={activeDropdown === 'agent'}
                  onClick={() => toggleDropdown('agent')}
                />
                {activeDropdown === 'agent' && (
                  <DropdownPanel
                    items={agentLinks}
                    isAuthenticated={isAuthenticated}
                    onClose={closeAll}
                    badge="Agent tools"
                  />
                )}
              </div>
            )}

            {/* Admin tools — only for admin */}
            {isAdmin && (
              <div className="relative">
                <NavTrigger
                  label="Admin"
                  isOpen={activeDropdown === 'admin'}
                  onClick={() => toggleDropdown('admin')}
                />
                {activeDropdown === 'admin' && (
                  <DropdownPanel
                    items={adminLinks}
                    isAuthenticated={isAuthenticated}
                    onClose={closeAll}
                    badge="Admin panel"
                  />
                )}
              </div>
            )}
          </nav>

          {/* ── Desktop Auth ────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* List property CTA — agents only */}
                {isAgent && (
                  <Link
                    to={ROUTES.AGENT_LISTINGS_NEW}
                    onClick={closeAll}
                    className="rounded-lg border border-[#00C9A7] px-4 py-1.5 text-sm font-semibold text-[#00C9A7] hover:bg-[#00C9A7]/8 transition-colors"
                  >
                    + List property
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setActiveDropdown(null); }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors',
                      profileOpen
                        ? 'border-[#00C9A7] bg-[#00C9A7]/5'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-[10px] font-bold text-[#00C9A7]">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[#0A1628] max-w-[90px] truncate">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', profileOpen && 'rotate-180')} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <p className="text-sm font-bold text-[#0A1628] truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-[#00C9A7]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C9A7]">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate(getDashboardRoute()); closeAll(); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0A1628] transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </button>
                        {isAgent && (
                          <button
                            onClick={() => { navigate(ROUTES.AGENT_PROFILE); closeAll(); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0A1628] transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Edit Profile
                          </button>
                        )}
                        <button
                          onClick={() => { navigate(ROUTES.SAVED); closeAll(); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0A1628] transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          Saved
                        </button>
                        <div className="mx-4 my-1 border-t border-slate-100" />
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoggingOut ? 'Logging out…' : 'Log out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-semibold text-slate-600 hover:text-[#0A1628] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="rounded-xl bg-[#0A1628] px-4 py-2 text-sm font-bold text-white hover:bg-[#0A1628]/85 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ────────────────────────────────────────── */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0A1628] hover:bg-slate-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 max-h-[80vh] overflow-y-auto">

          {/* User info strip (authenticated) */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1628] text-xs font-bold text-[#00C9A7]">
                  {getInitials(user.fullName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0A1628] truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className="ml-auto rounded-full bg-[#00C9A7]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C9A7] shrink-0">
                {user.role}
              </span>
            </div>
          )}

          {/* Accordion nav sections */}
          <MobileSection label="Properties" items={propertyLinks} isAuthenticated={isAuthenticated} onClose={closeAll} />
          <MobileSection label="Intelligence" items={intelligenceLinks} isAuthenticated={isAuthenticated} onClose={closeAll} />
          {isAgent && (
            <MobileSection label="My Listings" items={agentLinks} isAuthenticated={isAuthenticated} onClose={closeAll} />
          )}
          {isAdmin && (
            <MobileSection label="Admin" items={adminLinks} isAuthenticated={isAuthenticated} onClose={closeAll} />
          )}

          {/* Bottom auth actions */}
          <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                {isAgent && (
                  <Link
                    to={ROUTES.AGENT_LISTINGS_NEW}
                    onClick={closeAll}
                    className="w-full rounded-xl border border-[#00C9A7] py-2.5 text-center text-sm font-bold text-[#00C9A7] hover:bg-[#00C9A7]/8 transition-colors"
                  >
                    + List a property
                  </Link>
                )}
                <Link
                  to={getDashboardRoute()}
                  onClick={closeAll}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-[#0A1628] hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#00C9A7]" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.SIGNUP}
                  onClick={closeAll}
                  className="w-full rounded-xl bg-[#0A1628] py-2.5 text-center text-sm font-bold text-white hover:bg-[#0A1628]/85 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={closeAll}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar; 