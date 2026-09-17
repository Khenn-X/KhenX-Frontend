export type EvidenceTier = 'verified' | 'supported' | 'reference';

export type EvidenceTierSource = {
  sourceType?: string;
};

export type EvidenceTierEvidence = {
  claimType?: string;
  value?: unknown;
};

const TRAVEL_TIME_CLAIM_TYPES = new Set([
  'travel_time_victoria_island',
  'travel_time_ikeja',
  'travel_time_lekki',
  'travel_time_maryland',
]);

const LIST_CLAIM_TYPES = new Set([
  'school_nearest_list',
  'bank_nearest_list',
  'market_nearest_list',
]);

const parseCandidateValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    try {
      const parsed = JSON.parse(trimmedValue);
      return parsed === value ? trimmedValue : parseCandidateValue(parsed);
    } catch {
      return trimmedValue;
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('value' in record) {
      return parseCandidateValue(record.value);
    }
  }

  return value;
};

const getStructuredListPlaces = (value: unknown): Array<{ name: string; latitude?: number; longitude?: number }> | null => {
  const parsed = parseCandidateValue(value);
  if (!Array.isArray(parsed)) return null;

  const places = parsed
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => {
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      const latitude = Number(entry.latitude);
      const longitude = Number(entry.longitude);
      if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return { name, latitude, longitude };
    })
    .filter((place): place is { name: string; latitude: number; longitude: number } => Boolean(place));

  return places.length > 0 ? places : null;
};

const hasValidClaimData = (evidence: EvidenceTierEvidence): boolean => {
  if (!evidence.claimType) return false;

  const value = parseCandidateValue(evidence.value);

  if (LIST_CLAIM_TYPES.has(evidence.claimType)) {
    const places = getStructuredListPlaces(value);
    return Boolean(places && places.length > 0);
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (value && typeof value === 'object') {
    if ('name' in (value as Record<string, unknown>) || 'latitude' in (value as Record<string, unknown>) || 'longitude' in (value as Record<string, unknown>)) {
      const record = value as Record<string, unknown>;
      const hasName = typeof record.name === 'string' && record.name.trim().length > 0;
      const latitude = Number(record.latitude);
      const longitude = Number(record.longitude);
      return hasName && Number.isFinite(latitude) && Number.isFinite(longitude);
    }
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return value !== null && value !== undefined && value !== '';
};

export const valuesAgree = (selectedValue: unknown, candidateValue: unknown, claimType?: string): boolean => {
  const a = parseCandidateValue(selectedValue);
  const b = parseCandidateValue(candidateValue);

  if (claimType && LIST_CLAIM_TYPES.has(claimType)) {
    const candidateList = getStructuredListPlaces(b);
    const selectedList = getStructuredListPlaces(a);
    if (!candidateList || !selectedList) return false;
    return candidateList[0]?.name.toLowerCase() === selectedList[0]?.name.toLowerCase();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    if (a === 0) return b === 0;
    return Math.abs(b - a) <= Math.abs(a) * 0.1;
  }

  return JSON.stringify(a) === JSON.stringify(b);
};

export const getEvidenceCorroborationCount = (items: EvidenceTierEvidence[], target: EvidenceTierEvidence): number => {
  const claimType = target.claimType ?? '';
  return items.filter((item) => item.claimType === claimType && valuesAgree(item.value, target.value, claimType)).length;
};

export const classifyEvidenceTier = (
  evidence: EvidenceTierEvidence,
  source: EvidenceTierSource | null,
  corroborationCount = 0,
): EvidenceTier => {
  const claimType = evidence.claimType ?? '';

  if (TRAVEL_TIME_CLAIM_TYPES.has(claimType)) {
    return 'reference';
  }

  const sourceType = source?.sourceType;
  const isTrustedSource = sourceType === 'open_data' || sourceType === 'field_verification';

  if (isTrustedSource && hasValidClaimData(evidence)) {
    return 'verified';
  }

  if (corroborationCount >= 2) {
    return 'verified';
  }

  return 'supported';
};
