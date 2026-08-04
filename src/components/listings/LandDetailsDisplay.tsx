import { type ReactNode } from "react";
import { Check } from "lucide-react";
import type { IListing, INearbyItem } from "../../types/listing.types";
import PropertyAccordion, { DetailRow, Pill, RowGrid } from "./PropertyAccordion";

interface LandDetailsDisplayProps {
  listing: IListing;
}

const formatLabel = (value?: string | null) => {
  if (!value) return "—";
  return value.split(/[_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
};
const formatTitleType = (value?: string | null) => {
  if (!value) return "—";
  const labels: Record<string, string> = {
    certificate_of_occupancy: "Certificate of Occupancy",
    governors_consent: "Governor's Consent",
    gazette: "Gazette",
    registered_survey: "Registered Survey",
    excision: "Excision",
    deed_of_assignment: "Deed of Assignment",
    allocation_letter: "Allocation Letter",
    registered_deed: "Registered Deed",
    family_receipt: "Family Receipt",
    receipt_and_survey: "Receipt & Survey",
    freehold: "Freehold",
  };
  return labels[value] ?? formatLabel(value);
};
const formatLandCondition = (value?: string | null) => {
  if (!value) return "—";
  const labels: Record<string, string> = {
    dry_land: "Dry Land",
    swampy_land: "Swampy Land",
    sand_filled: "Sand-filled",
    reclaimed_land: "Reclaimed Land",
    rocky_land: "Rocky Land",
  };
  return labels[value] ?? formatLabel(value);
};
const formatPurpose = (value?: string | null) => {
  if (!value) return "—";
  if (value === "sale") return "For Sale";
  if (value === "lease") return "For Lease";
  return formatLabel(value);
};
const formatRoadType = (value?: string | null) => {
  if (!value) return "—";
  if (value === "tarred_road") return "Tarred Road";
  if (value === "untarred_road") return "Untarred Road";
  return formatLabel(value);
};
const formatTitleStatus = (value?: string | null) => {
  if (!value) return null;
  const styles: Record<string, { color: string; background: string }> = {
    verified: { color: "#166534", background: "#DCFCE7" },
    pending: { color: "#92400E", background: "#FEF3C7" },
    unverified: { color: "#B91C1C", background: "#FEE2E2" },
  };
  const style = styles[value] ?? { color: "#334155", background: "#F1F5F9" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, color: style.color, background: style.background }}>
      {formatLabel(value)}
    </span>
  );
};
const formatDistance = (value?: number | null) => (value == null || Number.isNaN(value) ? "—" : `${value.toLocaleString()} km`);
const formatListValue = (value?: string | null) => (!value ? "—" : formatLabel(value));
const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return Number.isFinite(value);
  return true;
};

const LandDetailsDisplay = ({ listing }: LandDetailsDisplayProps) => {
  const landDetails = listing.landDetails;
  if (!landDetails || listing.propertyCategory !== "land") return null;

  const profileFields = [landDetails.purpose, landDetails.pricePerSquareMeter, landDetails.plotSizeSqm, landDetails.totalLandAreaSqm, landDetails.numberOfPlots];
  const hasProfileData = profileFields.some(hasMeaningfulValue);
  const profileCount = profileFields.filter(hasMeaningfulValue).length;

  const characteristicsFields = [landDetails.landShape, landDetails.topography, landDetails.landCondition, landDetails.soilType, landDetails.orientation];
  const hasCharacteristicsData = characteristicsFields.some(hasMeaningfulValue);
  const characteristicsCount = characteristicsFields.filter(hasMeaningfulValue).length;

  const boundaryItems = [
    { label: "Fenced", value: landDetails.fenced },
    { label: "Gated", value: landDetails.gated },
    { label: "Surveyed", value: landDetails.surveyed },
    { label: "Corner Piece", value: landDetails.cornerPiece },
    { label: "Waterfront", value: landDetails.waterfront },
    { label: "Facing Major Road", value: landDetails.facingMajorRoad },
    { label: "Inside Estate", value: landDetails.insideEstate },
  ].filter((item) => item.value);

  const utilityItems = [
    { label: "Electricity Nearby", value: landDetails.utilities?.electricityNearby },
    { label: "Water Supply", value: landDetails.utilities?.waterSupply },
    { label: "Borehole Access", value: landDetails.utilities?.boreholeAccess },
    { label: "Drainage", value: landDetails.utilities?.drainage },
    { label: "Internet Coverage", value: landDetails.utilities?.internetCoverage },
    { label: "Road Access", value: landDetails.utilities?.roadAccess },
    { label: "Street Lighting", value: landDetails.utilities?.streetLighting },
    { label: "Sewage", value: landDetails.utilities?.sewage },
  ].filter((item) => item.value);

  const developmentPotential = (landDetails.developmentPotential ?? []).filter(Boolean);
  const roadType = landDetails.roadType;
  const accessibilityFields = [roadType, landDetails.distanceToExpresswayKm, landDetails.distanceToMajorRoadKm, landDetails.publicTransportAccess];
  const accessibilityHasData = accessibilityFields.some(hasMeaningfulValue);
  const accessibilityCount = accessibilityFields.filter(hasMeaningfulValue).length;

  const titleCount = (landDetails.titleTypes ?? []).length + (landDetails.titleStatus ? 1 : 0);

  const nearbyPlaces = Object.entries(listing.nearbyPlaces ?? {}) as Array<[string, INearbyItem[] | undefined]>;
  const nearbyPlaceGroups = nearbyPlaces.filter(([, items]) => (items ?? []).length > 0);
  const nearbyCount = nearbyPlaceGroups.reduce((sum, [, items]) => sum + (items?.length ?? 0), 0);

  // Build the ordered list of sections that actually have data
  const sections: Array<{ id: string; title: string; iconKey: string; count: number; render: () => ReactNode }> = [];

  if (hasProfileData) {
    sections.push({
      id: "profile", title: "Land Profile", iconKey: "profile", count: profileCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Purpose" value={formatPurpose(landDetails.purpose)} />
          <DetailRow label="Price / sqm" emphasize value={landDetails.pricePerSquareMeter != null ? `₦${landDetails.pricePerSquareMeter.toLocaleString()}` : "—"} />
          <DetailRow label="Plot Size" emphasize value={landDetails.plotSizeSqm != null ? `${landDetails.plotSizeSqm.toLocaleString()} sqm` : "—"} />
          <DetailRow label="Total Land Area" value={landDetails.totalLandAreaSqm != null ? `${landDetails.totalLandAreaSqm.toLocaleString()} sqm` : "—"} />
          <DetailRow label="Number of Plots" value={landDetails.numberOfPlots ?? "—"} />
        </RowGrid>
      ),
    });
  }
  if (hasCharacteristicsData) {
    sections.push({
      id: "characteristics", title: "Land Characteristics", iconKey: "characteristics", count: characteristicsCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Shape" value={formatLabel(landDetails.landShape)} />
          <DetailRow label="Topography" value={formatLabel(landDetails.topography)} />
          <DetailRow label="Condition" value={formatLandCondition(landDetails.landCondition)} />
          <DetailRow label="Soil Type" value={formatLabel(landDetails.soilType)} />
          <DetailRow label="Orientation" value={formatLabel(landDetails.orientation)} />
        </RowGrid>
      ),
    });
  }
  if (boundaryItems.length > 0) {
    sections.push({
      id: "boundaries", title: "Boundaries & Access", iconKey: "boundaries", count: boundaryItems.length,
      render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {boundaryItems.map((item) => (
            <Pill key={item.label}><Check size={13} color="#00C9A7" />{item.label}</Pill>
          ))}
        </div>
      ),
    });
  }
  if (titleCount > 0) {
    sections.push({
      id: "title", title: "Title Documentation", iconKey: "title", count: titleCount,
      render: () => (
        <div style={{ display: "grid", gap: 14 }}>
          {(landDetails.titleTypes ?? []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {landDetails.titleTypes?.map((type) => <Pill key={type} tone="teal">{formatTitleType(type)}</Pill>)}
            </div>
          )}
          {landDetails.titleStatus && <div>{formatTitleStatus(landDetails.titleStatus)}</div>}
        </div>
      ),
    });
  }
  if (utilityItems.length > 0) {
    sections.push({
      id: "utilities", title: "Utilities Available", iconKey: "utilities", count: utilityItems.length,
      render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {utilityItems.map((item) => <Pill key={item.label}><Check size={13} color="#00C9A7" />{item.label}</Pill>)}
        </div>
      ),
    });
  }
  if (developmentPotential.length > 0) {
    sections.push({
      id: "development", title: "Development Potential", iconKey: "development", count: developmentPotential.length,
      render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {developmentPotential.map((item) => <Pill key={item} tone="blue">{formatListValue(item)}</Pill>)}
        </div>
      ),
    });
  }
  if (accessibilityHasData) {
    sections.push({
      id: "accessibility", title: "Accessibility", iconKey: "accessibility", count: accessibilityCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Road Type" value={formatRoadType(roadType)} />
          <DetailRow label="Distance to Expressway" value={formatDistance(landDetails.distanceToExpresswayKm)} />
          <DetailRow label="Distance to Major Road" value={formatDistance(landDetails.distanceToMajorRoadKm)} />
          <DetailRow label="Public Transport" value={formatLabel(landDetails.publicTransportAccess)} />
        </RowGrid>
      ),
    });
  }
  if (landDetails.insideEstate) {
    sections.push({
      id: "estate", title: "Estate Information", iconKey: "estate", count: undefined as unknown as number,
      render: () => (
        <RowGrid>
          <DetailRow label="Estate Name" value={listing.estateName || "—"} />
          <DetailRow label="Gated Estate" value={landDetails.estateInfo?.gatedEstate ? "Yes" : "—"} />
          <DetailRow label="Security" value={landDetails.estateInfo?.security ? "Yes" : "—"} />
          <DetailRow label="Estate Fees" emphasize value={landDetails.estateInfo?.estateFees != null ? `₦${landDetails.estateInfo.estateFees.toLocaleString()}` : "—"} />
          <DetailRow label="Restrictions" value={formatLabel(landDetails.estateInfo?.buildingRestrictions)} />
          <DetailRow label="Development Stage" value={formatLabel(landDetails.estateInfo?.developmentStage)} />
        </RowGrid>
      ),
    });
  }
  if (nearbyPlaceGroups.length > 0) {
    sections.push({
      id: "nearby", title: "Nearby Places", iconKey: "nearby", count: nearbyCount,
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          {nearbyPlaceGroups.map(([category, items]) => (
            <div key={category}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>{formatLabel(category)}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {(items ?? []).map((item, index) => (
                  <div key={`${category}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderRadius: 10, padding: "10px 12px", background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name || "Unnamed place"}</span>
                    <span style={{ fontSize: 12, color: "#64748B", flexShrink: 0 }}>{item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  return <PropertyAccordion title="Land Details" hint="Tap a section to expand" sections={sections} />;
};

export default LandDetailsDisplay;