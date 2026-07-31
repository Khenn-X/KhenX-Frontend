import { type ReactNode } from "react";
import { Check } from "lucide-react";
import type { IBuildingDetails, IListing } from "../../types/listing.types";
import PropertyAccordion, { DetailRow, Pill, RowGrid } from "./PropertyAccordion";

interface BuildingDetailsDisplayProps {
  listing: IListing;
}

const formatLabel = (value?: string | null) => {
  if (!value) return "—";
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatFurnishing = (value?: string | null) => {
  if (!value) return "—";
  const labels: Record<string, string> = {
    furnished: "Furnished",
    unfurnished: "Unfurnished",
    semi_furnished: "Semi-furnished",
  };
  return labels[value] ?? formatLabel(value);
};

const formatCondition = (value?: string | null) => {
  if (!value) return "—";
  const labels: Record<string, string> = {
    new: "New",
    renovated: "Renovated",
    needs_renovation: "Needs Renovation",
    old: "Old",
  };
  return labels[value] ?? formatLabel(value);
};

const formatParkingType = (value?: string | null) => {
  if (!value) return "—";
  const labels: Record<string, string> = {
    covered: "Covered",
    open: "Open",
    basement: "Basement",
    street: "Street",
  };
  return labels[value] ?? formatLabel(value);
};

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return Number.isFinite(value);
  return true;
};

const countTrueValues = (values: Array<boolean | undefined | null>) => values.filter((value): value is true => value === true).length;

const toBoolLabel = (value?: boolean) => (value ? "Yes" : "—");

const BuildingDetailsDisplay = ({ listing }: BuildingDetailsDisplayProps) => {
  const buildingDetails = listing.buildingDetails;
  if (!buildingDetails || listing.propertyCategory === "land") return null;

  const profileFields = [
    buildingDetails.yearBuilt,
    buildingDetails.floors,
    buildingDetails.totalFloorAreaSqm,
    buildingDetails.landSizeSqm,
    buildingDetails.lastRenovated,
  ];
  const hasProfileData = profileFields.some(hasMeaningfulValue);
  const profileCount = profileFields.filter(hasMeaningfulValue).length;

  const interiorFields = [
    buildingDetails.interiorFeatures?.popCeiling,
    buildingDetails.interiorFeatures?.tiles,
    buildingDetails.interiorFeatures?.marbleFlooring,
    buildingDetails.interiorFeatures?.woodenFloor,
    buildingDetails.interiorFeatures?.airConditioning,
    buildingDetails.interiorFeatures?.waterHeater,
    buildingDetails.interiorFeatures?.fittedKitchen,
    buildingDetails.interiorFeatures?.kitchenCabinets,
    buildingDetails.interiorFeatures?.oven,
    buildingDetails.interiorFeatures?.microwave,
    buildingDetails.interiorFeatures?.refrigerator,
    buildingDetails.interiorFeatures?.smartHomeFeatures,
    buildingDetails.interiorFeatures?.cctv,
    buildingDetails.interiorFeatures?.intercom,
    buildingDetails.interiorFeatures?.smokeDetector,
    buildingDetails.interiorFeatures?.fireAlarm,
  ];
  const interiorCount = countTrueValues(interiorFields);
  const hasInteriorData = interiorCount > 0;

  const exteriorFields = [
    buildingDetails.exteriorFeatures?.swimmingPool,
    buildingDetails.exteriorFeatures?.gym,
    buildingDetails.exteriorFeatures?.garden,
    buildingDetails.exteriorFeatures?.playground,
    buildingDetails.exteriorFeatures?.carport,
    buildingDetails.exteriorFeatures?.securityHouse,
    buildingDetails.exteriorFeatures?.fence,
    buildingDetails.exteriorFeatures?.gate,
    buildingDetails.exteriorFeatures?.generator,
    buildingDetails.exteriorFeatures?.borehole,
    buildingDetails.exteriorFeatures?.waterTank,
    buildingDetails.exteriorFeatures?.solarPower,
    buildingDetails.exteriorFeatures?.elevator,
    buildingDetails.exteriorFeatures?.rooftopLounge,
  ];
  const exteriorCount = countTrueValues(exteriorFields);
  const hasExteriorData = exteriorCount > 0 || buildingDetails.exteriorFeatures?.parkingSpaces != null || (buildingDetails as IBuildingDetails & { parkingType?: string }).parkingType != null;

  const utilityFields = [
    buildingDetails.utilities?.electricity,
    buildingDetails.utilities?.waterSupply,
    buildingDetails.utilities?.borehole,
    buildingDetails.utilities?.internet,
    buildingDetails.utilities?.cableTv,
    buildingDetails.utilities?.sewage,
    buildingDetails.utilities?.drainage,
    buildingDetails.utilities?.wasteDisposal,
  ];
  const utilityCount = countTrueValues(utilityFields);
  const hasUtilityData = utilityCount > 0;

  const securityFields = [
    buildingDetails.securityFeatures?.estateSecurity,
    buildingDetails.securityFeatures?.cctv,
    buildingDetails.securityFeatures?.gatedCommunity,
    buildingDetails.securityFeatures?.accessControl,
    buildingDetails.securityFeatures?.securityGuards,
    buildingDetails.securityFeatures?.electricFence,
  ];
  const securityCount = countTrueValues(securityFields);
  const hasSecurityData = securityCount > 0;

  const sections: Array<{ id: string; title: string; iconKey: string; count: number; render: () => ReactNode }> = [];

  if (hasProfileData) {
    sections.push({
      id: "building-profile",
      title: "Building Details",
      iconKey: "building",
      count: profileCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Year Built" value={buildingDetails.yearBuilt ?? "—"} />
          <DetailRow label="Floors" value={buildingDetails.floors ?? "—"} />
          <DetailRow label="Total Floor Area" value={buildingDetails.totalFloorAreaSqm != null ? `${buildingDetails.totalFloorAreaSqm.toLocaleString()} sqm` : "—"} />
          <DetailRow label="Land Size" value={buildingDetails.landSizeSqm != null ? `${buildingDetails.landSizeSqm.toLocaleString()} sqm` : "—"} />
          <DetailRow label="Last Renovated" value={buildingDetails.lastRenovated || "—"} />
          <DetailRow label="Condition" value={formatCondition((buildingDetails as IBuildingDetails & { condition?: string }).condition)} />
        </RowGrid>
      ),
    });
  }

  if (hasInteriorData) {
    sections.push({
      id: "interior",
      title: "Interior & Finishing",
      iconKey: "interior",
      count: interiorCount,
      render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {buildingDetails.interiorFeatures?.popCeiling ? <Pill tone="teal"><Check size={13} color="#00C9A7" />POP Ceiling</Pill> : null}
          {buildingDetails.interiorFeatures?.tiles ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Tiles</Pill> : null}
          {buildingDetails.interiorFeatures?.marbleFlooring ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Marble Flooring</Pill> : null}
          {buildingDetails.interiorFeatures?.woodenFloor ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Wooden Floor</Pill> : null}
          {buildingDetails.interiorFeatures?.airConditioning ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Air Conditioning</Pill> : null}
          {buildingDetails.interiorFeatures?.waterHeater ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Water Heater</Pill> : null}
          {buildingDetails.interiorFeatures?.fittedKitchen ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Fitted Kitchen</Pill> : null}
          {buildingDetails.interiorFeatures?.kitchenCabinets ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Kitchen Cabinets</Pill> : null}
          {buildingDetails.interiorFeatures?.oven ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Oven</Pill> : null}
          {buildingDetails.interiorFeatures?.microwave ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Microwave</Pill> : null}
          {buildingDetails.interiorFeatures?.refrigerator ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Refrigerator</Pill> : null}
          {buildingDetails.interiorFeatures?.smartHomeFeatures ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Smart Home</Pill> : null}
          {buildingDetails.interiorFeatures?.cctv ? <Pill tone="teal"><Check size={13} color="#00C9A7" />CCTV</Pill> : null}
          {buildingDetails.interiorFeatures?.intercom ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Intercom</Pill> : null}
          {buildingDetails.interiorFeatures?.smokeDetector ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Smoke Detector</Pill> : null}
          {buildingDetails.interiorFeatures?.fireAlarm ? <Pill tone="teal"><Check size={13} color="#00C9A7" />Fire Alarm</Pill> : null}
        </div>
      ),
    });
  }

  if (hasExteriorData) {
    sections.push({
      id: "parking-structure",
      title: "Parking & Structure",
      iconKey: "parking",
      count: exteriorCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Parking Spaces" value={buildingDetails.exteriorFeatures?.parkingSpaces ?? "—"} />
          <DetailRow label="Parking Type" value={formatParkingType((buildingDetails as IBuildingDetails & { parkingType?: string }).parkingType)} />
          <DetailRow label="Carport" value={toBoolLabel(buildingDetails.exteriorFeatures?.carport)} />
          <DetailRow label="Gate" value={toBoolLabel(buildingDetails.exteriorFeatures?.gate)} />
          <DetailRow label="Generator" value={toBoolLabel(buildingDetails.exteriorFeatures?.generator)} />
          <DetailRow label="Elevator" value={toBoolLabel(buildingDetails.exteriorFeatures?.elevator)} />
        </RowGrid>
      ),
    });
  }

  if (hasUtilityData) {
    sections.push({
      id: "utilities",
      title: "Utilities",
      iconKey: "utilities",
      count: utilityCount,
      render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {buildingDetails.utilities?.electricity ? <Pill><Check size={13} color="#00C9A7" />Electricity</Pill> : null}
          {buildingDetails.utilities?.waterSupply ? <Pill><Check size={13} color="#00C9A7" />Water Supply</Pill> : null}
          {buildingDetails.utilities?.borehole ? <Pill><Check size={13} color="#00C9A7" />Borehole</Pill> : null}
          {buildingDetails.utilities?.internet ? <Pill><Check size={13} color="#00C9A7" />Internet</Pill> : null}
          {buildingDetails.utilities?.cableTv ? <Pill><Check size={13} color="#00C9A7" />Cable TV</Pill> : null}
          {buildingDetails.utilities?.sewage ? <Pill><Check size={13} color="#00C9A7" />Sewage</Pill> : null}
          {buildingDetails.utilities?.drainage ? <Pill><Check size={13} color="#00C9A7" />Drainage</Pill> : null}
          {buildingDetails.utilities?.wasteDisposal ? <Pill><Check size={13} color="#00C9A7" />Waste Disposal</Pill> : null}
        </div>
      ),
    });
  }

  if (hasSecurityData) {
    sections.push({
      id: "security",
      title: "Security",
      iconKey: "security",
      count: securityCount,
      render: () => (
        <RowGrid>
          <DetailRow label="Estate Security" value={toBoolLabel(buildingDetails.securityFeatures?.estateSecurity)} />
          <DetailRow label="Gated Community" value={toBoolLabel(buildingDetails.securityFeatures?.gatedCommunity)} />
          <DetailRow label="Access Control" value={toBoolLabel(buildingDetails.securityFeatures?.accessControl)} />
          <DetailRow label="Security Guards" value={toBoolLabel(buildingDetails.securityFeatures?.securityGuards)} />
          <DetailRow label="Electric Fence" value={toBoolLabel(buildingDetails.securityFeatures?.electricFence)} />
          <DetailRow label="CCTV" value={toBoolLabel(buildingDetails.securityFeatures?.cctv)} />
        </RowGrid>
      ),
    });
  }

  return <PropertyAccordion title="Building Details" hint="Tap a section to expand" sections={sections} />;
};

export default BuildingDetailsDisplay;
