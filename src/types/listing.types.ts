export type PropertyCategory = 'land' | 'building';

export type PropertyType =
  | 'apartment'
  | 'duplex'
  | 'bungalow'
  | 'self-con'
  | 'mini-flat'
  | 'terrace'
  | 'detached_house'
  | 'semi_detached'
  | 'penthouse'
  | 'studio'
  | 'office'
  | 'shop'
  | 'land'
  | 'commercial';

export type ListingType = 'rent' | 'sale' | 'short-let';
export type ListingStatus = 'pending' | 'active' | 'paused' | 'rejected';
export type PricePeriod = 'yearly' | 'monthly' | 'nightly' | 'one-time';

export interface IListingFeatures {
  generator: boolean;
  borehole: boolean;
  security: boolean;
  parking: boolean;
  gym: boolean;
  pool: boolean;
  cctv: boolean;
  internet: boolean;
}

export interface INearbyItem {
  name?: string;
  distanceKm?: number;
  notes?: string;
}

export interface INearbyPlaces {
  schools?: INearbyItem[];
  hospitals?: INearbyItem[];
  shoppingMalls?: INearbyItem[];
  markets?: INearbyItem[];
  churches?: INearbyItem[];
  mosques?: INearbyItem[];
  fuelStations?: INearbyItem[];
  policeStations?: INearbyItem[];
}

export interface INearbyAmenities {
  schools?: INearbyItem[];
  hospitals?: INearbyItem[];
  malls?: INearbyItem[];
  markets?: INearbyItem[];
  supermarkets?: INearbyItem[];
  churches?: INearbyItem[];
  mosques?: INearbyItem[];
  banks?: INearbyItem[];
  fuelStations?: INearbyItem[];
  pharmacies?: INearbyItem[];
}

export interface ILandDetails {
  purpose?: 'sale' | 'lease';
  pricePerSquareMeter?: number;
  plotSizeSqm?: number;
  totalLandAreaSqm?: number;
  numberOfPlots?: number;
  landShape?: 'rectangular' | 'square' | 'irregular';
  topography?: 'flat' | 'sloping';
  landCondition?: 'dry_land' | 'swampy_land' | 'sand_filled' | 'reclaimed_land' | 'rocky_land';
  soilType?: string;
  fenced?: boolean;
  gated?: boolean;
  surveyed?: boolean;
  cornerPiece?: boolean;
  waterfront?: boolean;
  facingMajorRoad?: boolean;
  insideEstate?: boolean;
  orientation?: string;
  titleTypes?: string[];
  titleStatus?: 'verified' | 'pending' | 'unverified';
  utilities?: {
    electricityNearby?: boolean;
    waterSupply?: boolean;
    boreholeAccess?: boolean;
    drainage?: boolean;
    internetCoverage?: boolean;
    roadAccess?: boolean;
    streetLighting?: boolean;
    sewage?: boolean;
  };
  developmentPotential?: string[];
  roadType?: 'tarred_road' | 'untarred_road';
  distanceToExpresswayKm?: number;
  distanceToMajorRoadKm?: number;
  publicTransportAccess?: string;
  estateInfo?: {
    gatedEstate?: boolean;
    security?: boolean;
    estateFees?: number;
    buildingRestrictions?: string;
    developmentStage?: string;
  };
}

export interface IBuildingDetails {
  toilets?: number;
  floors?: number;
  livingRooms?: number;
  diningArea?: boolean;
  kitchen?: boolean;
  balcony?: boolean;
  studyRoom?: boolean;
  maidsRoom?: boolean;
  storeRoom?: boolean;
  laundryRoom?: boolean;
  walkInCloset?: boolean;
  terrace?: boolean;
  penthouseLevel?: number;
  totalFloorAreaSqm?: number;
  landSizeSqm?: number;
  yearBuilt?: number;
  lastRenovated?: string;
  interiorFeatures?: {
    popCeiling?: boolean;
    tiles?: boolean;
    marbleFlooring?: boolean;
    woodenFloor?: boolean;
    airConditioning?: boolean;
    waterHeater?: boolean;
    fittedKitchen?: boolean;
    kitchenCabinets?: boolean;
    oven?: boolean;
    microwave?: boolean;
    refrigerator?: boolean;
    smartHomeFeatures?: boolean;
    cctv?: boolean;
    intercom?: boolean;
    smokeDetector?: boolean;
    fireAlarm?: boolean;
  };
  exteriorFeatures?: {
    swimmingPool?: boolean;
    gym?: boolean;
    garden?: boolean;
    playground?: boolean;
    parkingSpaces?: number;
    carport?: boolean;
    securityHouse?: boolean;
    fence?: boolean;
    gate?: boolean;
    generator?: boolean;
    borehole?: boolean;
    waterTank?: boolean;
    solarPower?: boolean;
    elevator?: boolean;
    rooftopLounge?: boolean;
  };
  utilities?: {
    electricity?: boolean;
    waterSupply?: boolean;
    borehole?: boolean;
    internet?: boolean;
    cableTv?: boolean;
    sewage?: boolean;
    drainage?: boolean;
    wasteDisposal?: boolean;
  };
  securityFeatures?: {
    estateSecurity?: boolean;
    cctv?: boolean;
    gatedCommunity?: boolean;
    accessControl?: boolean;
    securityGuards?: boolean;
    electricFence?: boolean;
  };
}

export interface IListingOwnerUser {
  _id?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
  createdAt?: string;
}

export interface IListingOwnerProfile {
  _id?: string;
  userId?: IListingOwnerUser | string | null;
  businessName?: string;
  phone?: string;
  bio?: string;
  kycStatus?: string;
  tier?: string;
  verifiedAt?: string;
}

export interface IListing {
  _id: string;
  agentId?: IListingOwnerProfile | string | null;
  landlordId?: IListingOwnerProfile | string | null;
  title: string;
  description: string;
  propertyCategory: PropertyCategory;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  areaName: string;
  neighbourhoodId?: string | null;
  estateName?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  lga?: string;
  state?: string;
  nearbyLandmark?: string;
  price: number;
  pricePeriod: PricePeriod;
  serviceCharge?: number;
  features: IListingFeatures;
  landDetails?: ILandDetails;
  buildingDetails?: IBuildingDetails;
  nearbyPlaces?: INearbyPlaces;
  nearbyAmenities?: INearbyAmenities;
  photos: string[];
  status: ListingStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface CreateListingPayload {
  title: string;
  description: string;
  propertyCategory: PropertyCategory;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  areaName: string;
  neighbourhoodId?: string | null;
  estateName?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  lga?: string;
  state?: string;
  nearbyLandmark?: string;
  price: number;
  pricePeriod: PricePeriod;
  serviceCharge?: number;
  features: IListingFeatures;
  landDetails?: ILandDetails;
  buildingDetails?: IBuildingDetails;
  nearbyPlaces?: INearbyPlaces;
  nearbyAmenities?: INearbyAmenities;
}

export type UpdateListingPayload = Partial<CreateListingPayload>;

// ─── Filter Options (for ListingFilters component) ───────────────────────────

export const PROPERTY_TYPES: PropertyType[] = [
  'apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached_house', 'semi_detached', 'penthouse', 'studio', 'office', 'shop', 'land', 'commercial',
];

export const LAND_PROPERTY_TYPES: PropertyType[] = ['land'];

export const BUILDING_PROPERTY_TYPES: PropertyType[] = [
  'apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached_house', 'semi_detached', 'penthouse', 'studio', 'office', 'shop', 'commercial',
];

export const LISTING_TYPES: ListingType[] = ['rent', 'sale', 'short-let'];

export const PRICE_PERIODS: PricePeriod[] = ['yearly', 'monthly', 'nightly'];

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5, 6];


interface TypeVisual {
  rail: string;
}

// Mirrors the admin card's STATUS_VISUALS pattern, but keyed on listingType
// since public visitors care about rent-vs-sale at a glance, not review status.
export const TYPE_VISUALS: Record<string, TypeVisual> = {
  rent: { rail: '#00C9A7' },
  sale: { rail: '#F59E0B' },
};

export const getTypeVisual = (listingType: string): TypeVisual =>
  TYPE_VISUALS[listingType] ?? TYPE_VISUALS.rent;