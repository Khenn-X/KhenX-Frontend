import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24)
    return `Today, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    size={16}
    fill={color}
    stroke="none"
    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
  />
);
const DropIcon = ({ color }: { color: string }) => (
  <Icon
    size={16}
    fill={color}
    stroke="none"
    d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
  />
);
const ShieldIcon = ({ color }: { color: string }) => (
  <Icon
    size={16}
    fill={color}
    stroke="none"
    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  />
);
const TrainIcon = ({ color }: { color: string }) => (
  <Icon
    size={16}
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
const VerifiedBadge = () => (
  <Icon
    size={12}
    fill="#fff"
    stroke="none"
    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  />
);
const ChevronLeft = () => <Icon size={17} d="M15 18l-6-6 6-6" />;
const ChevronRight = () => <Icon size={17} d="M9 18l6-6-6-6" />;
const ImagesIcon = () => (
  <Icon
    size={14}
    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
  />
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
    <Link to={`/listings/${listing._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.2s",
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
    style={{
      padding: "18px 20px",
      borderRight: isLast ? "none" : "1px solid #F1F5F9",
      display: "flex",
      flexDirection: "column",
      gap: 10,
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: colorValue ? colorValue + "18" : "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      {value != null ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span
            style={{
              fontSize: 20,
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
  const [contactName, setContactName] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning (09-12)");
  const [activePhoto, setActivePhoto] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (user?.fullName) {
      setContactName(user.fullName);
    }
  }, [user?.fullName]);

  const handleBookInspection = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Please sign in to request an inspection." } });
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
      const message = err instanceof Error ? err.message : "We could not send your inspection request right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: listingData, isLoading, isError, refetch } = useListing(id);
  const listing = listingData?.data.listing;

  const { data: neighbourhoodData } = useNeighbourhood(listing?.areaName ?? "");
  const intel: INeighbourhoodIntelligence | undefined =
    ((neighbourhoodData as { data?: { intelligence?: INeighbourhoodIntelligence; area?: INeighbourhoodIntelligence } } | undefined)?.data?.intelligence) ??
    ((neighbourhoodData as { data?: { intelligence?: INeighbourhoodIntelligence; area?: INeighbourhoodIntelligence } } | undefined)?.data?.area) ??
    undefined;

  const { data: similarData } = useListings({
    areaName: listing?.areaName,
    listingType: listing?.listingType,
    limit: 4,
  });
  const similarListings: IListing[] = (
    Array.isArray(similarData?.data)
      ? similarData!.data
      : Array.isArray((similarData?.data as { listings?: IListing[] } | undefined)?.listings)
        ? (similarData!.data as { listings: IListing[] }).listings
        : []
  )
    .filter((l: IListing) => l._id !== id)
    .slice(0, 3);

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
  const photos = listing.photos.length > 0 ? listing.photos : [];
  const extraPhotos = photos.length > 5 ? photos.length - 5 : 0;
  const displayThumbs = photos.slice(1, 6);

  const powerHrs = powerScoreToHours(intel?.powerScore ?? undefined);
  const powerBars = buildPowerBars(intel?.powerScore ?? undefined);
  const psColor = scoreColor(intel?.powerScore ?? undefined);
  const ssColor = scoreColor(intel?.securityScore ?? undefined);
  const frColor = floodRiskColor(intel?.floodRisk ?? undefined);
  const csColor = scoreColor(intel?.commuteScore ?? undefined);

  const activeFeatures = Object.entries(listing.features)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURE_LABELS[k] ?? k);

  const ownerProfile = (listing.agentId ? listing.agentId : listing.landlordId) as
    | {
        _id?: string;
        userId?: { fullName?: string; avatarUrl?: string; email?: string; createdAt?: string } | string | null;
        businessName?: string;
        phone?: string;
        kycStatus?: string;
        verifiedAt?: string;
      }
    | undefined;
  const ownerUser = ownerProfile?.userId && typeof ownerProfile.userId !== "string"
    ? ownerProfile.userId
    : undefined;
  const ownerName = ownerUser?.fullName?.trim() || ownerProfile?.businessName?.trim() || "Listing owner";
  const ownerAvatar = ownerUser?.avatarUrl?.trim();
  const ownerEmail = ownerUser?.email?.trim() || "";
  const ownerPhone = ownerProfile?.phone?.trim() || "";
  const ownerKycStatus = ownerProfile?.kycStatus;
  const ownerBadgeLabel = ownerKycStatus === "approved"
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
  const initials = ownerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "O";

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <style>{`
    @keyframes khenx-toast-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
      {/* ── Back nav ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 0" }}>
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
      >
        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ── Gallery ──────────────────────────────────────────────────────── */}
          <div>
            {/* Hero image — taller at 460px */}
            <div
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                height: 460,
                background: "#CBD5E1",
              }}
            >
              {photos[activePhoto] ? (
                <img
                  src={photos[activePhoto]}
                  alt={listing.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  No photos available
                </div>
              )}

              {/* Overlay gradient at bottom for badge legibility */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.38) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Top badges */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  gap: 8,
                }}
              >
                {listing.status === "active" && (
                  <span
                    style={{
                      background: "#00C9A7",
                      color: "#fff",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      letterSpacing: "0.3px",
                    }}
                  >
                    <VerifiedBadge /> Verified Listing
                  </span>
                )}
                {listing.isFeatured && (
                  <span
                    style={{
                      background: "rgba(15,23,42,0.85)",
                      backdropFilter: "blur(6px)",
                      color: "#fff",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✦ Featured
                  </span>
                )}
              </div>

              {/* Photo counter bottom right */}
              {photos.length > 1 && (
                <button
                  onClick={() => setActivePhoto((p) => (p + 1) % photos.length)}
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    background: "rgba(15,23,42,0.7)",
                    backdropFilter: "blur(6px)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <ImagesIcon /> {activePhoto + 1} / {photos.length}
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(displayThumbs.length, 5)}, 1fr)`,
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {displayThumbs.map((src, i) => {
                  const isLast = i === 4 && extraPhotos > 0;
                  const isActive = i + 1 === activePhoto;
                  return (
                    <div
                      key={i}
                      onClick={() => setActivePhoto(i + 1)}
                      style={{
                        borderRadius: 11,
                        overflow: "hidden",
                        height: 82,
                        background: "#CBD5E1",
                        cursor: "pointer",
                        position: "relative",
                        outline: isActive
                          ? "2.5px solid #0F172A"
                          : "2.5px solid transparent",
                        outlineOffset: 1,
                        transition: "outline 0.15s",
                      }}
                    >
                      <img
                        src={src}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {isLast && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(15,23,42,0.65)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 18,
                            }}
                          >
                            +{extraPhotos}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Property info card ────────────────────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "26px 28px",
              border: "1px solid #E2E8F0",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 22,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
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

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
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
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
                  {formatPricePeriod(listing.pricePeriod)}
                  {listing.serviceCharge ? (
                    <span
                      style={{
                        marginLeft: 6,
                        padding: "2px 7px",
                        background: "#FEF9EC",
                        color: "#92400E",
                        borderRadius: 5,
                        fontSize: 11,
                      }}
                    >
                      +₦{listing.serviceCharge.toLocaleString()} service charge
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{ height: 1, background: "#F1F5F9", marginBottom: 22 }}
            />

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {[
                {
                  icon: <BedIcon />,
                  label: `${listing.bedrooms} Bedroom${listing.bedrooms !== 1 ? "s" : ""}`,
                  sub: "En-suite",
                },
                {
                  icon: <BathIcon />,
                  label: `${listing.bathrooms} Bathroom${listing.bathrooms !== 1 ? "s" : ""}`,
                  sub: "Guest Toilet",
                },
                ...(listing.features.parking
                  ? [{ icon: <CarIcon />, label: "Parking", sub: "Designated" }]
                  : []),
                {
                  icon: <AreaIcon />,
                  label: listing.propertyType,
                  sub: "Property Type",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: "10px 16px",
                    border: "1px solid #F1F5F9",
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
                  <div>
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
                      style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 1 }}
                    >
                      {stat.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature pills */}
            {activeFeatures.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginBottom: 20,
                }}
              >
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
            )}

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

          {/* ── Score bar ─────────────────────────────────────────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            <ScoreCell
              label="Power Score"
              icon={
                <BoltIcon color={intel?.powerScore ? psColor : "#CBD5E1"} />
              }
              value={
                intel?.powerScore != null ? intel.powerScore.toFixed(1) : null
              }
              unit="/10"
              colorValue={intel?.powerScore ? psColor : undefined}
            />
            <ScoreCell
              label="Flood Risk"
              icon={<DropIcon color={intel?.floodRisk ? frColor : "#CBD5E1"} />}
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
                <TrainIcon color={intel?.commuteScore ? csColor : "#CBD5E1"} />
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

          {/* ── AI Neighbourhood Intelligence ─────────────────────────────────── */}
          {intel?.notes && (
            <div
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
                    style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9" }}
                  >
                    AI Neighborhood Intelligence
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
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
                "{intel.notes}"
              </p>
            </div>
          )}

          {/* ── Neighbourhood Intelligence card ────────────────────────────────── */}
          {intel && (
            <div
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
              >
                {/* Power bar chart */}
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
                            i === powerBars.length - 1 ? "#0F172A" : "#E2E8F0",
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

                {/* Scores table */}
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
                          idx < arr.length - 1 ? "1px solid #F8FAFC" : "none",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#64748B" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Map placeholder ───────────────────────────────────────────────── */}
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              height: 240,
              position: "relative",
              border: "1px solid #E2E8F0",
            }}
          >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="mapgrid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#C8D0DB"
                    strokeWidth="0.7"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="#EEF2F7" />
              <rect width="100%" height="100%" fill="url(#mapgrid)" />
              <line
                x1="0"
                y1="120"
                x2="900"
                y2="120"
                stroke="#BDC7D2"
                strokeWidth="10"
              />
              <line
                x1="290"
                y1="0"
                x2="290"
                y2="280"
                stroke="#BDC7D2"
                strokeWidth="6"
              />
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="280"
                stroke="#BDC7D2"
                strokeWidth="4"
              />
              <line
                x1="0"
                y1="60"
                x2="900"
                y2="75"
                stroke="#C8D0DB"
                strokeWidth="3"
              />
              <line
                x1="148"
                y1="0"
                x2="148"
                y2="280"
                stroke="#C8D0DB"
                strokeWidth="2"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#0F172A",
                borderRadius: 24,
                padding: "9px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00C9A7",
                  flexShrink: 0,
                }}
              />
              {listing.areaName}, Lagos
            </div>
          </div>

          {/* ── Similar Properties ────────────────────────────────────────────── */}
          {similarListings.length > 0 && (
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
                <div style={{ display: "flex", gap: 8 }}>
                  {[ChevronLeft, ChevronRight].map((C, i) => (
                    <button
                      key={i}
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
                      <C />
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                }}
              >
                {similarListings.map((l) => (
                  <SimilarCard key={l._id} listing={l} />
                ))}
              </div>
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
        >
          {/* Schedule Inspection */}
          <div
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
                  style={{ ...inputSt, background: isAuthenticated && !!user?.fullName ? "#F8FAFC" : inputSt.background }}
                />
              </div>
            </div>

            {errorMessage ? (
              <div style={{ marginTop: 12, color: "#DC2626", fontSize: 12.5, lineHeight: 1.5 }}>
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
              <div style={{ marginTop: 10, fontSize: 11.5, color: "#64748B", lineHeight: 1.5 }}>
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
                    background: ownerKycStatus === "approved" ? "#00C9A7" : "#94A3B8",
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
                  <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 3 }}>
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
                onClick={() => {
                  if (ownerPhone) {
                    window.location.href = `tel:${ownerPhone}`;
                  }
                }}
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
                onClick={() => {
                  if (ownerEmail) {
                    window.location.href = `mailto:${ownerEmail}`;
                  }
                }}
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
              <div>
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

      {/* ── Booking confirmation toast ────────────────────────────────────────── */}
      {showToast && (
        <div
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
    </div>
  );
};

export default ListingDetailPage;
