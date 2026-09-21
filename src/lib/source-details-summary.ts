import type { EvidenceSource, PendingEvidence } from '../api/evidence.api';

export type SourceDetailRow = {
  label: string;
  value: string;
};

export type SourceDetailsSummary = {
  headline: string;
  source: string;
  provider: string;
  retrievedAt: string;
  observedAt: string;
  method: string;
  searchArea?: string;
  dataTable: SourceDetailRow[];
};

const CLAIM_TYPE_LABELS: Record<string, string> = {
  power_supply_hours: 'Power supply hours',
  flood_risk: 'Flood risk',
  bank_count: 'Bank count',
  market_count: 'Market count',
  nearest_hospital: 'Nearest hospital',
  school_count_total: 'School count total',
  school_nearest_list: 'Nearby schools',
  bank_nearest_list: 'Nearby banks and ATMs',
  market_nearest_list: 'Nearby markets',
  security_score: 'Security score',
  community_note: 'Community note',
  travel_time_victoria_island: 'Travel time to Victoria Island',
  travel_time_ikeja: 'Travel time to Ikeja',
  travel_time_lekki: 'Travel time to Lekki',
  travel_time_maryland: 'Travel time to Maryland',
  canal_proximity: 'Canal proximity',
};

const humanizeClaimType = (claimType?: string): string => {
  if (!claimType) return 'source data';
  return CLAIM_TYPE_LABELS[claimType]
    ?? claimType
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
};

const formatDisplayDate = (value?: string | Date | null): string => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatStructuredPlace = (value: unknown, distanceSuffix = 'km'): string | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const place = value as { name?: unknown; street?: unknown; fullAddress?: unknown; distanceKm?: unknown };
  if (typeof place.name !== 'string' || !place.name.trim()) return null;

  const location = typeof place.street === 'string' && place.street.trim()
    ? place.street.trim()
    : typeof place.fullAddress === 'string' && place.fullAddress.trim()
      ? place.fullAddress.trim()
      : null;
  const distance = Number(place.distanceKm);
  const distanceLabel = Number.isFinite(distance) ? `${distance} ${distanceSuffix}` : null;

  return [place.name.trim(), location, distanceLabel].filter(Boolean).join(' — ')
    || place.name.trim();
};

const getValueSummary = (evidence: PendingEvidence): string => {
  const { value, claimType } = evidence;

  if (typeof value === 'number') {
    const suffix = /travel_time_/.test(claimType) ? ' minutes' : '';
    return `${value}${suffix}`;
  }

  if (Array.isArray(value)) {
    return `${value.length} nearby result${value.length === 1 ? '' : 's'}`;
  }

  if (typeof value === 'string') {
    return value.trim() || 'Unspecified value';
  }

  if (value && typeof value === 'object') {
    if ('name' in (value as Record<string, unknown>) || 'distanceKm' in (value as Record<string, unknown>)) {
      return formatStructuredPlace(value) ?? 'Structured place data';
    }
    return 'Structured data';
  }

  return 'Available data';
};

const getSearchArea = (evidence: PendingEvidence): string | undefined => {
  const sourceDocumentPublicId = evidence.sourceDocumentPublicId;
  if (!sourceDocumentPublicId) return undefined;

  try {
    const url = new URL(sourceDocumentPublicId);
    const dataParam = url.searchParams.get('data');
    if (!dataParam) return undefined;
    const radiusMatch = dataParam.match(/around:(\d+)/i);
    if (!radiusMatch) return undefined;
    return `${Number(radiusMatch[1]).toLocaleString()} m`;
  } catch {
    return undefined;
  }
};

export const getSourceMethodLabel = (source?: EvidenceSource | null): string => {
  const sourceName = source?.name ?? '';
  const sourceType = (source?.sourceType ?? '').toLowerCase();
  const domain = (source?.domain ?? '').toLowerCase();

  if (/(openstreetmap|overpass|osm)/i.test(sourceName) || (domain.includes('amenit') && sourceType === 'open_data')) {
    return 'Overpass API query';
  }

  if (/(osrm|routing)/i.test(sourceName) || domain.includes('routing')) {
    return 'Routing API';
  }

  const methodBySourceType: Record<string, string> = {
    government: 'Government data source',
    commercial: 'Commercial data source',
    open_data: 'Open data query',
    community: 'Community submission',
    internal_submission: 'Internal submission',
    field_verification: 'Field verification',
  };

  return methodBySourceType[sourceType] ?? 'API query';
};

export const getHumanReadableSourceLink = (source?: EvidenceSource | null): string | null => {
  if (!source) return null;
  const name = source.name ?? '';
  if (/(openstreetmap|osm)/i.test(name)) return 'https://www.openstreetmap.org/';
  if (/(osrm|routing)/i.test(name)) return 'https://project-osrm.org/';
  if (source.url && /^https?:\/\//i.test(source.url) && !/api|interpreter|route\/v1/i.test(source.url)) {
    return source.url;
  }
  return null;
};

export const buildSourceDetailsSummary = (
  evidence: PendingEvidence,
  source?: EvidenceSource | null,
): SourceDetailsSummary => {
  const sourceName = source?.name || 'Source';
  const provider = source?.organization || source?.domain || 'Unknown provider';
  const claimTypeLabel = humanizeClaimType(evidence.claimType);
  const valueSummary = getValueSummary(evidence);
  const method = getSourceMethodLabel(source);
  const searchArea = getSearchArea(evidence);
  const locationPhrase = /(openstreetmap|overpass|osm)/i.test(sourceName)
    ? 'in OpenStreetMap within the defined search area'
    : /(osrm|routing)/i.test(sourceName)
      ? 'through the routing network'
      : 'from the configured source';

  const headline = `KhenX found ${valueSummary.toLowerCase()} mapped ${claimTypeLabel.toLowerCase()} ${locationPhrase}.`;

  const rows: SourceDetailRow[] = [
    { label: 'Value', value: valueSummary },
    { label: 'Observation date', value: formatDisplayDate(evidence.observedAt) },
    { label: 'Source', value: sourceName },
    { label: 'Provider', value: provider },
    { label: 'Method', value: method },
  ];

  if (searchArea) {
    rows.push({ label: 'Radius', value: searchArea });
  }

  return {
    headline,
    source: sourceName,
    provider,
    retrievedAt: formatDisplayDate(evidence.retrievedAt ?? evidence.observedAt),
    observedAt: formatDisplayDate(evidence.observedAt),
    method,
    ...(searchArea ? { searchArea } : {}),
    dataTable: rows,
  };
};
