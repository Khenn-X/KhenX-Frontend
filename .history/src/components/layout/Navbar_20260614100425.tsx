import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Heart, LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn, getInitials } from '../../lib/utils';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  const getDashboardRoute = () => {
    if (user?.role === 'admin') return ROUTES.ADMIN_DASHBOARD;
    if (user?.role === 'agent') return ROUTES.AGENT_DASHBOARD;
    return ROUTES.DASHBOARD;
  };

  const navLinks = [
    { label: 'Listings', to: ROUTES.LISTINGS },
    { label: 'Neighbourhood', to: ROUTES.NEIGHBOURHOOD },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A1628] shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C9A7]">
              <MapPin className="h-4 w-4 text-[#0A1628]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight font-poppins">
              Khen<span className="text-[#00C9A7]">X</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[#00C9A7] bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop Auth Controls ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Saved listings shortcut */}
                <Link
                  to={ROUTES.SAVED}
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span>Saved</span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15 transition-colors"
                  >
                    {/* Avatar or initials */}
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00C9A7] text-[10px] font-bold text-[#0A1628]">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-slate-400 transition-transform',
                        profileOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate(getDashboardRoute()); setProfileOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </button>
                        {user.role === 'agent' && (
                          <button
                            onClick={() => { navigate(ROUTES.AGENT_PROFILE); setProfileOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoggingOut ? 'Logging out...' : 'Log out'}
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
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="rounded-lg bg-[#00C9A7] px-4 py-2 text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ──────────────────────────────────────── */}
          <button
            className="md:hidden text-slate-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A1628] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[#00C9A7] bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to={ROUTES.SAVED}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    Saved listings
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-center text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to={ROUTES.SIGNUP}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-[#00C9A7] px-4 py-2.5 text-center text-sm font-semibold text-[#0A1628] hover:bg-[#00b396] transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
