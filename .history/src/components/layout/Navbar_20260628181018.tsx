import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import {
  Menu,
  X,
  MapPin,
  Heart,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Home,
  Building2,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  Zap,
  Navigation,
  BookOpen,
  TrendingUp,
  Map,
  Newspaper,
  Scale,
  Clock,
  BadgeCheck,
  Star,
  PlusCircle,
  Info,
  Lightbulb,
  MessageCircle,
  Award,
  Handshake,
  HelpCircle,
  Building,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  desc: string;
  badge?: "new" | "soon" | "verified";
  authRequired?: boolean;
  roleRequired?: "agent" | "admin";
};

type NavGroup = {
  key: string;
  label: string;
  items: NavItem[];
};

// ─── Utility ──────────────────────────────────────────────────────────────────

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Returns true if a path segment matches the current location
const useIsActive = (paths: string[]) => {
  const { pathname } = useLocation();
  return paths.some((p) => {
    // exact match for root-level paths, prefix match otherwise
    if (p === "/") return pathname === "/";
    return pathname === p || pathname.startsWith(p + "/");
  });
};

// ─── Nav structure — 5 focused groups ────────────────────────────────────────
//
//  Explore    → search / discover properties & areas
//  Transact   → buy, rent, short-let, list
//  Agents     → find / become / manage
//  Resources  → insights, services, blog
//  Company    → about, how it works, fraud, contact

const NAV_GROUPS: NavGroup[] = [
  {
    key: "explore",
    label: "Explore",
    items: [
      {
        label: "All Listings",
        to: "/listings",
        icon: BadgeCheck,
        desc: "Browse KYC-verified properties across Lagos",
        badge: "verified",
      },
      {
        label: "New Projects",
        to: "/listings?tag=new",
        icon: Star,
        desc: "Freshly listed and featured properties",
        badge: "new",
      },
      {
        label: "Neighbourhood Hub",
        // to: "/intelligence",
        
        icon: BarChart3,
        desc: "Area scores, power, flood and safety data",
      },
      {
        label: "Explore an Area",
        to: "/intelligence/explore",
        icon: Map,
        desc: "Deep-dive intelligence for any Lagos area",
      },
      {
        label: "Saved Properties",
        to: "/seeker/saved",
        icon: Heart,
        desc: "Properties you have bookmarked",
        authRequired: true,
      },
    ],
  },
  {
    key: "transact",
    label: "Buy / Rent / Sell",
    items: [
      {
        label: "Buy a Property",
        to: "/listings?type=sale",
        icon: Home,
        desc: "Properties available for outright purchase",
      },
      {
        label: "Rent a Property",
        to: "/listings?type=rent",
        icon: Building2,
        desc: "Annual and monthly rental listings",
      },
      {
        label: "Short-let / Airbnb",
        to: "/listings?type=short-let",
        icon: Clock,
        desc: "Nightly and weekly furnished apartments",
      },
      {
        label: "List Your Property",
        to: "/agent/listings/new",
        icon: PlusCircle,
        desc: "Verified agents: submit a new listing",
        authRequired: true,
        roleRequired: "agent",
      },
    ],
  },
  {
    key: "agents",
    label: "Agents",
    items: [
      {
        label: "Find a Verified Agent",
        to: "/agents",
        icon: Users,
        desc: "Browse KYC-verified Lagos estate agents",
      },
      {
        label: "Become a Verified Agent",
        to: "/agent/onboarding",
        icon: Award,
        desc: "Get your badge and start listing today",
      },
      {
        label: "Agent Dashboard",
        to: "/agent/dashboard",
        icon: LayoutDashboard,
        desc: "Manage listings, enquiries and stats",
        authRequired: true,
        roleRequired: "agent",
      },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    items: [
      {
        label: "Power & Flood Scores",
        to: "/intelligence?filter=power-flood",
        icon: Zap,
        desc: "NEPA reliability and flood risk by area",
      },
      {
        label: "Property Valuation",
        to: "/services/valuation",
        icon: TrendingUp,
        desc: "Get an estimated market value",
        badge: "soon",
      },
      {
        label: "Legal & Documentation",
        to: "/services/legal",
        icon: Scale,
        desc: "Contracts, C of O, and due diligence",
        badge: "soon",
      },
      {
        label: "Blog & Area Guides",
        to: "/blog",
        icon: BookOpen,
        desc: "News, tips and Lagos area guides",
        badge: "soon",
      },
      {
        label: "Submit Area Data",
        to: "/intelligence/submit",
        icon: ClipboardList,
        desc: "Share your experience of a neighbourhood",
      },
    ],
  },
  {
    key: "company",
    label: "Company",
    items: [
      {
        label: "About KhenX",
        to: "/about",
        icon: Info,
        desc: "Our mission, story, and the team behind KhenX",
      },
      {
        label: "How It Works",
        to: "/how-it-works",
        icon: Lightbulb,
        desc: "How KhenX connects seekers, agents and data",
      },
      {
        label: "Agent Verification (KYC)",
        to: "/how-it-works/kyc",
        icon: ShieldCheck,
        desc: "How we vet agents before they list",
      },
      {
        label: "FAQs",
        to: "/how-it-works/faqs",
        icon: HelpCircle,
        desc: "Common questions from seekers and agents",
      },
      {
        label: "Report Fraud",
        to: "/fraud",
        icon: AlertTriangle,
        desc: "Flag a suspicious listing or agent",
      },
    ],
  },
];

// ─── Badge chip ───────────────────────────────────────────────────────────────

const BadgeChip = ({ type }: { type: "new" | "soon" | "verified" }) => {
  const styles = {
    new: "bg-emerald-50 text-emerald-600",
    soon: "bg-amber-50 text-amber-600",
    verified: "bg-[#00C9A7]/10 text-[#00C9A7]",
  };
  const labels = { new: "New", soon: "Soon", verified: "✓ Verified" };
  return (
    <span
      className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
};

// ─── Desktop dropdown ─────────────────────────────────────────────────────────

const DesktopDropdown = ({
  group,
  userRole,
  isAuthenticated,
  onClose,
}: {
  group: NavGroup;
  userRole?: string;
  isAuthenticated: boolean;
  onClose: () => void;
}) => {
  const { pathname } = useLocation();

  const visibleItems = group.items.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.roleRequired && userRole !== item.roleRequired) return false;
    return true;
  });

  const useTwoCol = visibleItems.length >= 5;
  const col1 = useTwoCol
    ? visibleItems.slice(0, Math.ceil(visibleItems.length / 2))
    : visibleItems;
  const col2 = useTwoCol
    ? visibleItems.slice(Math.ceil(visibleItems.length / 2))
    : [];

  const isItemActive = (to: string) => {
    const path = to.split("?")[0];
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <div
      className={`absolute left-0 top-full mt-2 rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50 ${
        useTwoCol ? "w-[540px]" : "w-[280px]"
      }`}
    >
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {group.label}
        </span>
      </div>

      <div className={`p-2 ${useTwoCol ? "grid grid-cols-2 gap-x-1" : ""}`}>
        {[col1, ...(useTwoCol ? [col2] : [])].map((col, ci) => (
          <ul key={ci}>
            {col.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      active
                        ? "bg-[#00C9A7]/8"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active
                          ? "bg-[#00C9A7]/15"
                          : "bg-slate-100 group-hover:bg-[#00C9A7]/12",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          active
                            ? "text-[#00C9A7]"
                            : "text-slate-400 group-hover:text-[#00C9A7]",
                        )}
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "block text-sm font-semibold truncate",
                            active ? "text-[#00C9A7]" : "text-[#0F172A]",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.badge && <BadgeChip type={item.badge} />}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {item.desc}
                      </span>
                    </span>
                    {active && (
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C9A7]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
};

// ─── Mobile accordion section ─────────────────────────────────────────────────

const MobileSection = ({
  group,
  userRole,
  isAuthenticated,
  onClose,
}: {
  group: NavGroup;
  userRole?: string;
  isAuthenticated: boolean;
  onClose: () => void;
}) => {
  const { pathname } = useLocation();

  const visibleItems = group.items.filter((item) => {
    if (item.authRequired && !isAuthenticated) return false;
    if (item.roleRequired && userRole !== item.roleRequired) return false;
    return true;
  });

  // Auto-open if any child is active
  const hasActiveChild = visibleItems.some((item) => {
    const path = item.to.split("?")[0];
    return pathname === path || pathname.startsWith(path + "/");
  });

  const [open, setOpen] = useState(hasActiveChild);

  const isItemActive = (to: string) => {
    const path = to.split("?")[0];
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3.5 transition-colors",
          hasActiveChild ? "bg-[#00C9A7]/5" : "hover:bg-slate-50",
        )}
      >
        <span
          className={cn(
            "text-sm font-bold",
            hasActiveChild ? "text-[#00C9A7]" : "text-[#0A1628]",
          )}
        >
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open ? "rotate-180" : "",
            hasActiveChild ? "text-[#00C9A7]" : "text-slate-400",
          )}
        />
      </button>

      {open && (
        <div className="pb-2 bg-slate-50/60">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[#00C9A7]/8 text-[#00C9A7] font-semibold"
                    : "text-slate-600 hover:text-[#0A1628] hover:bg-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-[#00C9A7]" : "text-[#00C9A7]/60",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && <BadgeChip type={item.badge} />}
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7]" />
                )}
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
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
    if (user?.role === "superadmin") return ROUTES.SUPERADMIN_ADMIN_REQUESTS;
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "agent") return "/agent/dashboard";
    return "/dashboard";
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isAgent = user?.role === "agent";

  const adminNavGroup: NavGroup = {
    key: "admin",
    label: "Admin",
    items: [
      {
        label: "Admin Dashboard",
        to: "/admin/dashboard",
        icon: LayoutDashboard,
        desc: "Platform overview and key stats",
      },
      {
        label: "Manage Listings",
        to: "/admin/listings",
        icon: Building2,
        desc: "Approve, reject or feature listings",
      },
      {
        label: "Manage Agents",
        to: "/admin/agents",
        icon: Users,
        desc: "KYC review and suspensions",
      },
      {
        label: "Fraud Reports",
        to: "/admin/fraud",
        icon: AlertTriangle,
        desc: "Review and resolve fraud reports",
      },
    ],
  };

  const desktopGroups = isAdmin ? [...NAV_GROUPS, adminNavGroup] : NAV_GROUPS;
  const mobileGroups = isAdmin ? [...NAV_GROUPS, adminNavGroup] : NAV_GROUPS;

  // Check if a group has any active child (for desktop button highlight)
  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => {
      const path = item.to.split("?")[0];
      return pathname === path || pathname.startsWith(path + "/");
    });

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            to="/"
            onClick={closeAll}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A1628]">
              <MapPin className="h-4 w-4 text-[#00C9A7]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-[#0A1628] tracking-tight">
              Khen<span className="text-[#00C9A7]">X</span>
            </span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {desktopGroups.map((group) => {
              const groupActive = isGroupActive(group);
              const dropdownOpen = activeDropdown === group.key;

              return (
                <div key={group.key} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(dropdownOpen ? null : group.key)
                    }
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors select-none whitespace-nowrap relative",
                      dropdownOpen
                        ? "text-[#0A1628] bg-slate-100"
                        : groupActive
                          ? "text-[#00C9A7]"
                          : "text-slate-500 hover:text-[#0A1628] hover:bg-slate-50",
                    )}
                  >
                    {group.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        dropdownOpen
                          ? "text-slate-600 rotate-180"
                          : groupActive
                            ? "text-[#00C9A7]"
                            : "text-slate-400",
                      )}
                    />
                    {/* Active underline indicator */}
                    {groupActive && !dropdownOpen && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#00C9A7]" />
                    )}
                  </button>

                  {dropdownOpen && (
                    <DesktopDropdown
                      group={group}
                      userRole={user?.role}
                      isAuthenticated={isAuthenticated}
                      onClose={closeAll}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Desktop Auth ─────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <>
                {isAgent && (
                  <Link
                    to="/agent/listings/new"
                    onClick={closeAll}
                    className="rounded-xl border border-[#00C9A7] px-3 py-1.5 text-sm font-bold text-[#00C9A7] hover:bg-[#00C9A7]/8 transition-colors whitespace-nowrap"
                  >
                    + List property
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setActiveDropdown(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors",
                      profileOpen
                        ? "border-[#00C9A7] bg-[#00C9A7]/5"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1628] text-[10px] font-bold text-[#00C9A7]">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <span className="text-sm font-bold text-[#0A1628] max-w-[80px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                        profileOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-sm font-bold text-[#0A1628] truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {user.email}
                        </p>
                        <span className="mt-1.5 inline-block rounded-full bg-[#00C9A7]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C9A7]">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate(getDashboardRoute());
                            closeAll();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            pathname.startsWith("/admin/dashboard") ||
                              pathname.startsWith("/agent/dashboard") ||
                              pathname === "/dashboard"
                              ? "text-[#00C9A7] bg-[#00C9A7]/5 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]",
                          )}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </button>
                        {isAgent && (
                          <button
                            onClick={() => {
                              navigate("/agent/profile");
                              closeAll();
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                              pathname === "/agent/profile"
                                ? "text-[#00C9A7] bg-[#00C9A7]/5 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]",
                            )}
                          >
                            <User className="h-4 w-4" />
                            Edit Profile
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigate("/seeker/saved");
                            closeAll();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            pathname === "/seeker/saved"
                              ? "text-[#00C9A7] bg-[#00C9A7]/5 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-[#0A1628]",
                          )}
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
                          {isLoggingOut ? "Logging out…" : "Log out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    "text-sm font-semibold transition-colors px-2",
                    pathname === "/login"
                      ? "text-[#00C9A7]"
                      : "text-slate-600 hover:text-[#0A1628]",
                  )}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-[#0A1628] px-4 py-2 text-sm font-bold text-white hover:bg-[#0A1628]/85 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────── */}
          <button
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 max-h-[85vh] overflow-y-auto">
          {/* Authenticated user strip */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1628] text-xs font-bold text-[#00C9A7]">
                  {getInitials(user.fullName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0A1628] truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className="rounded-full bg-[#00C9A7]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C9A7] shrink-0">
                {user.role}
              </span>
            </div>
          )}

          {/* Accordion nav groups */}
          {mobileGroups.map((group) => (
            <MobileSection
              key={group.key}
              group={group}
              userRole={user?.role}
              isAuthenticated={isAuthenticated}
              onClose={closeAll}
            />
          ))}

          {/* Bottom actions */}
          <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                {isAgent && (
                  <Link
                    to="/agent/listings/new"
                    onClick={closeAll}
                    className="w-full rounded-xl border border-[#00C9A7] py-2.5 text-center text-sm font-bold text-[#00C9A7] hover:bg-[#00C9A7]/8 transition-colors"
                  >
                    + List a property
                  </Link>
                )}
                <Link
                  to={getDashboardRoute()}
                  onClick={closeAll}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    pathname.startsWith("/admin/dashboard") ||
                      pathname.startsWith("/agent/dashboard") ||
                      pathname === "/dashboard"
                      ? "border-[#00C9A7] bg-[#00C9A7]/8 text-[#00C9A7]"
                      : "bg-slate-50 border-slate-100 text-[#0A1628] hover:bg-slate-100",
                  )}
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
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  onClick={closeAll}
                  className="w-full rounded-xl bg-[#0A1628] py-2.5 text-center text-sm font-bold text-white hover:bg-[#0A1628]/85 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  onClick={closeAll}
                  className={cn(
                    "w-full rounded-xl border py-2.5 text-center text-sm font-semibold transition-colors",
                    pathname === "/login"
                      ? "border-[#00C9A7] text-[#00C9A7] bg-[#00C9A7]/5"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
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