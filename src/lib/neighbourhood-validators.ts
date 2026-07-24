import { z } from 'zod';

const floodRiskValues = ['low', 'medium', 'high'] as const;
const dataConfidenceValues = ['low', 'medium', 'high'] as const;
const dataSourceValues = [
  'resident_reports',
  'disco_data',
  'satellite',
  'nimet',
  'partner',
  'admin_manual',
] as const;

const optionalNumber = z.number().min(0).nullable().optional();
const optionalText = z.string().nullable().optional();

const rentBucketSchema = z.object({
  min: z.number().min(0).nullable().optional(),
  max: z.number().min(0).nullable().optional(),
  currency: z.string().trim().nullable().optional(),
  reason: optionalText,
  updatedAt: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
});

export const neighbourhoodFormSchema = z.object({
  canonicalName: z.string().trim().min(1, 'Canonical name is required'),
  displayName: z.string().trim().min(1, 'Display name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  lga: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  location: z.object({
    coordinates: z.array(z.number().nullable().optional()).length(2).nullable().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  summary: z.object({
    overallScore: z.number().min(0).max(10).nullable().optional(),
    dataConfidence: z.enum(dataConfidenceValues).nullable().optional(),
    sourceSummary: z.string().optional().or(z.literal('')),
    lastUpdatedAt: z.string().nullable().optional(),
    lastUpdatedBy: z.string().nullable().optional(),
  }).optional(),
  metrics: z.object({
    safety: z.object({
      securityIncidentCount: optionalNumber,
      estateSecurityType: z.enum(['none', 'manned_gate', 'cctv', 'patrol', 'smart_access']).nullable().optional(),
      incidentHotspots: z.string().optional().or(z.literal('')),
      vigilanteWatchPresence: z.enum(['none', 'low', 'moderate', 'high']).nullable().optional(),
      nearestPoliceStation: z.object({
        distanceKm: optionalNumber,
        responseTimeMin: optionalNumber,
      }).optional(),
      nightSafetyRating: z.number().min(1).max(10).nullable().optional(),
      armedRobberyHistory: optionalNumber,
    }).optional(),
    infrastructure: z.object({
      powerSupplyHours: z.number().min(0).max(24).nullable().optional(),
      generatorDependency: z.enum(['none', 'low', 'moderate', 'high']).nullable().optional(),
      waterSupplyType: z.enum(['mains', 'borehole', 'tanker', 'none']).nullable().optional(),
      waterQualityRating: z.number().min(1).max(5).nullable().optional(),
      internetConnectivity: z.enum(['fibre', '4g', 'none']).nullable().optional(),
      roadCondition: z.enum(['tarred_good', 'potholed', 'damaged', 'unmotorable']).nullable().optional(),
      drainageQuality: z.enum(['good', 'moderate', 'poor']).nullable().optional(),
      wasteCollectionReliability: z.enum(['reliable', 'irregular', 'none']).nullable().optional(),
      streetLightingPct: z.number().min(0).max(100).nullable().optional(),
    }).optional(),
    flooding: z.object({
      floodRiskLevel: z.enum(['low', 'moderate', 'high', 'very_high']).nullable().optional(),
      floodEventCount: optionalNumber,
      floodAffectedStreets: z.string().optional().or(z.literal('')),
      floodRecoveryDays: optionalNumber,
      elevationClassification: z.enum(['high_ground', 'low_lying', 'waterlogged']).nullable().optional(),
      canalProximityKm: optionalNumber,
      floodOfRecord: z.object({
        year: z.number().nullable().optional(),
        estimatedLevel: z.number().nullable().optional(),
      }).optional(),
    }).optional(),
    transport: z.object({
      distanceToExpresswayKm: optionalNumber,
      trafficCongestionRating: z.number().min(1).max(5).nullable().optional(),
      publicTransportAccess: z.array(z.object({
        mode: z.enum(['brt', 'bus', 'danfo', 'keke', 'okada']).nullable().optional(),
        availability: z.enum(['none', 'limited', 'available', 'strong']).nullable().optional(),
      })).optional(),
      commuteTimeIslandMin: optionalNumber,
      commuteTimeIkejaMin: optionalNumber,
      parkingAvailability: z.enum(['easy', 'limited', 'very_difficult']).nullable().optional(),
      roadMotorabilityRainySeason: z.enum(['passable', 'difficult', 'impassable']).nullable().optional(),
      travelTimesToHubs: z.object({
        victoriaIsland: optionalNumber,
        ikeja: optionalNumber,
        lekki: optionalNumber,
        maryland: optionalNumber,
      }).optional(),
    }).optional(),
    amenities: z.object({
      nearestSupermarket: z.object({
        name: optionalText,
        distanceKm: optionalNumber,
        updatedAt: z.string().nullable().optional(),
        updatedBy: z.string().nullable().optional(),
      }).optional(),
      nearestHospital: z.object({
        name: optionalText,
        distanceKm: optionalNumber,
        updatedAt: z.string().nullable().optional(),
        updatedBy: z.string().nullable().optional(),
      }).optional(),
      nearestAtmBankCount: optionalNumber,
      nearestFillingStation: z.object({
        name: optionalText,
        distanceKm: optionalNumber,
        availabilityRating: z.number().min(1).max(5).nullable().optional(),
        updatedAt: z.string().nullable().optional(),
        updatedBy: z.string().nullable().optional(),
      }).optional(),
      primarySchoolOptions: z.object({
        count: optionalNumber,
        qualityTier: z.enum(['poor', 'fair', 'good', 'excellent']).nullable().optional(),
        updatedAt: z.string().nullable().optional(),
      }).optional(),
      secondarySchoolOptions: z.object({
        count: optionalNumber,
        qualityTier: z.enum(['poor', 'fair', 'good', 'excellent']).nullable().optional(),
        updatedAt: z.string().nullable().optional(),
      }).optional(),
      restaurantDensityRating: z.object({
        density: z.enum(['low', 'moderate', 'high', 'very_high']).nullable().optional(),
        qualityRating: z.number().min(1).max(5).nullable().optional(),
      }).optional(),
      nearestWorshipPlace: z.object({
        name: optionalText,
        distanceKm: optionalNumber,
        updatedAt: z.string().nullable().optional(),
        updatedBy: z.string().nullable().optional(),
      }).optional(),
      gymFacilityCount: optionalNumber,
      marketAccess: z.object({
        name: optionalText,
        distanceKm: optionalNumber,
        daysOpen: z.string().optional().or(z.literal('')),
        updatedAt: z.string().nullable().optional(),
        updatedBy: z.string().nullable().optional(),
      }).optional(),
    }).optional(),
    propertyMarket: z.object({
      avgRent1Bed: optionalNumber,
      avgRent2Bed: optionalNumber,
      avgRent3Bed: optionalNumber,
      avgRentDetachedTerrace: optionalNumber,
      priceAppreciationTrend: z.number().nullable().optional(),
      agentDensity: optionalNumber,
      avgListingTimeDays: optionalNumber,
      tenantDemandIndex: z.number().nullable().optional(),
      vacancyRateEstimate: z.number().min(0).max(100).nullable().optional(),
    }).optional(),
    community: z.object({
      residentProfile: z.enum(['professionals', 'families', 'mixed', 'students']).nullable().optional(),
      communityAssociationStatus: z.enum(['active', 'inactive']).nullable().optional(),
      noiseLevel: z.number().min(1).max(5).nullable().optional(),
      neighbourRelationsRating: z.number().min(1).max(5).nullable().optional(),
      religiousNoiseExposure: z.number().min(1).max(5).nullable().optional(),
      commercialActivityLevel: z.enum(['residential', 'mixed', 'commercial']).nullable().optional(),
      expatDiasporaPresence: z.boolean().nullable().optional(),
    }).optional(),
  }).optional(),
  rent: z.object({
    override: z.object({
      '1': rentBucketSchema.optional(),
      '2': rentBucketSchema.optional(),
      '3': rentBucketSchema.optional(),
      detached_terrace: rentBucketSchema.optional(),
    }).optional(),
  }).optional(),
  assets: z.object({
    imageUrl: optionalText,
    imageUrlSchool: optionalText,
    imageUrlStreet: optionalText,
    imageUrlBank: optionalText,
    imageUrlMarket: optionalText,
  }).optional(),
  legacy: z.object({
    migratedFromLegacyAreaName: optionalText,
    migrationVersion: z.number().nullable().optional(),
    migratedAt: z.string().nullable().optional(),
  }).optional(),
});

const importRowBase = z.object({
  areaName: z.string().min(1, 'Area name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  lga: z.string().optional().or(z.literal('')),
  powerScore: z.string().optional().or(z.literal('')),
  powerAvgHoursDaily: z.string().optional().or(z.literal('')),
  floodRisk: z.string().optional().or(z.literal('')),
  floodNotes: z.string().optional().or(z.literal('')),
  securityScore: z.string().optional().or(z.literal('')),
  commuteScore: z.string().optional().or(z.literal('')),
  dataConfidence: z.string().optional().or(z.literal('')),
  totalReportsUsed: z.string().optional().or(z.literal('')),
  dataSources: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  'amenities.hospitals': z.string().optional().or(z.literal('')),
  'amenities.schools': z.string().optional().or(z.literal('')),
  'amenities.markets': z.string().optional().or(z.literal('')),
  'amenities.malls': z.string().optional().or(z.literal('')),
  'schoolCounts.primary': z.string().optional().or(z.literal('')),
  'schoolCounts.secondary': z.string().optional().or(z.literal('')),
  'schoolCounts.tertiary': z.string().optional().or(z.literal('')),
  'schoolCounts.total': z.string().optional().or(z.literal('')),
  bankCount: z.string().optional().or(z.literal('')),
  marketCount: z.string().optional().or(z.literal('')),
  transitSafetyScore: z.string().optional().or(z.literal('')),
  motoristCoverageKm: z.string().optional().or(z.literal('')),
  transitNotes: z.string().optional().or(z.literal('')),
  'typicalRentRange.min': z.string().optional().or(z.literal('')),
  'typicalRentRange.max': z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  imageUrlSchool: z.string().optional().or(z.literal('')),
  imageUrlStreet: z.string().optional().or(z.literal('')),
  imageUrlBank: z.string().optional().or(z.literal('')),
  imageUrlMarket: z.string().optional().or(z.literal('')),
  overallScore: z.string().optional().or(z.literal('')),
  avgRentMin: z.string().optional().or(z.literal('')),
  avgRentMax: z.string().optional().or(z.literal('')),
  rentCurrency: z.string().optional().or(z.literal('')),
  propertiesCount: z.string().optional().or(z.literal('')),
  isFeatured: z.string().optional().or(z.literal('')),
  'travelTimesToHubs.victoriaIsland': z.string().optional().or(z.literal('')),
  'travelTimesToHubs.ikeja': z.string().optional().or(z.literal('')),
  'travelTimesToHubs.lekki': z.string().optional().or(z.literal('')),
  'travelTimesToHubs.maryland': z.string().optional().or(z.literal('')),
});

export const neighbourhoodImportSchema = importRowBase.refine((row) => {
  const value = row.floodRisk?.trim().toLowerCase();
  return !value || floodRiskValues.includes(value as any);
}, { message: 'floodRisk must be low, medium, or high', path: ['floodRisk'] }).refine((row) => {
  const value = row.dataConfidence?.trim().toLowerCase();
  return !value || dataConfidenceValues.includes(value as any);
}, { message: 'dataConfidence must be low, medium, or high', path: ['dataConfidence'] }).refine((row) => {
  if (!row.dataSources?.trim()) return true;
  const values = row.dataSources.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return values.every((item) => dataSourceValues.includes(item as any));
}, { message: `dataSources values must be one of: ${dataSourceValues.join(', ')}`, path: ['dataSources'] });

export type NeighbourhoodImportRow = z.infer<typeof importRowBase> & { validation?: string | null };
