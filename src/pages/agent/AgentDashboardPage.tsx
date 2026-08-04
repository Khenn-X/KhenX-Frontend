import { Link } from "react-router-dom";
import { Plus, ArrowRight, Home, Eye, MessageSquare } from "lucide-react";
import { useAgentDashboard } from "../../hooks/useAgent";
import { useListingUsage } from "../../hooks/useListings";
import { useKYCStatus } from "../../hooks/useKYC";
import DashboardStats from "../../components/agent/DashboardStats";
import StatCardWithBadge from "../../components/dashboard/StatCardWithBadge";
import HeroPromoCard from "../../components/dashboard/HeroPromoCard";
import BarChartCard from "../../components/dashboard/BarChartCard";
import AreaChartCard from "../../components/dashboard/AreaChartCard";
import ActiveUsersStrip from "../../components/dashboard/ActiveUsersStrip";
import ProjectsTable from "../../components/dashboard/ProjectsTable";
import ActivityTimelineCard from "../../components/dashboard/ActivityTimelineCard";
import KYCStatusBanner from "../../components/agent/KYCStatusBanner";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import { ROUTES } from "../../constants/routes";

const AgentDashboardPage = () => {
  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
    error: dashErr,
    refetch,
  } = useAgentDashboard();
  const { data: kycData } = useKYCStatus();

  const stats = dashData?.data;
  const kycStatus = kycData?.data?.kycStatus ?? "not_submitted";
  const kycRejectionReason = kycData?.data?.kycRejectionReason;
  const { data: usageData, isLoading: usageLoading, isError: usageError } = useListingUsage();

  const usage = usageData?.data?.usage;
  const isUnlimited = usage?.isUnlimited;
  const usageLabel = isUnlimited
    ? "Unlimited"
    : usage
      ? `${usage.used}/${usage.quotaLimit}`
      : undefined;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002948]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Your KhenX agent overview</p>
        </div>
        {kycStatus === "approved" && (
          <Link
            to={ROUTES.AGENT_LISTINGS_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-[#006A61] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00554e] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New listing
          </Link>
        )}
      </div>

      {/* ── Top stat cards (reference style, real numbers when loaded) ── */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCardWithBadge
            icon={Home}
            label="Total listings"
            value={Object.values(stats.listings ?? {}).reduce((a: number, b: any) => a + (b ?? 0), 0)}
            change={5}
            iconBg="bg-[#002948]"
          />
          <StatCardWithBadge
            icon={Eye}
            label="Total views"
            value={stats.totalViews ?? 0}
            change={12}
            iconBg="bg-[#006A61]"
          />
          <StatCardWithBadge
            icon={MessageSquare}
            label="Total enquiries"
            value={stats.totalEnquiries ?? 0}
            change={-2}
            iconBg="bg-[#D97706]"
          />
        </div>
      )}

      {/* ── Hero promo cards ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HeroPromoCard
          eyebrow="Built for agents"
          title="KhenX Agent Portal"
          description="Manage listings, track enquiries, and grow your reach — all from one dashboard."
          variant="light"
        />
        <HeroPromoCard
          eyebrow="Level up"
          title="Go Pro"
          description="Unlock unlimited listings, priority placement, and advanced insights."
          variant="dark"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard />
        <AreaChartCard />
      </div>

      {/* ── Active users strip ── */}
      <ActiveUsersStrip />

      {/* ── Projects + Activity ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectsTable />
        </div>
        <ActivityTimelineCard />
      </div>

      {/* ── KYC banner (existing, kept) ── */}
      <KYCStatusBanner status={kycStatus} rejectionReason={kycRejectionReason} />

      {/* ── Existing detailed stats + usage (kept) ── */}
      {dashLoading ? (
        <LoadingSpinner />
      ) : dashError ? (
        <ErrorMessage message={dashErr?.message} onRetry={refetch} />
      ) : stats ? (
        <>
          <DashboardStats
            listings={{ ...stats.listings, rejected: stats.listings?.rejected ?? 0 }}
            totalEnquiries={stats.totalEnquiries}
            totalViews={stats.totalViews}
          />
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#002948]">Listing plan usage</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plan</p>
                <p className="mt-1 text-lg font-semibold text-[#002948]">{usage?.listingPlan ?? "Free"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quota</p>
                <p className="mt-1 text-lg font-semibold text-[#002948]">
                  {usageLabel ?? (usageLoading ? "Loading..." : "Unknown")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expires</p>
                <p className="mt-1 text-lg font-semibold text-[#002948]">
                  {usage?.listingPlanExpiresAt
                    ? new Date(usage.listingPlanExpiresAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            {usageError && <p className="mt-3 text-sm text-red-600">Unable to load listing usage.</p>}
          </div>
        </>
      ) : null}

      {/* ── Quick links (existing, kept) ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: "Manage listings", description: "Edit, pause or delete your listings", href: ROUTES.AGENT_LISTINGS },
          { label: "View enquiries", description: "See messages from seekers", href: ROUTES.AGENT_ENQUIRIES },
          { label: "KYC status", description: "Check your verification status", href: ROUTES.AGENT_KYC },
          { label: "Edit profile", description: "Update your business details", href: ROUTES.AGENT_PROFILE },
        ].map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:shadow-sm transition-shadow"
          >
            <div>
              <p className="font-semibold text-[#002948] text-sm">{link.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{link.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboardPage;