import { useState, useEffect, type DragEvent } from 'react';
import { useForm, useWatch, type Path, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  Zap,
  Droplets,
  Truck,
  Building2,
  Sparkles,
  DollarSign,
  Home,
  Trees,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { neighbourhoodFormSchema } from '../../../lib/neighbourhood-validators';
import type { INeighbourhoodIntelligence } from '../../../types/neighbourhood.types';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { neighbourhoodApi } from '../../../api/neighbourhood.api';
import { neighbourhoodKeys } from '../../../hooks/useNeighbourhood';

type NeighbourhoodFormData = z.infer<typeof neighbourhoodFormSchema>;

type NeighbourhoodField = {
  name: Path<NeighbourhoodFormData>;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
  options?: string[];
  required?: boolean;
  helper?: string;
};

type NeighbourhoodSection = {
  title: string;
  icon: LucideIcon;
  description: string;
  fields: NeighbourhoodField[];
};

const sectionData: NeighbourhoodSection[] = [
  {
    title: 'Identity',
    icon: Home,
    description: 'Basic area identifiers and location metadata used for search and routing.',
    fields: [
      { name: 'canonicalName', label: 'Canonical name', type: 'text', required: true, placeholder: 'e.g. lekki-phase-1', helper: 'The internal, unique ID for this area — lowercase with hyphens. Once set, avoid changing it, since other records may reference it.' },
      { name: 'displayName', label: 'Display name', type: 'text', required: true, placeholder: 'e.g. Lekki Phase 1', helper: 'The friendly name shown to users on the site.' },
      { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'e.g. lekki-phase-1', helper: "Used in the area's web address. Usually the same as the canonical name." },
      { name: 'lga', label: 'LGA', type: 'text', placeholder: 'e.g. Eti-Osa', helper: 'The Local Government Area this neighbourhood falls under.' },
      { name: 'state', label: 'State', type: 'text', placeholder: 'e.g. Lagos', helper: 'The Nigerian state. Defaults to Lagos.' },
      { name: 'country', label: 'Country', type: 'text', placeholder: 'e.g. NG', helper: 'Country code. Defaults to NG.' },
      { name: 'location.coordinates.0', label: 'Longitude', type: 'number', step: 0.0001, placeholder: 'e.g. 3.4552', helper: "The area's map position (east–west). Used to place it on the map and calculate distances to amenities." },
      { name: 'location.coordinates.1', label: 'Latitude', type: 'number', step: 0.0001, placeholder: 'e.g. 6.4405', helper: "The area's map position (north–south). Pair with longitude above." },
      { name: 'isActive', label: 'Active', type: 'checkbox', helper: 'Whether this area is currently visible on the live site. Turn off to hide a draft without deleting its data.' },
      { name: 'isFeatured', label: 'Featured', type: 'checkbox', helper: 'Whether this area gets extra visibility, e.g. a homepage highlight.' },
    ],
  },
  {
    title: 'Summary',
    icon: Sparkles,
    description: 'High-level score and source metadata summarizing data quality and recency.',
    fields: [
      { name: 'summary.overallScore', label: 'Overall score (0–10)', type: 'number', step: 0.1, min: 0, max: 10, placeholder: 'e.g. 7.2', helper: "The area's overall livability score shown to users. Usually derived from the sections below, but can be set manually here." },
      { name: 'summary.dataConfidence', label: 'Data confidence', type: 'select', options: ['low', 'medium', 'high'], helper: 'How much you trust the data entered for this area — low if mostly estimated, high if verified on the ground.' },
      { name: 'summary.sourceSummary', label: 'Source summary', type: 'text', placeholder: 'resident_reports,partner', helper: 'Where this data came from, separated by commas (e.g. resident survey, partner agency, site visit).' },
      { name: 'summary.lastUpdatedAt', label: 'Last updated at', type: 'text', placeholder: 'YYYY-MM-DD', helper: 'The date this record was last reviewed or edited.' },
      { name: 'summary.lastUpdatedBy', label: 'Last updated by', type: 'text', placeholder: 'e.g. admin_chidi', helper: 'Who made the last edit.' },
    ],
  },
  {
    title: 'Safety',
    icon: Shield,
    description: 'Security and safety metrics that affect resident confidence.',
    fields: [
      { name: 'metrics.safety.securityIncidentCount', label: 'Security incident count', type: 'number', min: 0, placeholder: 'e.g. 3', helper: 'Rough number of reported security incidents (theft, break-ins, etc.) in a recent period.' },
      { name: 'metrics.safety.estateSecurityType', label: 'Estate security type', type: 'select', options: ['none', 'manned_gate', 'cctv', 'patrol', 'smart_access'], helper: 'Primary security setup in the area, such as guards, CCTV, or access control.' },
      { name: 'metrics.safety.incidentHotspots', label: 'Incident hotspots', type: 'text', placeholder: 'Ayo, Banana Island', helper: 'Key streets or locations with frequent security reports.' },
      { name: 'metrics.safety.vigilanteWatchPresence', label: 'Vigilante watch presence', type: 'select', options: ['none', 'low', 'moderate', 'high'], helper: 'Estimate of local vigilante patrol strength and visibility.' },
      { name: 'metrics.safety.nearestPoliceStation.distanceKm', label: 'Nearest police station (km)', type: 'number', min: 0, placeholder: 'e.g. 2.1', helper: 'Straight-line distance to the closest police station.' },
      { name: 'metrics.safety.nearestPoliceStation.responseTimeMin', label: 'Police response time (min)', type: 'number', min: 0, placeholder: 'e.g. 15', helper: 'How long police typically take to respond to a call in this area.' },
      { name: 'metrics.safety.nightSafetyRating', label: 'Night safety rating (1–10)', type: 'number', min: 1, max: 10, placeholder: 'e.g. 7', helper: 'How safe the area feels after dark. 1 = very unsafe, 10 = very safe.' },
      { name: 'metrics.safety.armedRobberyHistory', label: 'Armed robbery history', type: 'number', min: 0, placeholder: 'e.g. 1', helper: 'Count of past armed robbery incidents on record for this area.' },
    ],
  },
  {
    title: 'Infrastructure',
    icon: Zap,
    description: 'Basic utilities and services that determine everyday living comfort.',
    fields: [
      { name: 'metrics.infrastructure.powerSupplyHours', label: 'Power supply hours', type: 'number', min: 0, max: 24, placeholder: 'e.g. 14', helper: 'Average hours of grid electricity per day.' },
      { name: 'metrics.infrastructure.generatorDependency', label: 'Generator dependency', type: 'select', options: ['none', 'low', 'moderate', 'high'], helper: 'How much residents rely on generators to cover gaps in grid power.' },
      { name: 'metrics.infrastructure.waterSupplyType', label: 'Water supply type', type: 'select', options: ['mains', 'borehole', 'tanker', 'none'], helper: "The area's main water source." },
      { name: 'metrics.infrastructure.waterQualityRating', label: 'Water quality rating (1–5)', type: 'number', min: 1, max: 5, placeholder: 'e.g. 4', helper: 'Subjective or tested water quality. 1 = poor, 5 = excellent.' },
      { name: 'metrics.infrastructure.internetConnectivity', label: 'Internet connectivity', type: 'select', options: ['fibre', '4g', 'none'], helper: 'Best commonly-available internet type in the area.' },
      { name: 'metrics.infrastructure.roadCondition', label: 'Road condition', type: 'select', options: ['tarred_good', 'potholed', 'damaged', 'unmotorable'], helper: 'General state of the roads within the area.' },
      { name: 'metrics.infrastructure.drainageQuality', label: 'Drainage quality', type: 'select', options: ['good', 'moderate', 'poor'], helper: 'How well rainwater drains away — closely tied to flood risk below.' },
      { name: 'metrics.infrastructure.wasteCollectionReliability', label: 'Waste collection reliability', type: 'select', options: ['reliable', 'irregular', 'none'], helper: 'Whether refuse collection happens on a predictable schedule.' },
      { name: 'metrics.infrastructure.streetLightingPct', label: 'Street lighting (%)', type: 'number', min: 0, max: 100, placeholder: 'e.g. 60', helper: 'Rough percentage of streets with working street lights.' },
    ],
  },
  {
    title: 'Flooding',
    icon: Droplets,
    description: 'How prone this area is to flooding, and how it recovers when it happens.',
    fields: [
      { name: 'metrics.flooding.floodRiskLevel', label: 'Flood risk level', type: 'select', options: ['low', 'moderate', 'high', 'very_high'], helper: 'Overall flood risk category for the area — this is the headline number renters will see.' },
      { name: 'metrics.flooding.floodEventCount', label: 'Flood event count', type: 'number', min: 0, placeholder: 'e.g. 2', helper: 'Number of recorded flooding events in recent years.' },
      { name: 'metrics.flooding.floodAffectedStreets', label: 'Flood affected streets', type: 'text', placeholder: 'Avenue 1, Street 2', helper: 'Specific streets known to flood, separated by commas.' },
      { name: 'metrics.flooding.floodRecoveryDays', label: 'Flood recovery days', type: 'number', min: 0, placeholder: 'e.g. 3', helper: 'Typical number of days it takes for flooding to fully recede.' },
      { name: 'metrics.flooding.elevationClassification', label: 'Elevation classification', type: 'select', options: ['high_ground', 'low_lying', 'waterlogged'], helper: 'General elevation category used to assess flood vulnerability.' },
      { name: 'metrics.flooding.canalProximityKm', label: 'Canal proximity (km)', type: 'number', min: 0, helper: 'Distance to the nearest drainage canal or water channel, which affects flood runoff.' },
      { name: 'metrics.flooding.floodOfRecord.year', label: 'Flood of record year', type: 'number', placeholder: 'e.g. 2022', helper: 'The year of the worst flood on record for this area.' },
      { name: 'metrics.flooding.floodOfRecord.estimatedLevel', label: 'Flood of record level', type: 'number', placeholder: 'e.g. 45', helper: 'How severe that worst flood was — estimated water depth in cm.' },
    ],
  },
  {
    title: 'Transport',
    icon: Truck,
    description: 'Transport access and commuting details for residents and workers.',
    fields: [
      { name: 'metrics.transport.distanceToExpresswayKm', label: 'Distance to expressway (km)', type: 'number', min: 0, placeholder: 'e.g. 1.5', helper: 'How far to the nearest major expressway on-ramp.' },
      { name: 'metrics.transport.trafficCongestionRating', label: 'Traffic congestion rating (1–5)', type: 'number', min: 1, max: 5, placeholder: 'e.g. 3', helper: 'How bad traffic typically is in and around the area. 1 = light, 5 = heavy.' },
      { name: 'metrics.transport.publicTransportAccess.0.mode', label: 'Public transport mode', type: 'select', options: ['brt', 'bus', 'danfo', 'keke', 'okada'], helper: 'The main form of public transport available in the area.' },
      { name: 'metrics.transport.publicTransportAccess.0.availability', label: 'Transport availability', type: 'select', options: ['none', 'limited', 'available', 'strong'], helper: 'How easy it is to actually find that transport when needed.' },
      { name: 'metrics.transport.commuteTimeIslandMin', label: 'Commute time to Island (min)', type: 'number', min: 0, placeholder: 'e.g. 45', helper: 'Typical commute time by car to Lagos Island.' },
      { name: 'metrics.transport.commuteTimeIkejaMin', label: 'Commute time to Ikeja (min)', type: 'number', min: 0, placeholder: 'e.g. 35', helper: 'Typical commute time by car to Ikeja.' },
      { name: 'metrics.transport.parkingAvailability', label: 'Parking availability', type: 'select', options: ['easy', 'limited', 'very_difficult'], helper: 'How easy it is to find parking in the area.' },
      { name: 'metrics.transport.roadMotorabilityRainySeason', label: 'Rainy season road motorability', type: 'select', options: ['passable', 'difficult', 'impassable'], helper: 'Whether roads stay passable by car during heavy rains.' },
      { name: 'metrics.transport.travelTimesToHubs.victoriaIsland', label: 'Travel time to Victoria Island', type: 'number', min: 0, placeholder: 'e.g. 40', helper: 'Estimated drive time in minutes to Victoria Island.' },
      { name: 'metrics.transport.travelTimesToHubs.ikeja', label: 'Travel time to Ikeja', type: 'number', min: 0, placeholder: 'e.g. 30', helper: 'Estimated drive time in minutes to Ikeja.' },
      { name: 'metrics.transport.travelTimesToHubs.lekki', label: 'Travel time to Lekki', type: 'number', min: 0, placeholder: 'e.g. 10', helper: 'Estimated drive time in minutes to Lekki.' },
      { name: 'metrics.transport.travelTimesToHubs.maryland', label: 'Travel time to Maryland', type: 'number', min: 0, placeholder: 'e.g. 50', helper: 'Estimated drive time in minutes to Maryland.' },
    ],
  },
  {
    title: 'Amenities',
    icon: Building2,
    description: 'Nearby services and facilities that matter for daily life.',
    fields: [
      { name: 'metrics.amenities.nearestSupermarket.name', label: 'Nearest supermarket', type: 'text', placeholder: 'e.g. Shoprite Ikota', helper: 'Name of the closest supermarket.' },
      { name: 'metrics.amenities.nearestSupermarket.distanceKm', label: 'Supermarket distance (km)', type: 'number', min: 0, placeholder: 'e.g. 1.2', helper: 'Distance to that supermarket.' },
      { name: 'metrics.amenities.nearestHospital.name', label: 'Nearest hospital', type: 'text', placeholder: 'e.g. Reddington Hospital', helper: 'Name of the closest hospital or clinic.' },
      { name: 'metrics.amenities.nearestHospital.distanceKm', label: 'Hospital distance (km)', type: 'number', min: 0, placeholder: 'e.g. 2.0', helper: 'Distance to that hospital.' },
      { name: 'metrics.amenities.nearestAtmBankCount', label: 'ATM / bank count', type: 'number', min: 0, placeholder: 'e.g. 5', helper: 'Rough number of ATMs or bank branches within the area.' },
      { name: 'metrics.amenities.nearestFillingStation.name', label: 'Nearest filling station', type: 'text', placeholder: 'e.g. NNPC Admiralty', helper: 'Name of the closest fuel station.' },
      { name: 'metrics.amenities.nearestFillingStation.distanceKm', label: 'Filling station distance (km)', type: 'number', min: 0, placeholder: 'e.g. 0.9', helper: 'Distance to that filling station.' },
      { name: 'metrics.amenities.nearestFillingStation.availabilityRating', label: 'Filling station availability rating', type: 'number', min: 1, max: 5, placeholder: 'e.g. 4', helper: 'How reliably it has fuel in stock. 1 = frequently out, 5 = always available.' },
      { name: 'metrics.amenities.primarySchoolOptions.count', label: 'Primary school count', type: 'number', min: 0, placeholder: 'e.g. 6', helper: 'Number of primary schools nearby.' },
      { name: 'metrics.amenities.primarySchoolOptions.qualityTier', label: 'Primary school quality tier', type: 'select', options: ['poor', 'fair', 'good', 'excellent'], helper: 'General quality level of the nearby primary schools.' },
      { name: 'metrics.amenities.secondarySchoolOptions.count', label: 'Secondary school count', type: 'number', min: 0, placeholder: 'e.g. 4', helper: 'Number of secondary schools nearby.' },
      { name: 'metrics.amenities.secondarySchoolOptions.qualityTier', label: 'Secondary school quality tier', type: 'select', options: ['poor', 'fair', 'good', 'excellent'], helper: 'General quality level of the nearby secondary schools.' },
      { name: 'metrics.amenities.restaurantDensityRating.density', label: 'Restaurant density', type: 'select', options: ['low', 'moderate', 'high', 'very_high'], helper: 'How many restaurants/eateries are around.' },
      { name: 'metrics.amenities.restaurantDensityRating.qualityRating', label: 'Restaurant quality rating', type: 'number', min: 1, max: 5, placeholder: 'e.g. 4', helper: 'General quality of nearby restaurants. 1 = poor, 5 = excellent.' },
      { name: 'metrics.amenities.nearestWorshipPlace.name', label: 'Nearest worship place', type: 'text', placeholder: 'e.g. Household of God', helper: 'Name of the closest church or mosque.' },
      { name: 'metrics.amenities.nearestWorshipPlace.distanceKm', label: 'Worship place distance (km)', type: 'number', min: 0, placeholder: 'e.g. 0.5', helper: 'Distance to that worship place.' },
      { name: 'metrics.amenities.gymFacilityCount', label: 'Gym facility count', type: 'number', min: 0, placeholder: 'e.g. 3', helper: 'Number of gyms or fitness centres nearby.' },
      { name: 'metrics.amenities.marketAccess.name', label: 'Market access name', type: 'text', placeholder: 'e.g. Ajah Market', helper: 'Name of the closest local market.' },
      { name: 'metrics.amenities.marketAccess.distanceKm', label: 'Market distance (km)', type: 'number', min: 0, placeholder: 'e.g. 3.0', helper: 'Distance to that market.' },
      { name: 'metrics.amenities.marketAccess.daysOpen', label: 'Market days open', type: 'text', placeholder: 'Mon,Wed,Sat', helper: 'Which days the market operates, separated by commas.' },
    ],
  },
  {
    title: 'Property market',
    icon: DollarSign,
    description: 'Local rental and market metrics used for pricing and demand.',
    fields: [
      { name: 'metrics.propertyMarket.avgRent1Bed', label: 'Avg rent 1-bed', type: 'number', min: 0, placeholder: 'e.g. 1200000', helper: 'Average annual rent (₦) for a 1-bedroom in this area. Can be overridden in Rent overrides below.' },
      { name: 'metrics.propertyMarket.avgRent2Bed', label: 'Avg rent 2-bed', type: 'number', min: 0, placeholder: 'e.g. 2000000', helper: 'Average annual rent (₦) for a 2-bedroom in this area.' },
      { name: 'metrics.propertyMarket.avgRent3Bed', label: 'Avg rent 3-bed', type: 'number', min: 0, placeholder: 'e.g. 3200000', helper: 'Average annual rent (₦) for a 3-bedroom in this area.' },
      { name: 'metrics.propertyMarket.avgRentDetachedTerrace', label: 'Avg rent detached/terrace', type: 'number', min: 0, placeholder: 'e.g. 6000000', helper: 'Average annual rent (₦) for a detached or terrace house.' },
      { name: 'metrics.propertyMarket.priceAppreciationTrend', label: 'Price appreciation trend', type: 'number', placeholder: 'e.g. 0.08', helper: 'Whether property values here are trending up, flat, or down. Positive = rising, negative = falling.' },
      { name: 'metrics.propertyMarket.agentDensity', label: 'Agent density', type: 'number', min: 0, placeholder: 'e.g. 12', helper: 'Rough number of active real estate agents operating in the area.' },
      { name: 'metrics.propertyMarket.avgListingTimeDays', label: 'Avg listing time (days)', type: 'number', min: 0, placeholder: 'e.g. 21', helper: 'How many days a typical listing stays live before it is rented or sold.' },
      { name: 'metrics.propertyMarket.tenantDemandIndex', label: 'Tenant demand index', type: 'number', placeholder: 'e.g. 72', helper: 'Higher values indicate stronger demand from renters in this area.' },
      { name: 'metrics.propertyMarket.vacancyRateEstimate', label: 'Vacancy rate estimate (%)', type: 'number', min: 0, max: 100, placeholder: 'e.g. 8', helper: 'Estimated percentage of empty/unrented units in the area.' },
    ],
  },
  {
    title: 'Community',
    icon: Trees,
    description: 'Resident and social profile data describing the local community.',
    fields: [
      { name: 'metrics.community.residentProfile', label: 'Resident profile', type: 'select', options: ['professionals', 'families', 'mixed', 'students'], helper: 'The dominant type of residents in the area.' },
      { name: 'metrics.community.communityAssociationStatus', label: 'Community association status', type: 'select', options: ['active', 'inactive'], helper: "Whether there's an active residents' association managing shared concerns." },
      { name: 'metrics.community.noiseLevel', label: 'Noise level (1–5)', type: 'number', min: 1, max: 5, placeholder: 'e.g. 3', helper: 'General ambient noise level. 1 = very quiet, 5 = very noisy.' },
      { name: 'metrics.community.neighbourRelationsRating', label: 'Neighbour relations rating (1–5)', type: 'number', min: 1, max: 5, placeholder: 'e.g. 4', helper: 'How well residents generally get along. 1 = poor, 5 = very close-knit.' },
      { name: 'metrics.community.religiousNoiseExposure', label: 'Religious noise exposure (1–5)', type: 'number', min: 1, max: 5, placeholder: 'e.g. 2', helper: 'Noise specifically from nearby churches/mosques (e.g. call to prayer, loudspeaker services) — purely about noise level, not a judgement on religion.' },
      { name: 'metrics.community.commercialActivityLevel', label: 'Commercial activity level', type: 'select', options: ['residential', 'mixed', 'commercial'], helper: 'How much of the area is residential vs shops/business.' },
      { name: 'metrics.community.expatDiasporaPresence', label: 'Expat / diaspora presence', type: 'checkbox', helper: "Whether there's a notable expat or returnee/diaspora population." },
    ],
  },
  {
    title: 'Rent overrides',
    icon: BadgeCheck,
    description: "Manual rent buckets to override automated pricing with known local values. These replace the Property market averages above wherever they're set — leave a bucket blank to keep using the calculated average.",
    fields: [],
  },
  {
    title: 'Images',
    icon: Building2,
    description: 'URLs for area images shown on the neighbourhood card and detail pages.',
    fields: [
      { name: 'assets.imageUrl', label: 'Hero image', type: 'text', placeholder: 'Paste image URL or upload a file', helper: 'The main large photo shown at the top of the area\u2019s page. Landscape, ~1200\u00d7800px works best.' },
      { name: 'assets.imageUrlSchool', label: 'School image', type: 'text', placeholder: 'Paste image URL or upload a file', helper: 'A representative photo of a school in the area.' },
      { name: 'assets.imageUrlStreet', label: 'Street image', type: 'text', placeholder: 'Paste image URL or upload a file', helper: 'A representative street-view photo.' },
      { name: 'assets.imageUrlBank', label: 'Bank image', type: 'text', placeholder: 'Paste image URL or upload a file', helper: 'A representative bank/ATM photo.' },
      { name: 'assets.imageUrlMarket', label: 'Market image', type: 'text', placeholder: 'Paste image URL or upload a file', helper: 'A representative local market photo.' },
    ],
  },
  {
    title: 'Legacy',
    icon: Home,
    description: 'Legacy import metadata to track where this area data came from. Only relevant for areas migrated from an older system — new areas can skip this section entirely.',
    fields: [
      { name: 'legacy.migratedFromLegacyAreaName', label: 'Migrated from legacy area name', type: 'text', placeholder: 'e.g. lekki-ph1-old', helper: 'The name this area had in the old system, if it was imported.' },
      { name: 'legacy.migrationVersion', label: 'Migration version', type: 'number', min: 1, placeholder: 'e.g. 2', helper: 'Which version of the migration script/process produced this record.' },
      { name: 'legacy.migratedAt', label: 'Migrated at', type: 'text', placeholder: 'YYYY-MM-DD', helper: 'The date the migration happened.' },
    ],
  },
];

interface NeighbourhoodDataFormProps {
  areas: INeighbourhoodIntelligence[];
  selectedAreaName?: string;
  onSelectArea?: (areaName: string) => void;
  onSaved?: () => void;
}

const DEFAULT_RENT_BUCKETS = ['1', '2', '3', 'detached_terrace'] as const;

type RentBucketKey = (typeof DEFAULT_RENT_BUCKETS)[number];

const NeighbourhoodDataForm = ({ areas, selectedAreaName, onSelectArea, onSaved }: NeighbourhoodDataFormProps) => {
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();

  const defaultValues: NeighbourhoodFormData = {
    canonicalName: '',
    displayName: '',
    slug: '',
    lga: '',
    state: 'Lagos',
    country: 'NG',
    location: { coordinates: [] },
    isActive: true,
    isFeatured: false,
    summary: {
      overallScore: null,
      dataConfidence: 'low',
      sourceSummary: '',
      lastUpdatedAt: '',
      lastUpdatedBy: '',
    },
    metrics: {
      safety: {
        securityIncidentCount: null,
        estateSecurityType: null,
        incidentHotspots: '',
        vigilanteWatchPresence: null,
        nearestPoliceStation: { distanceKm: null, responseTimeMin: null },
        nightSafetyRating: null,
        armedRobberyHistory: null,
      },
      infrastructure: {
        powerSupplyHours: null,
        generatorDependency: null,
        waterSupplyType: null,
        waterQualityRating: null,
        internetConnectivity: null,
        roadCondition: null,
        drainageQuality: null,
        wasteCollectionReliability: null,
        streetLightingPct: null,
      },
      flooding: {
        floodRiskLevel: null,
        floodEventCount: null,
        floodAffectedStreets: '',
        floodRecoveryDays: null,
        elevationClassification: null,
        canalProximityKm: null,
        floodOfRecord: { year: null, estimatedLevel: null },
      },
      transport: {
        distanceToExpresswayKm: null,
        trafficCongestionRating: null,
        publicTransportAccess: [],
        commuteTimeIslandMin: null,
        commuteTimeIkejaMin: null,
        parkingAvailability: null,
        roadMotorabilityRainySeason: null,
        travelTimesToHubs: {
          victoriaIsland: null,
          ikeja: null,
          lekki: null,
          maryland: null,
        },
      },
      amenities: {
        nearestSupermarket: { name: '', distanceKm: null, updatedAt: '', updatedBy: '' },
        nearestHospital: { name: '', distanceKm: null, updatedAt: '', updatedBy: '' },
        nearestAtmBankCount: null,
        nearestFillingStation: { name: '', distanceKm: null, availabilityRating: null, updatedAt: '', updatedBy: '' },
        primarySchoolOptions: { count: null, qualityTier: null, updatedAt: '' },
        secondarySchoolOptions: { count: null, qualityTier: null, updatedAt: '' },
        restaurantDensityRating: { density: null, qualityRating: null },
        nearestWorshipPlace: { name: '', distanceKm: null, updatedAt: '', updatedBy: '' },
        gymFacilityCount: null,
        marketAccess: { name: '', distanceKm: null, daysOpen: '', updatedAt: '', updatedBy: '' },
      },
      propertyMarket: {
        avgRent1Bed: null,
        avgRent2Bed: null,
        avgRent3Bed: null,
        avgRentDetachedTerrace: null,
        priceAppreciationTrend: null,
        agentDensity: null,
        avgListingTimeDays: null,
        tenantDemandIndex: null,
        vacancyRateEstimate: null,
      },
      community: {
        residentProfile: null,
        communityAssociationStatus: null,
        noiseLevel: null,
        neighbourRelationsRating: null,
        religiousNoiseExposure: null,
        commercialActivityLevel: null,
        expatDiasporaPresence: null,
      },
    },
    rent: {
      override: {
        '1': { min: null, max: null, currency: 'NGN', reason: '' },
        '2': { min: null, max: null, currency: 'NGN', reason: '' },
        '3': { min: null, max: null, currency: 'NGN', reason: '' },
        detached_terrace: { min: null, max: null, currency: 'NGN', reason: '' },
      },
    },
    assets: {
      imageUrl: '',
      imageUrlSchool: '',
      imageUrlStreet: '',
      imageUrlBank: '',
      imageUrlMarket: '',
    },
    legacy: {
      migratedFromLegacyAreaName: '',
      migrationVersion: 1,
      migratedAt: '',
    },
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NeighbourhoodFormData>({
    resolver: zodResolver(neighbourhoodFormSchema) as never,
    defaultValues: defaultValues as never,
  });

  const imageFieldNames = ['assets.imageUrl', 'assets.imageUrlSchool', 'assets.imageUrlStreet', 'assets.imageUrlBank', 'assets.imageUrlMarket'] as const;
  type ImageFieldName = (typeof imageFieldNames)[number];

  const imageValues = useWatch({
    control,
    name: imageFieldNames,
  });

  const watchedAreaName = useWatch({
    control,
    name: 'canonicalName',
  });

  const [localImagePreviews, setLocalImagePreviews] = useState<Record<ImageFieldName, string>>({} as Record<ImageFieldName, string>);

  const getImageUrl = (fieldName: ImageFieldName) => imageValues[imageFieldNames.indexOf(fieldName)] ?? '';

  const getFieldError = (name: string) => {
    if (!name) return undefined;
    const parts = name.split('.');
    let current: unknown = errors as unknown;
    for (const part of parts) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current as { message?: string } | undefined;
  };

  const parseCsvList = (value?: string | string[]): string[] => {
    if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
    return typeof value === 'string'
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
  };

  const parseOptionalDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeNeighbourhoodPayload = (formData: NeighbourhoodFormData) => {
    const locationCoordinates = Array.isArray(formData.location?.coordinates) && formData.location.coordinates.length === 2
      ? formData.location.coordinates.filter((value): value is number => value != null && typeof value === 'number')
      : [];

    return {
      canonicalName: formData.canonicalName?.trim(),
      displayName: formData.displayName?.trim(),
      slug: formData.slug?.trim(),
      lga: formData.lga?.trim() || null,
      state: formData.state?.trim() || 'Lagos',
      country: formData.country?.trim() || 'NG',
      location: {
        type: 'Point',
        coordinates: locationCoordinates.length === 2 ? locationCoordinates : [],
      },
      isActive: formData.isActive ?? true,
      isFeatured: formData.isFeatured ?? false,
      summary: {
        overallScore: formData.summary?.overallScore ?? null,
        dataConfidence: formData.summary?.dataConfidence ?? 'low',
        sourceSummary: parseCsvList(formData.summary?.sourceSummary),
        lastUpdatedAt: parseOptionalDate(formData.summary?.lastUpdatedAt) as Date | null,
        lastUpdatedBy: formData.summary?.lastUpdatedBy?.trim() || null,
      },
      metrics: {
        safety: {
          securityIncidentCount: formData.metrics?.safety?.securityIncidentCount ?? null,
          estateSecurityType: formData.metrics?.safety?.estateSecurityType ?? null,
          incidentHotspots: parseCsvList(formData.metrics?.safety?.incidentHotspots),
          vigilanteWatchPresence: formData.metrics?.safety?.vigilanteWatchPresence ?? null,
          nearestPoliceStation: formData.metrics?.safety?.nearestPoliceStation ? {
            distanceKm: formData.metrics.safety.nearestPoliceStation.distanceKm ?? null,
            responseTimeMin: formData.metrics.safety.nearestPoliceStation.responseTimeMin ?? null,
          } : null,
          nightSafetyRating: formData.metrics?.safety?.nightSafetyRating ?? null,
          armedRobberyHistory: formData.metrics?.safety?.armedRobberyHistory ?? null,
        },
        infrastructure: {
          powerSupplyHours: formData.metrics?.infrastructure?.powerSupplyHours ?? null,
          generatorDependency: formData.metrics?.infrastructure?.generatorDependency ?? null,
          waterSupplyType: formData.metrics?.infrastructure?.waterSupplyType ?? null,
          waterQualityRating: formData.metrics?.infrastructure?.waterQualityRating ?? null,
          internetConnectivity: formData.metrics?.infrastructure?.internetConnectivity ?? null,
          roadCondition: formData.metrics?.infrastructure?.roadCondition ?? null,
          drainageQuality: formData.metrics?.infrastructure?.drainageQuality ?? null,
          wasteCollectionReliability: formData.metrics?.infrastructure?.wasteCollectionReliability ?? null,
          streetLightingPct: formData.metrics?.infrastructure?.streetLightingPct ?? null,
        },
        flooding: {
          floodRiskLevel: formData.metrics?.flooding?.floodRiskLevel ?? null,
          floodEventCount: formData.metrics?.flooding?.floodEventCount ?? null,
          floodAffectedStreets: parseCsvList(formData.metrics?.flooding?.floodAffectedStreets),
          floodRecoveryDays: formData.metrics?.flooding?.floodRecoveryDays ?? null,
          elevationClassification: formData.metrics?.flooding?.elevationClassification ?? null,
          canalProximityKm: formData.metrics?.flooding?.canalProximityKm ?? null,
          floodOfRecord: formData.metrics?.flooding?.floodOfRecord ? {
            year: formData.metrics.flooding.floodOfRecord.year ?? null,
            estimatedLevel: formData.metrics.flooding.floodOfRecord.estimatedLevel ?? null,
          } : null,
        },
        transport: {
          distanceToExpresswayKm: formData.metrics?.transport?.distanceToExpresswayKm ?? null,
          trafficCongestionRating: formData.metrics?.transport?.trafficCongestionRating ?? null,
          publicTransportAccess: (formData.metrics?.transport?.publicTransportAccess ?? []).filter((item) => item?.mode || item?.availability).map((item) => ({
            mode: item.mode ?? null,
            availability: item.availability ?? null,
          })),
          commuteTimeIslandMin: formData.metrics?.transport?.commuteTimeIslandMin ?? null,
          commuteTimeIkejaMin: formData.metrics?.transport?.commuteTimeIkejaMin ?? null,
          parkingAvailability: formData.metrics?.transport?.parkingAvailability ?? null,
          roadMotorabilityRainySeason: formData.metrics?.transport?.roadMotorabilityRainySeason ?? null,
          travelTimesToHubs: {
            victoriaIsland: formData.metrics?.transport?.travelTimesToHubs?.victoriaIsland ?? null,
            ikeja: formData.metrics?.transport?.travelTimesToHubs?.ikeja ?? null,
            lekki: formData.metrics?.transport?.travelTimesToHubs?.lekki ?? null,
            maryland: formData.metrics?.transport?.travelTimesToHubs?.maryland ?? null,
          },
        },
        amenities: {
          nearestSupermarket: formData.metrics?.amenities?.nearestSupermarket?.name || formData.metrics?.amenities?.nearestSupermarket?.distanceKm != null
            ? {
              name: formData.metrics?.amenities?.nearestSupermarket?.name?.trim() || null,
              distanceKm: formData.metrics?.amenities?.nearestSupermarket?.distanceKm ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.nearestSupermarket?.updatedAt) as Date | null,
              updatedBy: formData.metrics?.amenities?.nearestSupermarket?.updatedBy?.trim() || null,
            }
            : null,
          nearestHospital: formData.metrics?.amenities?.nearestHospital?.name || formData.metrics?.amenities?.nearestHospital?.distanceKm != null
            ? {
              name: formData.metrics?.amenities?.nearestHospital?.name?.trim() || null,
              distanceKm: formData.metrics?.amenities?.nearestHospital?.distanceKm ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.nearestHospital?.updatedAt) as Date | null,
              updatedBy: formData.metrics?.amenities?.nearestHospital?.updatedBy?.trim() || null,
            }
            : null,
          nearestAtmBankCount: formData.metrics?.amenities?.nearestAtmBankCount ?? null,
          nearestFillingStation: formData.metrics?.amenities?.nearestFillingStation?.name || formData.metrics?.amenities?.nearestFillingStation?.distanceKm != null
            ? {
              name: formData.metrics?.amenities?.nearestFillingStation?.name?.trim() || null,
              distanceKm: formData.metrics?.amenities?.nearestFillingStation?.distanceKm ?? null,
              availabilityRating: formData.metrics?.amenities?.nearestFillingStation?.availabilityRating ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.nearestFillingStation?.updatedAt) as Date | null,
              updatedBy: formData.metrics?.amenities?.nearestFillingStation?.updatedBy?.trim() || null,
            }
            : null,
          primarySchoolOptions: formData.metrics?.amenities?.primarySchoolOptions?.count != null || formData.metrics?.amenities?.primarySchoolOptions?.qualityTier
            ? {
              count: formData.metrics?.amenities?.primarySchoolOptions?.count ?? null,
              qualityTier: formData.metrics?.amenities?.primarySchoolOptions?.qualityTier ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.primarySchoolOptions?.updatedAt) as Date | null,
            }
            : null,
          secondarySchoolOptions: formData.metrics?.amenities?.secondarySchoolOptions?.count != null || formData.metrics?.amenities?.secondarySchoolOptions?.qualityTier
            ? {
              count: formData.metrics?.amenities?.secondarySchoolOptions?.count ?? null,
              qualityTier: formData.metrics?.amenities?.secondarySchoolOptions?.qualityTier ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.secondarySchoolOptions?.updatedAt) as Date | null,
            }
            : null,
          restaurantDensityRating: formData.metrics?.amenities?.restaurantDensityRating?.density || formData.metrics?.amenities?.restaurantDensityRating?.qualityRating != null
            ? {
              density: formData.metrics?.amenities?.restaurantDensityRating?.density ?? null,
              qualityRating: formData.metrics?.amenities?.restaurantDensityRating?.qualityRating ?? null,
            }
            : null,
          nearestWorshipPlace: formData.metrics?.amenities?.nearestWorshipPlace?.name || formData.metrics?.amenities?.nearestWorshipPlace?.distanceKm != null
            ? {
              name: formData.metrics?.amenities?.nearestWorshipPlace?.name?.trim() || null,
              distanceKm: formData.metrics?.amenities?.nearestWorshipPlace?.distanceKm ?? null,
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.nearestWorshipPlace?.updatedAt) as Date | null,
              updatedBy: formData.metrics?.amenities?.nearestWorshipPlace?.updatedBy?.trim() || null,
            }
            : null,
          gymFacilityCount: formData.metrics?.amenities?.gymFacilityCount ?? null,
          marketAccess: formData.metrics?.amenities?.marketAccess?.name || formData.metrics?.amenities?.marketAccess?.distanceKm != null
            ? {
              name: formData.metrics?.amenities?.marketAccess?.name?.trim() || null,
              distanceKm: formData.metrics?.amenities?.marketAccess?.distanceKm ?? null,
              daysOpen: parseCsvList(formData.metrics?.amenities?.marketAccess?.daysOpen),
              updatedAt: parseOptionalDate(formData.metrics?.amenities?.marketAccess?.updatedAt) as Date | null,
              updatedBy: formData.metrics?.amenities?.marketAccess?.updatedBy?.trim() || null,
            }
            : null,
        },
        propertyMarket: {
          avgRent1Bed: formData.metrics?.propertyMarket?.avgRent1Bed ?? null,
          avgRent2Bed: formData.metrics?.propertyMarket?.avgRent2Bed ?? null,
          avgRent3Bed: formData.metrics?.propertyMarket?.avgRent3Bed ?? null,
          avgRentDetachedTerrace: formData.metrics?.propertyMarket?.avgRentDetachedTerrace ?? null,
          priceAppreciationTrend: formData.metrics?.propertyMarket?.priceAppreciationTrend ?? null,
          agentDensity: formData.metrics?.propertyMarket?.agentDensity ?? null,
          avgListingTimeDays: formData.metrics?.propertyMarket?.avgListingTimeDays ?? null,
          tenantDemandIndex: formData.metrics?.propertyMarket?.tenantDemandIndex ?? null,
          vacancyRateEstimate: formData.metrics?.propertyMarket?.vacancyRateEstimate ?? null,
        },
        community: {
          residentProfile: formData.metrics?.community?.residentProfile ?? null,
          communityAssociationStatus: formData.metrics?.community?.communityAssociationStatus ?? null,
          noiseLevel: formData.metrics?.community?.noiseLevel ?? null,
          neighbourRelationsRating: formData.metrics?.community?.neighbourRelationsRating ?? null,
          religiousNoiseExposure: formData.metrics?.community?.religiousNoiseExposure ?? null,
          commercialActivityLevel: formData.metrics?.community?.commercialActivityLevel ?? null,
          expatDiasporaPresence: formData.metrics?.community?.expatDiasporaPresence ?? null,
        },
      },
      rent: {
        override: Object.fromEntries(DEFAULT_RENT_BUCKETS.map((bucket) => {
          const bucketValue = formData.rent?.override?.[bucket as RentBucketKey];
          return [bucket, {
            min: bucketValue?.min ?? null,
            max: bucketValue?.max ?? null,
            currency: bucketValue?.currency?.trim() || 'NGN',
            reason: bucketValue?.reason?.trim() || null,
            updatedAt: parseOptionalDate(bucketValue?.updatedAt) as Date | null,
            updatedBy: bucketValue?.updatedBy?.trim() || null,
          }];
        })),
      },
      assets: {
        imageUrl: formData.assets?.imageUrl?.trim() || null,
        imageUrlSchool: formData.assets?.imageUrlSchool?.trim() || null,
        imageUrlStreet: formData.assets?.imageUrlStreet?.trim() || null,
        imageUrlBank: formData.assets?.imageUrlBank?.trim() || null,
        imageUrlMarket: formData.assets?.imageUrlMarket?.trim() || null,
      },
      legacy: {
        migratedFromLegacyAreaName: formData.legacy?.migratedFromLegacyAreaName?.trim() || null,
        migrationVersion: formData.legacy?.migrationVersion ?? 1,
        migratedAt: parseOptionalDate(formData.legacy?.migratedAt) as Date | null,
      },
    };
  };

  const handleImageFileUpload = async (fieldName: ImageFieldName, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalImagePreviews((current) => ({ ...current, [fieldName]: previewUrl }));

    try {
      const imageTypeMap: Record<ImageFieldName, string> = {
        'assets.imageUrl': 'hero',
        'assets.imageUrlSchool': 'school',
        'assets.imageUrlStreet': 'street',
        'assets.imageUrlBank': 'bank',
        'assets.imageUrlMarket': 'market',
      };

      const areaNameForUpload = selectedAreaId || watchedAreaName || '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('areaName', areaNameForUpload);
      formData.append('imageType', imageTypeMap[fieldName]);

      const response = await fetch('/api/neighbourhood/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const result = await response.json();
      const imageUrl = result.data?.imageUrl;

      if (imageUrl) {
        setValue(fieldName, imageUrl, { shouldValidate: true });
        setLocalImagePreviews((current) => {
          const next = { ...current };
          delete next[fieldName];
          return next;
        });
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      setLocalImagePreviews((current) => {
        const next = { ...current };
        delete next[fieldName];
        return next;
      });
      setValue(fieldName, '', { shouldValidate: true });
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleImageDrop = (fieldName: ImageFieldName, event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFileUpload(fieldName, file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const clearImageField = (fieldName: ImageFieldName) => {
    setLocalImagePreviews((current) => {
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
    setValue(fieldName, '', { shouldValidate: true });
  };

  const selectAreaLocal = (areaName: string) => {
    setSelectedAreaId(areaName);
    const area = areas.find((item) => item.areaName === areaName);
    if (area) {
      reset({
        ...defaultValues,
        canonicalName: area.areaName ?? '',
        displayName: area.displayName ?? area.areaName ?? '',
        slug: area.slug ?? area.areaName ?? '',
        lga: area.lga ?? '',
        isFeatured: area.isFeatured ?? false,
        isActive: area.isActive ?? true,
        summary: {
          ...defaultValues.summary,
          overallScore: area.overallScore ?? null,
          dataConfidence: area.dataConfidence ?? 'low',
          sourceSummary: (area.dataSources ?? []).join(', '),
        },
        assets: {
          ...defaultValues.assets,
          imageUrl: area.imageUrl ?? '',
          imageUrlSchool: area.imageUrlSchool ?? '',
          imageUrlStreet: area.imageUrlStreet ?? '',
          imageUrlBank: area.imageUrlBank ?? '',
          imageUrlMarket: area.imageUrlMarket ?? '',
        },
        rent: {
          override: {
            '1': { min: null, max: null, currency: 'NGN', reason: '' },
            '2': { min: null, max: null, currency: 'NGN', reason: '' },
            '3': { min: null, max: null, currency: 'NGN', reason: '' },
            detached_terrace: { min: null, max: null, currency: 'NGN', reason: '' },
          },
        },
      });
    } else {
      reset(defaultValues);
    }
  };

  useEffect(() => {
    if (selectedAreaName !== undefined && selectedAreaName !== selectedAreaId) {
      setTimeout(() => selectAreaLocal(selectedAreaName), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaName]);

  const onSubmit: SubmitHandler<NeighbourhoodFormData> = async (data) => {
    setIsSaved(false);
    try {
      const targetArea = (data.canonicalName || data.displayName || '').trim();
      if (!targetArea) throw new Error('Canonical name or display name is required to save');
      const payload = normalizeNeighbourhoodPayload(data);
      await neighbourhoodApi.updateAreaScores(targetArea, payload as unknown as Record<string, unknown>);
      setIsSaved(true);
      toast.success(`Neighbourhood ${targetArea} saved successfully`);
      queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.lists() });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Failed to save neighbourhood', err);
      const message = err instanceof Error ? err.message : 'Failed to save neighbourhood';
      toast.error(message || 'Failed to save neighbourhood');
    }
  };

  const onSubmitInvalid: SubmitErrorHandler<NeighbourhoodFormData> = (validationErrors) => {
    console.error('Neighbourhood form validation failed', validationErrors);
    toast.error('Please fix the highlighted fields and try again.');
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Create or edit a neighbourhood</h2>
          <p className="mt-1 text-sm text-slate-500">Fill the full schema-backed neighbourhood profile and save it to the backend.</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit, onSubmitInvalid)} noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Existing neighbourhood</label>
          <select
            value={selectedAreaId}
            onChange={(e) => { selectAreaLocal(e.target.value); if (onSelectArea) onSelectArea(e.target.value); }}
            className={inputClass(false)}
          >
            <option value="">Create new neighbourhood</option>
            {areas.length > 0 && (
              <optgroup label="Existing neighbourhoods">
                {areas.map((area) => (
                  <option key={area.areaName} value={area.areaName}>
                    {area.displayName ? `${area.displayName} (${area.areaName})` : area.areaName}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">Pick an existing neighbourhood to edit its data, or leave as "Create new" to start a fresh record.</p>
        </div>

        <div className="grid gap-4">
          {sectionData.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
              <div className="mb-5 flex items-center gap-3">
                <section.icon className="h-5 w-5 text-[#00C9A7]" />
                <h3 className="text-lg font-semibold text-[#0F172A]">{section.title}</h3>
              </div>
              {section.description && (
                <p className="mb-5 text-sm text-slate-500">{section.description}</p>
              )}
              {section.title === 'Rent overrides' ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {DEFAULT_RENT_BUCKETS.map((bucket) => (
                    <div key={bucket} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="mb-4 font-semibold text-slate-800">{bucket === 'detached_terrace' ? 'Detached / terrace' : `${bucket}-bed`}</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Min</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 1500000"
                            {...register(`rent.override.${bucket}.min`, { valueAsNumber: true, setValueAs: (value) => (value === '' ? null : value) })}
                            className={inputClass(Boolean(getFieldError(`rent.override.${bucket}.min`))) }
                          />
                          <p className="mt-1 text-xs text-slate-500">Lowest annual rent (₦) you want shown for this property type.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Max</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 2500000"
                            {...register(`rent.override.${bucket}.max`, { valueAsNumber: true, setValueAs: (value) => (value === '' ? null : value) })}
                            className={inputClass(Boolean(getFieldError(`rent.override.${bucket}.max`))) }
                          />
                          <p className="mt-1 text-xs text-slate-500">Highest annual rent (₦) you want shown for this property type.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                          <input
                            type="text"
                            {...register(`rent.override.${bucket}.currency`)}
                            placeholder="NGN"
                            className={inputClass(Boolean(getFieldError(`rent.override.${bucket}.currency`))) }
                          />
                          <p className="mt-1 text-xs text-slate-500">Normally NGN — only change for unusual cases.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                          <input
                            type="text"
                            {...register(`rent.override.${bucket}.reason`)}
                            placeholder="e.g. Verified from 3 active listings, June 2026"
                            className={inputClass(Boolean(getFieldError(`rent.override.${bucket}.reason`))) }
                          />
                          <p className="mt-1 text-xs text-slate-500">Short note on why this override exists, so a future admin knows it wasn't a mistake.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => {
                    const error = getFieldError(field.name as string);
                    const registerProps = field.type === 'number'
                      ? register(field.name as Path<NeighbourhoodFormData>, { valueAsNumber: true, setValueAs: (value) => (value === '' ? null : value) })
                      : register(field.name as Path<NeighbourhoodFormData>);

                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            {...registerProps}
                            rows={4}
                            className={inputClass(Boolean(error))}
                            placeholder={field.placeholder || ''}
                          />
                        ) : field.type === 'select' ? (
                          <select {...registerProps} className={inputClass(Boolean(error))}>
                            <option value="">Select</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.name.includes('assets.imageUrl') ? (
                          <div className="space-y-3">
                            <label
                              className="group block rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                              onDrop={(event) => handleImageDrop(field.name as ImageFieldName, event)}
                              onDragOver={handleDragOver}
                            >
                              <div className="flex min-h-26 items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-slate-800">Click or drop an image file</p>
                                  <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A1628]/90 transition-colors">
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      if (file) handleImageFileUpload(field.name as ImageFieldName, file);
                                    }}
                                  />
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder={field.placeholder || 'Paste image URL'}
                                {...register(field.name as Path<NeighbourhoodFormData>)}
                                className={inputClass(Boolean(error))}
                              />
                            </label>
                            {(() => {
                              const imageFieldName = field.name as ImageFieldName;
                              const previewUrl = localImagePreviews[imageFieldName] || getImageUrl(imageFieldName);
                              return previewUrl ? (
                                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                                  <img src={previewUrl} alt={field.label} className="h-48 w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => clearImageField(imageFieldName)}
                                    className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white hover:bg-black/70"
                                  >
                                    Clear
                                  </button>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              {...register(field.name as Path<NeighbourhoodFormData>)}
                              className="h-4 w-4 rounded border-slate-300 text-[#00C9A7] focus:ring-[#00C9A7]"
                            />
                            {field.label}
                          </label>
                        ) : (
                          <input
                            type={field.type}
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder || ''}
                            {...registerProps}
                            className={inputClass(Boolean(error))}
                          />
                        )}
                        {field.helper && <p className="mt-1 text-xs text-slate-500">{field.helper}</p>}
                        {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Neighbourhood saves are sent to the backend via the admin API.</p>
            {Object.keys(errors).length > 0 && (
              <p className="mt-2 text-sm font-medium text-red-600">Please fix the highlighted fields and try again.</p>
            )}
            {isSaved && <p className="mt-2 text-sm text-[#0F172A]">Saved successfully to the backend.</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#0A1628] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0A1628]/90 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save neighbourhood'}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputClass = (hasError: boolean) => cn(
  'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors',
  hasError
    ? 'border-red-300 focus:ring-red-200'
    : 'border-slate-200 focus:border-[#00C9A7] focus:ring-[#00C9A7]/20'
);

export default NeighbourhoodDataForm;