import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useListing } from "../../hooks/useListings";
import { useNeighbourhood } from "../../hooks/useNeighbourhood";
import { useListings } from "../../hooks/useListings";
import { useAuth } from "../../hooks/useAuth";
import { enquiriesApi } from "../../api/enquiries.api";
import PageWrapper from "../../components/layout/PageWrapper";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import type { IListing, ListingType } from "../../types/listing.types";
import type { INeighbourhoodIntelligence } from "../../types/neighbourhood.types";
import LandDetailsDisplay from "../../components/listings/LandDetailsDisplay";
import BuildingDetailsDisplay from "../../components/listings/BuildingDetailsDisplay";
import PropertyGallery from "../../components/listings/PropertyGallery";
import PropertyMap from "../../components/listings/PropertyMap";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price: number) => "₦" + price.toLocaleString("en-NG");

const formatPricePeriod = (period: string) => {
  if (period === "yearly") return "/ yr";
  if (period === "monthly") return "/ mo";
  if (period === "nightly") return "/ night";
  return "";
};

const listingTypeBadge = (type: ListingType) => {
  if (type === "sale")
    return {
      label: "FOR SALE",
      bg: "#EFF6FF",
      borderColor: "#BFDBFE",
      color: "#1D4ED8",
    };
  if (type === "rent")
    return {
      label: "FOR RENT",
      bg: "#F0FDF4",
      borderColor: "#BBF7D0",
      color: "#15803D",
    };
  return {
    label: "SHORT LET",
    bg: "#FFFBEB",
    borderColor: "#FDE68A",
    color: "#B45309",
  };
};

const scoreColor = (score?: number) => {
  if (!score) return "#94A3B8";
  if (score >= 8) return "#00C9A7";
  if (score >= 6) return "#F59E0B";
  return "#EF4444";
};
const scoreBg = (score?: number) => {
  if (!score) return "#F8FAFC";
  if (score >= 8) return "#F0FDF9";
  if (score >= 6) return "#FFFBEB";
  return "#FEF2F2";
};
const floodRiskColor = (risk?: string) => {
  if (risk === "low") return "#00C9A7";
  if (risk === "medium") return "#F59E0B";
  return "#EF4444";
};
const powerScoreToHours = (score?: number) => {
  if (!score) return null;
  return ((score / 10) * 24).toFixed(1);
};
const buildPowerBars = (score?: number): number[] => {
  if (!score) return Array(14).fill(12);
  const base = (score / 10) * 24;
  const variance = [0, 1, -1, 2, 0, -1, 1, 0, 2, -1, 0, 1, 0, 0];
  return variance.map((v) => Math.max(4, Math.min(24, base + v)));
};
const formatLastUpdated = (dateStr?: string) => {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  const now = new Date();
  const diffHrs = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24)
    return `Today, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const formatLandCondition = (condition?: string) => {
  if (!condition) return "Land";
  const labels: Record<string, string> = {
    dry_land: "Dry Land",
    swampy_land: "Swampy Land",
    sand_filled: "Sand-filled",
    reclaimed_land: "Reclaimed Land",
    rocky_land: "Rocky Land",
  };
  return labels[condition] ?? condition;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = ({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  sw = 1.5,
}: {
  d: string;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const BedIcon = () => (
  <Icon
    size={15}
    d="M3 12h18M3 12V8a2 2 0 012-2h14a2 2 0 012 2v4M3 12v4h18v-4"
  />
);
const BathIcon = () => (
  <Icon size={15} d="M4 12h16M4 12a8 8 0 0116 0M9 21v-3a3 3 0 016 0v3" />
);
const CarIcon = () => (
  <Icon
    size={15}
    d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v1M13 17h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
  />
);
const AreaIcon = () => (
  <Icon
    size={15}
    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
  />
);
const PinIcon = () => (
  <Icon
    size={13}
    fill="currentColor"
    stroke="none"
    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
  />
);
const BoltIcon = ({ color }: { color: string }) => (
  <Icon
    size={18}
    fill={color}
    stroke="none"
    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
  />
);
const DropIcon = ({ color }: { color: string }) => (
  <Icon
    size={18}
    fill={color}
    stroke="none"
    d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
  />
);
const ShieldIcon = ({ color }: { color: string }) => (
  <Icon
    size={18}
    fill={color}
    stroke="none"
    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  />
);
const TrainIcon = ({ color }: { color: string }) => (
  <Icon
    size={18}
    fill={color}
    stroke="none"
    d="M12 2c-4 0-6 2-6 5v8a4 4 0 008 0V7c0-3-2-5-6-5zm0 10a1 1 0 110-2 1 1 0 010 2z"
  />
);
const SparkleIcon = () => (
  <Icon
    size={18}
    fill="#00C9A7"
    stroke="none"
    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  />
);
const LockIcon = () => (
  <Icon
    size={12}
    d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM17 11V7a5 5 0 00-10 0v4"
  />
);
const CheckShieldIcon = () => (
  <Icon
    size={20}
    stroke="#00C9A7"
    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  />
);
const PhoneIcon = () => (
  <Icon
    size={14}
    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
  />
);
const MailIcon = () => (
  <Icon
    size={14}
    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 7L4 6h16l-8 5z"
  />
);
const ChevronLeft = () => <Icon size={17} d="M15 18l-6-6 6-6" />;
const ChevronRight = () => <Icon size={17} d="M9 18l6-6-6-6" />;
const InfoIcon = () => (
  <Icon size={13} d="M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
);

const inputSt: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 13,
  color: "#0F172A",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  transition: "border-color 0.15s",
};

const FEATURE_LABELS: Record<string, string> = {
  generator: "Generator",
  borehole: "Borehole",
  security: "Security",
  parking: "Parking",
  gym: "Gym",
  pool: "Swimming Pool",
  cctv: "CCTV",
  internet: "Internet",
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "intelligence", label: "Intelligence" },
  { id: "location", label: "Location" },
  { id: "similar", label: "Similar" },
] as const;

// ─── Reveal wrapper — subtle, one-time scroll reveal ─────────────────────────
const Reveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// ─── Similar listing card ─────────────────────────────────────────────────────
const SimilarCard = ({
  listing,
  intel,
}: {
  listing: IListing;
  intel?: { overallScore?: number };
}) => {
  const score = intel?.overallScore;
  const scoreLabel = score ? score.toFixed(1) : null;
  const sColor = score
    ? score >= 8
      ? "#00C9A7"
      : score >= 6
        ? "#F59E0B"
        : "#F97316"
    : "#64748B";

  return (
    <Link
      to={`/listings/${listing._id}`}
      style={{ textDecoration: "none", scrollSnapAlign: "start" }}
      className="khenx-similar-card"
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.2s",
          width: 260,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.09)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "none";
        }}
      >
        <div style={{ position: "relative", height: 148 }}>
          {listing.photos[0] ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#CBD5E1",
                fontSize: 12,
              }}
            >
              No photo
            </div>
          )}
          {scoreLabel && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: sColor,
                color: "#fff",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.2px",
              }}
            >
              {scoreLabel} / 10
            </span>
          )}
        </div>
        <div style={{ padding: "14px 15px 16px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            {listing.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#94A3B8",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <PinIcon /> {listing.areaName}, Lagos
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.3px",
              }}
            >
              {formatPrice(listing.price)}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#64748B",
                background: "#F8FAFC",
                padding: "3px 8px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <BedIcon /> {listing.bedrooms} bed
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Score metric cell ────────────────────────────────────────────────────────
const ScoreCell = ({
  label,
  icon,
  value,
  unit,
  colorValue,
  isLast,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | number | null;
  unit?: string;
  colorValue?: string;
  isLast?: boolean;
}) => (
  <div
    className="khenx-score-cell"
    style={{
      padding: "22px 20px",
      borderRight: isLast ? "none" : "1px solid #F1F5F9",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <span
      style={{
        fontSize: 10,
        color: "#94A3B8",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
      }}
    >
      {label}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: colorValue ? colorValue + "18" : "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {value != null ? (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: colorValue ?? "#0F172A",
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </div>
      ) : (
        <span style={{ fontSize: 14, color: "#CBD5E1", fontWeight: 600 }}>
          —
        </span>
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ListingDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [visitors, setVisitors] = useState(1);
  const [timeSlot, setTimeSlot] = useState("Morning (09-12)");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [contactName, setContactName] = useState(user?.fullName ?? "");

  const heroRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleBookInspection = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { message: "Please sign in to request an inspection." },
      });
      return;
    }
    if (!id || !date || !contactName) {
      setErrorMessage("Please choose a preferred date and share your name.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await enquiriesApi.submitInspectionRequest({
        listingId: id,
        preferredDate: date,
        timeSlot,
        visitors,
        contactName,
        message: `Inspection request for ${contactName}`,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      setDate("");
      setVisitors(1);
      setContactName("");
      setTimeSlot("Morning (09-12)");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "We could not send your inspection request right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: listingData, isLoading, isError, refetch } = useListing(id);
  const listing = listingData?.data.listing;

  const { data: neighbourhoodData } = useNeighbourhood(listing?.areaName ?? "");
  const intel: INeighbourhoodIntelligence | undefined =
    (
      neighbourhoodData as
        | {
            data?: {
              intelligence?: INeighbourhoodIntelligence;
              area?: INeighbourhoodIntelligence;
            };
          }
        | undefined
    )?.data?.intelligence ??
    (
      neighbourhoodData as
        | {
            data?: {
              intelligence?: INeighbourhoodIntelligence;
              area?: INeighbourhoodIntelligence;
            };
          }
        | undefined
    )?.data?.area ??
    undefined;

  const { data: similarData } = useListings({
    area: listing?.areaName,
    listingType: listing?.listingType,
    limit: 4,
  });
  const similarListings: IListing[] = (
    Array.isArray(similarData?.data)
      ? similarData!.data
      : Array.isArray(
            (similarData?.data as { listings?: IListing[] } | undefined)
              ?.listings,
          )
        ? (similarData!.data as { listings: IListing[] }).listings
        : []
  )
    .filter((l: IListing) => l._id !== id)
    .slice(0, 3);

  // Sticky bar visibility — appears once the hero has scrolled out of view
  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [listing]);

  // Active in-page nav section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, [listing]);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollCarousel = (dir: 1 | -1) => {
    carouselRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <PageWrapper className="flex min-h-[60vh] items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading listing..." />
      </PageWrapper>
    );
  }
  if (isError || !listing) {
    return (
      <PageWrapper className="py-20">
        <ErrorMessage
          message="This listing could not be found or may have been removed."
          onRetry={refetch}
        />
      </PageWrapper>
    );
  }

  const badge = listingTypeBadge(listing.listingType);
  const powerHrs = powerScoreToHours(intel?.powerScore ?? undefined);
  const powerBars = buildPowerBars(intel?.powerScore ?? undefined);
  const psColor = scoreColor(intel?.powerScore ?? undefined);
  const ssColor = scoreColor(intel?.securityScore ?? undefined);
  const frColor = floodRiskColor(intel?.floodRisk ?? undefined);
  const csColor = scoreColor(intel?.commuteScore ?? undefined);

  const activeFeatures = Object.entries(listing.features)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURE_LABELS[k] ?? k);

  const isLandListing = listing.propertyCategory === "land";
  const landStats = [
    {
      icon: <AreaIcon />,
      label: listing.landDetails?.plotSizeSqm
        ? `${listing.landDetails.plotSizeSqm.toLocaleString()} sqm`
        : "Land",
      sub: "Plot Size",
    },
    ...(listing.landDetails?.landCondition
      ? [
          {
            icon: <AreaIcon />,
            label: formatLandCondition(listing.landDetails.landCondition),
            sub: "Condition",
          },
        ]
      : []),
    { icon: <AreaIcon />, label: listing.propertyType, sub: "Property Type" },
  ];

  const ownerProfile = (
    listing.agentId ? listing.agentId : listing.landlordId
  ) as
    | {
        _id?: string;
        userId?:
          | {
              fullName?: string;
              avatarUrl?: string;
              email?: string;
              createdAt?: string;
            }
          | string
          | null;
        businessName?: string;
        phone?: string;
        kycStatus?: string;
        verifiedAt?: string;
      }
    | undefined;
  const ownerUser =
    ownerProfile?.userId && typeof ownerProfile.userId !== "string"
      ? ownerProfile.userId
      : undefined;
  const ownerName =
    ownerUser?.fullName?.trim() ||
    ownerProfile?.businessName?.trim() ||
    "Listing owner";
  const ownerAvatar = ownerUser?.avatarUrl?.trim();
  const ownerEmail = ownerUser?.email?.trim() || "";
  const ownerPhone = ownerProfile?.phone?.trim() || "";
  const ownerKycStatus = ownerProfile?.kycStatus;
  const ownerBadgeLabel =
    ownerKycStatus === "approved"
      ? "Verified KhenX Advisor"
      : listing.agentId
        ? "Property contact"
        : "Listing owner";
  const ownerRoleLabel = listing.agentId ? "Agent" : "Landlord";
  const memberSinceYear = ownerProfile?.verifiedAt
    ? new Date(ownerProfile.verifiedAt).getFullYear()
    : ownerUser?.createdAt
      ? new Date(ownerUser.createdAt).getFullYear()
      : null;
  const initials =
    ownerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "O";

  const annualTotal = listing.serviceCharge
    ? listing.price + listing.serviceCharge
    : listing.price;

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        /* Grid/flex items with padding but content-box sizing render wider
           than their track by the padding amount, overflowing the layout.
           This is the actual cause of content getting clipped on mobile —
           not a missing breakpoint. Reset it globally for this page. */
        *, *::before, *::after { box-sizing: border-box; }
          .khenx-layout > div,
          .khenx-score-grid > div,
          .khenx-intel-grid > div { min-width: 0; }
        @keyframes khenx-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes khenx-bar-in { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Sticky summary bar (desktop) — appears once hero scrolls away ────── */}
      {showStickyBar && (
        <div
          className="khenx-sticky-bar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #E2E8F0",
            animation: "khenx-bar-in 0.2s ease-out",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0F172A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {listing.title}
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                {formatPrice(listing.price)}{" "}
                {formatPricePeriod(listing.pricePeriod)}
              </div>
            </div>
            {/* In-page nav, desktop only */}
            <div
              style={{ display: "flex", gap: 4, flexShrink: 0 }}
              className="khenx-section-nav"
            >
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  style={{
                    border: "none",
                    background:
                      activeSection === s.id ? "#0F172A" : "transparent",
                    color: activeSection === s.id ? "#fff" : "#64748B",
                    borderRadius: 8,
                    padding: "7px 13px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollToSection("book-inspection")}
              className="khenx-sticky-cta"
              style={{
                flexShrink: 0,
                background: "#0F172A",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Book Inspection
            </button>
          </div>
        </div>
      )}

      {/* ── Back nav ─────────────────────────────────────────────────────────── */}
      <div
        className="khenx-back-nav"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 0" }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            color: "#64748B",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={15} /> Back to listings
        </button>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 24px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 28,
          alignItems: "start",
        }}
        className="khenx-layout"
      >
        {/* ══ LEFT COLUMN ══ */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
          className="khenx-left-col"
        >
          {/* ── Gallery ──────────────────────────────────────────────────────── */}
          <div ref={heroRef}>
            <PropertyGallery
              photos={listing.photos}
              title={listing.title}
              isFeatured={listing.isFeatured}
              isVerified={listing.status === "active"}
            />
          </div>

          {/* ── Overview: property info card ──────────────────────────────────── */}
          <div
            id="overview"
            ref={(el) => {
              sectionRefs.current["overview"] = el;
            }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            <Reveal>
              <div
                className="khenx-panel"
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "26px 28px",
                  border: "1px solid #E2E8F0",
                }}
              >
                {/* Header row */}
                <div
                  className="khenx-header-row"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 22,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: badge.bg,
                        border: `1px solid ${badge.borderColor}`,
                        color: badge.color,
                        borderRadius: 8,
                        padding: "3px 10px",
                        fontSize: 10,
                        fontWeight: 700,
                        marginBottom: 12,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {badge.label}
                    </span>
                    <h1
                      className="khenx-title"
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#0F172A",
                        margin: "0 0 8px",
                        lineHeight: 1.25,
                        letterSpacing: "-0.4px",
                      }}
                    >
                      {listing.title}
                    </h1>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#64748B",
                        fontSize: 12.5,
                      }}
                    >
                      <PinIcon />
                      {listing.estateName ? `${listing.estateName}, ` : ""}
                      {listing.areaName}, Lagos
                    </div>
                  </div>

                  <div
                    className="khenx-price-block"
                    style={{
                      textAlign: "right",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <div
                      className="khenx-price"
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: "#0F172A",
                        letterSpacing: "-1px",
                        lineHeight: 1.1,
                      }}
                    >
                      {formatPrice(listing.price)}
                    </div>
                    <button
                      onClick={() => setShowPriceBreakdown((v) => !v)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#94A3B8",
                        marginTop: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {formatPricePeriod(listing.pricePeriod)}
                      {listing.serviceCharge ? (
                        <>
                          <span
                            style={{
                              marginLeft: 2,
                              padding: "2px 7px",
                              background: "#FEF9EC",
                              color: "#92400E",
                              borderRadius: 5,
                              fontSize: 11,
                            }}
                          >
                            + service charge
                          </span>
                          <InfoIcon />
                        </>
                      ) : null}
                    </button>

                    {showPriceBreakdown && listing.serviceCharge ? (
                      <div
                        className="khenx-price-popup"
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: 8,
                          background: "#0F172A",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "14px 16px",
                          width: "min(220px, calc(100vw - 48px))",
                          boxSizing: "border-box",
                          textAlign: "left",
                          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                          zIndex: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 6,
                            color: "#94A3B8",
                          }}
                        >
                          <span>
                            Base {formatPricePeriod(listing.pricePeriod)}
                          </span>
                          <span style={{ color: "#F1F5F9" }}>
                            {formatPrice(listing.price)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 10,
                            color: "#94A3B8",
                          }}
                        >
                          <span>Service charge</span>
                          <span style={{ color: "#F1F5F9" }}>
                            {formatPrice(listing.serviceCharge)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: "#1E293B",
                            marginBottom: 10,
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12.5,
                            fontWeight: 700,
                          }}
                        >
                          <span>
                            Total {formatPricePeriod(listing.pricePeriod)}
                          </span>
                          <span style={{ color: "#00C9A7" }}>
                            {formatPrice(annualTotal)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{ height: 1, background: "#F1F5F9", marginBottom: 22 }}
                />

                {/* Stats band */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  {(isLandListing
                    ? landStats
                    : [
                        {
                          icon: <BedIcon />,
                          label: `${listing.bedrooms ?? 0} Bedroom${(listing.bedrooms ?? 0) !== 1 ? "s" : ""}`,
                          sub: "En-suite",
                        },
                        {
                          icon: <BathIcon />,
                          label: `${listing.bathrooms ?? 0} Bathroom${(listing.bathrooms ?? 0) !== 1 ? "s" : ""}`,
                          sub: "Guest Toilet",
                        },
                        ...(listing.features.parking
                          ? [
                              {
                                icon: <CarIcon />,
                                label: "Parking",
                                sub: "Designated",
                              },
                            ]
                          : []),
                        {
                          icon: <AreaIcon />,
                          label: listing.propertyType,
                          sub: "Property Type",
                        },
                      ]
                  ).map((stat, i) => (
                    <div
                      key={i}
                      className="khenx-stat-chip"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#F8FAFC",
                        borderRadius: 12,
                        padding: "10px 16px",
                        border: "1px solid #F1F5F9",
                        flex: "1 1 auto",
                        minWidth: 140,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "#fff",
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#475569",
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#0F172A",
                            textTransform: "capitalize",
                          }}
                        >
                          {stat.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "#94A3B8",
                            marginTop: 1,
                          }}
                        >
                          {stat.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {listing.description && (
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#475569",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {listing.description}
                  </p>
                )}
              </div>
            </Reveal>

            {listing.propertyCategory === "land" && (
              <Reveal delay={0.05}>
                <LandDetailsDisplay listing={listing} />
              </Reveal>
            )}
            {listing.propertyCategory !== "land" && (
              <Reveal delay={0.05}>
                <BuildingDetailsDisplay listing={listing} />
              </Reveal>
            )}
          </div>

          {/* ── Amenities ──────────────────────────────────────────────────────── */}
          {activeFeatures.length > 0 && (
            <div
              id="amenities"
              ref={(el) => {
                sectionRefs.current["amenities"] = el;
              }}
            >
              <Reveal>
                <div
                  className="khenx-panel"
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "24px 26px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#0F172A",
                      margin: "0 0 16px",
                    }}
                  >
                    Amenities & Features
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {activeFeatures.map((f) => (
                      <span
                        key={f}
                        style={{
                          background: "#F1F5F9",
                          color: "#374151",
                          borderRadius: 20,
                          padding: "5px 13px",
                          fontSize: 11.5,
                          fontWeight: 600,
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* ── Intelligence ───────────────────────────────────────────────────── */}
          <div
            id="intelligence"
            ref={(el) => {
              sectionRefs.current["intelligence"] = el;
            }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Score bar — now the visual anchor of this section */}
            <Reveal>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                }}
                className="khenx-score-grid"
              >
                <ScoreCell
                  label="Power Score"
                  icon={
                    <BoltIcon color={intel?.powerScore ? psColor : "#CBD5E1"} />
                  }
                  value={
                    intel?.powerScore != null
                      ? intel.powerScore.toFixed(1)
                      : null
                  }
                  unit="/10"
                  colorValue={intel?.powerScore ? psColor : undefined}
                />
                <ScoreCell
                  label="Flood Risk"
                  icon={
                    <DropIcon color={intel?.floodRisk ? frColor : "#CBD5E1"} />
                  }
                  value={
                    intel?.floodRisk
                      ? intel.floodRisk.charAt(0).toUpperCase() +
                        intel.floodRisk.slice(1)
                      : null
                  }
                  colorValue={intel?.floodRisk ? frColor : undefined}
                />
                <ScoreCell
                  label="Security"
                  icon={
                    <ShieldIcon
                      color={intel?.securityScore ? ssColor : "#CBD5E1"}
                    />
                  }
                  value={
                    intel?.securityScore != null
                      ? intel.securityScore.toFixed(1)
                      : null
                  }
                  unit="/10"
                  colorValue={intel?.securityScore ? ssColor : undefined}
                />
                <ScoreCell
                  label="Commute"
                  icon={
                    <TrainIcon
                      color={intel?.commuteScore ? csColor : "#CBD5E1"}
                    />
                  }
                  value={
                    intel?.commuteScore != null
                      ? intel.commuteScore.toFixed(1)
                      : null
                  }
                  unit="/10"
                  colorValue={intel?.commuteScore ? csColor : undefined}
                  isLast
                />
              </div>
            </Reveal>

            {/* AI notes */}
            {intel?.notes && (
              <Reveal delay={0.05}>
                <div
                  className="khenx-panel"
                  style={{
                    background: "#0F172A",
                    borderRadius: 18,
                    padding: "24px 26px",
                    color: "#fff",
                    border: "1px solid #1E293B",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(0,201,167,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SparkleIcon />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#F1F5F9",
                        }}
                      >
                        AI Neighborhood Intelligence
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#475569", marginTop: 1 }}
                      >
                        Powered by KhenX Analytics
                      </div>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.75,
                      color: "#94A3B8",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{intel.notes}&rdquo;
                  </p>
                </div>
              </Reveal>
            )}

            {/* Detail card */}
            {intel && (
              <Reveal delay={0.1}>
                <div
                  className="khenx-panel"
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "24px 26px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 22,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#0F172A",
                        margin: 0,
                      }}
                    >
                      Neighbourhood Intelligence
                    </h2>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        background: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                        borderRadius: 6,
                        padding: "3px 9px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Updated{" "}
                      {formatLastUpdated(intel.lastUpdated ?? intel.updatedAt)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 28,
                    }}
                    className="khenx-intel-grid"
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 14,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#0F172A",
                          }}
                        >
                          Power Availability
                        </span>
                        {powerHrs && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#00C9A7",
                              background: "#F0FDF9",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            ~{powerHrs} hrs/day
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 3,
                          height: 72,
                        }}
                      >
                        {powerBars.map((h, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              borderRadius: "4px 4px 0 0",
                              background:
                                i === powerBars.length - 1
                                  ? "#0F172A"
                                  : "#E2E8F0",
                              height: `${(h / 24) * 100}%`,
                              transition: "height 0.3s ease",
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: "#F1F5F9",
                          marginBottom: 8,
                          marginTop: 12,
                        }}
                      />
                      <p
                        style={{
                          fontSize: 10.5,
                          color: "#94A3B8",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {intel.dataSources?.length > 0
                          ? `Sources: ${intel.dataSources.slice(0, 2).join(", ")}`
                          : `Weekly reliability for ${listing.areaName}`}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#0F172A",
                          marginBottom: 14,
                        }}
                      >
                        Area Scores
                      </div>
                      {[
                        {
                          label: "Power Score",
                          value:
                            intel.powerScore != null
                              ? `${intel.powerScore.toFixed(1)} / 10`
                              : "—",
                          color: psColor,
                        },
                        {
                          label: "Security Score",
                          value:
                            intel.securityScore != null
                              ? `${intel.securityScore.toFixed(1)} / 10`
                              : "—",
                          color: ssColor,
                        },
                        {
                          label: "Flood Risk",
                          value: intel.floodRisk
                            ? intel.floodRisk.charAt(0).toUpperCase() +
                              intel.floodRisk.slice(1)
                            : "—",
                          color: frColor,
                        },
                        {
                          label: "Commute Score",
                          value:
                            intel.commuteScore != null
                              ? `${intel.commuteScore.toFixed(1)} / 10`
                              : "—",
                          color: csColor,
                        },
                      ].map(({ label, value, color }, idx, arr) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "9px 0",
                            borderBottom:
                              idx < arr.length - 1
                                ? "1px solid #F8FAFC"
                                : "none",
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#64748B" }}>
                            {label}
                          </span>
                          <span
                            style={{ fontSize: 12, fontWeight: 700, color }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── Location / real map ────────────────────────────────────────────── */}
          <div
            id="location"
            ref={(el) => {
              sectionRefs.current["location"] = el;
            }}
          >
            <Reveal>
              <div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: "0 0 14px",
                  }}
                >
                  Location
                </h2>
                <PropertyMap
                  areaName={listing.areaName}
                  latitude={listing.coordinates?.latitude}
                  longitude={listing.coordinates?.longitude}
                />
              </div>
            </Reveal>
          </div>

          {/* ── Similar Properties ─────────────────────────────────────────────── */}
          {similarListings.length > 0 && (
            <div
              id="similar"
              ref={(el) => {
                sectionRefs.current["similar"] = el;
              }}
            >
              <Reveal>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 18,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#0F172A",
                        margin: 0,
                      }}
                    >
                      Similar Properties
                    </h2>
                    <div
                      className="khenx-carousel-arrows"
                      style={{ display: "flex", gap: 8 }}
                    >
                      <button
                        onClick={() => scrollCarousel(-1)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          border: "1.5px solid #E2E8F0",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#475569",
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        onClick={() => scrollCarousel(1)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          border: "1.5px solid #E2E8F0",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#475569",
                        }}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={carouselRef}
                    style={{
                      display: "flex",
                      gap: 16,
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingBottom: 4,
                    }}
                    className="khenx-carousel"
                  >
                    {similarListings.map((l) => (
                      <SimilarCard key={l._id} listing={l} />
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 80,
          }}
          className="khenx-sidebar"
        >
          {/* Schedule Inspection */}
          <div
            id="book-inspection"
            className="khenx-panel"
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "22px 20px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#0F172A",
                margin: "0 0 20px",
              }}
            >
              Schedule Inspection
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputSt}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#475569",
                      marginBottom: 6,
                    }}
                  >
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    style={inputSt}
                  >
                    <option>Morning (09-12)</option>
                    <option>Afternoon (12-16)</option>
                    <option>Evening (16-19)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#475569",
                      marginBottom: 6,
                    }}
                  >
                    Visitors
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={visitors}
                    onChange={(e) => setVisitors(+e.target.value)}
                    style={inputSt}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full Name"
                  readOnly={isAuthenticated && !!user?.fullName}
                  style={{
                    ...inputSt,
                    background:
                      isAuthenticated && !!user?.fullName
                        ? "#F8FAFC"
                        : inputSt.background,
                  }}
                />
              </div>
            </div>

            {errorMessage ? (
              <div
                style={{
                  marginTop: 12,
                  color: "#DC2626",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              onClick={handleBookInspection}
              disabled={isSubmitting}
              style={{
                width: "100%",
                background: isSubmitting ? "#64748B" : "#0F172A",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginTop: 20,
                letterSpacing: "0.1px",
                opacity: isSubmitting ? 0.9 : 1,
              }}
            >
              {isSubmitting ? "Sending..." : "Book Inspection"}
            </button>

            {!isAuthenticated ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11.5,
                  color: "#64748B",
                  lineHeight: 1.5,
                }}
              >
                Sign in to send your request to the listing owner.
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: 11,
                color: "#94A3B8",
                fontSize: 10.5,
              }}
            >
              <LockIcon /> Secure processing — KhenX Trust
            </div>
          </div>

          {/* Owner card */}
          <div
            className="khenx-panel"
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "18px 20px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {ownerAvatar ? (
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #E2E8F0",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0F172A, #334155)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 12,
                    height: 12,
                    background:
                      ownerKycStatus === "approved" ? "#00C9A7" : "#94A3B8",
                    borderRadius: "50%",
                    border: "2px solid #fff",
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#0F172A",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ownerName}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                  {ownerBadgeLabel}
                </div>
                {memberSinceYear ? (
                  <div
                    style={{ fontSize: 10.5, color: "#64748B", marginTop: 3 }}
                  >
                    Member since {memberSinceYear}
                  </div>
                ) : null}
                <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 2 }}>
                  {ownerRoleLabel}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() =>
                  ownerPhone && (window.location.href = `tel:${ownerPhone}`)
                }
                disabled={!ownerPhone}
                style={{
                  flex: 1,
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 10,
                  padding: "9px",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: ownerPhone ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: ownerPhone ? "#0F172A" : "#94A3B8",
                  opacity: ownerPhone ? 1 : 0.7,
                }}
              >
                <PhoneIcon /> Call
              </button>
              <button
                onClick={() =>
                  ownerEmail && (window.location.href = `mailto:${ownerEmail}`)
                }
                disabled={!ownerEmail}
                style={{
                  flex: 1,
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 10,
                  padding: "9px",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: ownerEmail ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: ownerEmail ? "#0F172A" : "#94A3B8",
                  opacity: ownerEmail ? 1 : 0.7,
                }}
              >
                <MailIcon /> Email
              </button>
            </div>
          </div>

          {/* Institutional Trust */}
          <div
            className="khenx-panel"
            style={{
              background: "#F8FAFC",
              borderRadius: 18,
              padding: "16px 18px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckShieldIcon />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 5,
                  }}
                >
                  Institutional Trust
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#64748B",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Ownership papers, structural integrity, and neighbourhood data
                  have been independently verified by KhenX Analysts.
                </p>
              </div>
            </div>
          </div>

          {/* Quick intel pill */}
          {intel && (
            <div
              className="khenx-panel"
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "18px 20px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 14,
                }}
              >
                {listing.areaName} — Quick Intel
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {intel.overallScore != null && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: "#64748B" }}>
                      Overall Score
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: scoreColor(intel.overallScore),
                        background: scoreBg(intel.overallScore),
                        padding: "2px 9px",
                        borderRadius: 6,
                      }}
                    >
                      {intel.overallScore.toFixed(1)} / 10
                    </span>
                  </div>
                )}
                {intel.avgRentMin != null && intel.avgRentMax != null && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: "#64748B" }}>
                      Avg. Rent Range
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      ₦{(intel.avgRentMin / 1_000_000).toFixed(1)}M – ₦
                      {(intel.avgRentMax / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                )}
                {intel.propertiesCount != null && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: "#64748B" }}>
                      Active Listings
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      {intel.propertiesCount}
                    </span>
                  </div>
                )}
                <div style={{ height: 1, background: "#F1F5F9" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 11.5, color: "#64748B" }}>
                    Data Confidence
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        intel.dataConfidence === "high"
                          ? "#00C9A7"
                          : intel.dataConfidence === "medium"
                            ? "#F59E0B"
                            : "#94A3B8",
                      background:
                        intel.dataConfidence === "high"
                          ? "#F0FDF9"
                          : intel.dataConfidence === "medium"
                            ? "#FFFBEB"
                            : "#F8FAFC",
                      textTransform: "capitalize",
                      padding: "2px 9px",
                      borderRadius: 6,
                    }}
                  >
                    {intel.dataConfidence}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile sticky CTA bar ──────────────────────────────────────────────── */}
      <div className="khenx-mobile-cta">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
            {formatPrice(listing.price)}
          </div>
          <div style={{ fontSize: 10.5, color: "#94A3B8" }}>
            {formatPricePeriod(listing.pricePeriod)}
          </div>
        </div>
        <button
          onClick={() => scrollToSection("book-inspection")}
          style={{
            background: "#0F172A",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "11px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Book Inspection
        </button>
      </div>

      {/* ── Booking confirmation toast ─────────────────────────────────────────── */}
      {showToast && (
        <div
          className="khenx-toast"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            background: "#0F172A",
            color: "#fff",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            maxWidth: 340,
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            border: "1px solid #1E293B",
            zIndex: 1000,
            animation: "khenx-toast-in 0.25s ease-out",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              flexShrink: 0,
              background: "rgba(0,201,167,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckShieldIcon />
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#F1F5F9",
                marginBottom: 3,
              }}
            >
              Inspection request sent
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8", lineHeight: 1.5 }}>
              The agent has been notified. Full inspection details will be sent
              to your email shortly.
            </div>
          </div>
        </div>
      )}

      <style>{`
        .khenx-mobile-cta { display: none; }

        /* ── Tablet & below ─────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .khenx-layout { grid-template-columns: 1fr !important; padding: 16px 16px 90px !important; gap: 20px !important; }
          .khenx-back-nav { padding: 14px 16px 0 !important; }
          .khenx-sidebar { position: static !important; }
          .khenx-score-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .khenx-score-cell:nth-child(2n) { border-right: none !important; }
          .khenx-score-cell:nth-child(-n+2) { border-bottom: 1px solid #F1F5F9; }
          .khenx-intel-grid { grid-template-columns: 1fr !important; gap: 22px !important; }
          .khenx-section-nav { display: none !important; }
          .khenx-sticky-bar > div { padding: 12px 16px !important; }
          .khenx-mobile-cta {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #fff;
            border-top: 1px solid #E2E8F0;
            padding: 12px 16px;
            padding-bottom: max(12px, env(safe-area-inset-bottom));
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
          }
        }

        /* ── Small phones ───────────────────────────────────────────────── */
        @media (max-width: 600px) {
          .khenx-panel { padding: 16px !important; }
          .khenx-title { font-size: 19px !important; }
          .khenx-price-block { text-align: left !important; width: 100%; }
          .khenx-price { font-size: 21px !important; }
          .khenx-price-popup { right: auto !important; left: 0 !important; }
          .khenx-score-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .khenx-score-cell { padding: 16px 14px !important; }
          .khenx-stat-chip { min-width: 100% !important; }
          .khenx-similar-card { }
          .khenx-similar-card > div { width: 220px !important; }
          .khenx-carousel { gap: 12px !important; }
        }

        @media (max-width: 380px) {
          .khenx-score-grid { grid-template-columns: 1fr !important; }
          .khenx-score-cell { border-right: none !important; border-bottom: 1px solid #F1F5F9; }
          .khenx-score-cell:last-child { border-bottom: none; }
        }

        @media (max-width: 400px) {
          .khenx-toast { left: 16px !important; right: 16px !important; bottom: 88px !important; max-width: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ListingDetailPage;
