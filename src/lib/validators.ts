import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['seeker', 'agent']).default('seeker'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Listing ──────────────────────────────────────────────────────────────────

const optionalCoercedNumber = (min = 0, message = 'Must be at least 0') =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
        return undefined;
      }
      return value;
    },
    z.coerce.number().min(min, message).optional()
  );

const landPropertyTypeSchema = z.string().superRefine((value, ctx) => {
  if (value !== 'land') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Property type must be "land" for land listings',
    });
  }
});

const buildingPropertyTypeSchema = z.string().superRefine((value, ctx) => {
  const allowedBuildingPropertyTypes = ['apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached_house', 'semi_detached', 'penthouse', 'studio', 'office', 'shop', 'commercial'];

  if (value === 'land') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Property type "land" is not valid for building listings',
    });
    return;
  }

  if (!allowedBuildingPropertyTypes.includes(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select a property type',
    });
  }
});

export const baseListingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  propertyCategory: z.enum(['land', 'building'], { error: 'Please select a property category' }),
  propertyType: z.enum(
    ['apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached_house', 'semi_detached', 'penthouse', 'studio', 'office', 'shop', 'land', 'commercial'],
    { error: 'Please select a property type' }
  ),
  listingType: z.enum(['rent', 'sale', 'short-let'], {
    error: 'Please select a listing type',
  }),
  bedrooms: optionalCoercedNumber(0, 'Bedrooms cannot be negative'),
  bathrooms: optionalCoercedNumber(0, 'Bathrooms cannot be negative'),
  areaName: z.string().min(2, 'Area name is required'),
  neighbourhoodId: z.string().nullable().optional(),
  estateName: z.string().optional(),
  coordinates: z
    .object({
      latitude: optionalCoercedNumber(-90, 'Latitude must be >= -90').refine((value) => value === undefined || value <= 90, {
        message: 'Latitude must be <= 90',
      }),
      longitude: optionalCoercedNumber(-180, 'Longitude must be >= -180').refine((value) => value === undefined || value <= 180, {
        message: 'Longitude must be <= 180',
      }),
    })
    .optional(),
  lga: z.string().optional(),
  state: z.string().optional(),
  nearbyLandmark: z.string().optional(),
  price: z.coerce.number({ error: 'Please enter a valid price' }).positive('Price must be greater than zero'),
  pricePeriod: z.enum(['yearly', 'monthly', 'nightly', 'one-time'], {
    error: 'Please select a price period',
  }),
  serviceCharge: optionalCoercedNumber(0, 'Service charge cannot be negative'),
  features: z.object({
    generator: z.boolean().default(false),
    borehole: z.boolean().default(false),
    security: z.boolean().default(false),
    parking: z.boolean().default(false),
    gym: z.boolean().default(false),
    pool: z.boolean().default(false),
    cctv: z.boolean().default(false),
    internet: z.boolean().default(false),
  }),
  nearbyPlaces: z
    .object({
      schools: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      hospitals: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      shoppingMalls: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      markets: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      churches: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      mosques: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      fuelStations: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      policeStations: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
    })
    .optional(),
  nearbyAmenities: z
    .object({
      schools: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      hospitals: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      malls: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      markets: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      supermarkets: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      churches: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      mosques: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      banks: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      fuelStations: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
      pharmacies: z.array(z.object({ name: z.string().optional(), distanceKm: optionalCoercedNumber(0), notes: z.string().optional() })).optional(),
    })
    .optional(),
});

const landDetailsSchema = z
  .object({
    purpose: z.enum(['sale', 'lease']).optional(),
    pricePerSquareMeter: optionalCoercedNumber(0, 'Must be at least 0'),
    plotSizeSqm: optionalCoercedNumber(0, 'Must be at least 0'),
    totalLandAreaSqm: optionalCoercedNumber(0, 'Must be at least 0'),
    numberOfPlots: optionalCoercedNumber(0, 'Must be at least 0'),
    landShape: z.enum(['rectangular', 'square', 'irregular']).optional(),
    topography: z.enum(['flat', 'sloping']).optional(),
    landCondition: z.enum(['dry_land', 'swampy_land', 'sand_filled', 'reclaimed_land', 'rocky_land']).optional(),
    soilType: z.string().optional(),
    fenced: z.boolean().optional(),
    gated: z.boolean().optional(),
    surveyed: z.boolean().optional(),
    cornerPiece: z.boolean().optional(),
    waterfront: z.boolean().optional(),
    facingMajorRoad: z.boolean().optional(),
    insideEstate: z.boolean().optional(),
    orientation: z.string().optional(),
    titleTypes: z.array(
      z.enum([
        'certificate_of_occupancy',
        'governors_consent',
        'gazette',
        'registered_survey',
        'excision',
        'deed_of_assignment',
        'allocation_letter',
        'registered_deed',
        'family_receipt',
        'receipt_and_survey',
        'freehold',
      ])
    )
    .optional(),
    titleStatus: z.enum(['verified', 'pending', 'unverified']).optional(),
    utilities: z
      .object({
        electricityNearby: z.boolean().optional(),
        waterSupply: z.boolean().optional(),
        boreholeAccess: z.boolean().optional(),
        drainage: z.boolean().optional(),
        internetCoverage: z.boolean().optional(),
        roadAccess: z.boolean().optional(),
        streetLighting: z.boolean().optional(),
        sewage: z.boolean().optional(),
      })
      .optional(),
    developmentPotential: z.array(z.string()).optional(),
    roadType: z.enum(['tarred_road', 'untarred_road']).optional(),
    distanceToExpresswayKm: optionalCoercedNumber(0, 'Must be at least 0'),
    distanceToMajorRoadKm: optionalCoercedNumber(0, 'Must be at least 0'),
    publicTransportAccess: z.string().optional(),
    estateInfo: z
      .object({
        gatedEstate: z.boolean().optional(),
        security: z.boolean().optional(),
        estateFees: optionalCoercedNumber(0, 'Must be at least 0'),
        buildingRestrictions: z.string().optional(),
        developmentStage: z.string().optional(),
      })
      .optional(),
  })
  .optional();

const buildingDetailsSchema = z
  .object({
    toilets: optionalCoercedNumber(0, 'Must be at least 0'),
    floors: optionalCoercedNumber(0, 'Must be at least 0'),
    livingRooms: optionalCoercedNumber(0, 'Must be at least 0'),
    diningArea: z.boolean().optional(),
    kitchen: z.boolean().optional(),
    balcony: z.boolean().optional(),
    studyRoom: z.boolean().optional(),
    maidsRoom: z.boolean().optional(),
    storeRoom: z.boolean().optional(),
    laundryRoom: z.boolean().optional(),
    walkInCloset: z.boolean().optional(),
    terrace: z.boolean().optional(),
    penthouseLevel: optionalCoercedNumber(0, 'Must be at least 0'),
    totalFloorAreaSqm: optionalCoercedNumber(0, 'Must be at least 0'),
    landSizeSqm: optionalCoercedNumber(0, 'Must be at least 0'),
    yearBuilt: optionalCoercedNumber(1800, 'Year built is invalid').refine((value) => value === undefined || value >= 1800, {
      message: 'Year built is invalid',
    }),
    lastRenovated: z.string().optional(),
    interiorFeatures: z
      .object({
        popCeiling: z.boolean().optional(),
        tiles: z.boolean().optional(),
        marbleFlooring: z.boolean().optional(),
        woodenFloor: z.boolean().optional(),
        airConditioning: z.boolean().optional(),
        waterHeater: z.boolean().optional(),
        fittedKitchen: z.boolean().optional(),
        kitchenCabinets: z.boolean().optional(),
        oven: z.boolean().optional(),
        microwave: z.boolean().optional(),
        refrigerator: z.boolean().optional(),
        smartHomeFeatures: z.boolean().optional(),
        cctv: z.boolean().optional(),
        intercom: z.boolean().optional(),
        smokeDetector: z.boolean().optional(),
        fireAlarm: z.boolean().optional(),
      })
      .optional(),
    exteriorFeatures: z
      .object({
        swimmingPool: z.boolean().optional(),
        gym: z.boolean().optional(),
        garden: z.boolean().optional(),
        playground: z.boolean().optional(),
        parkingSpaces: optionalCoercedNumber(0, 'Must be at least 0'),
        carport: z.boolean().optional(),
        securityHouse: z.boolean().optional(),
        fence: z.boolean().optional(),
        gate: z.boolean().optional(),
        generator: z.boolean().optional(),
        borehole: z.boolean().optional(),
        waterTank: z.boolean().optional(),
        solarPower: z.boolean().optional(),
        elevator: z.boolean().optional(),
        rooftopLounge: z.boolean().optional(),
      })
      .optional(),
    utilities: z
      .object({
        electricity: z.boolean().optional(),
        waterSupply: z.boolean().optional(),
        borehole: z.boolean().optional(),
        internet: z.boolean().optional(),
        cableTv: z.boolean().optional(),
        sewage: z.boolean().optional(),
        drainage: z.boolean().optional(),
        wasteDisposal: z.boolean().optional(),
      })
      .optional(),
    securityFeatures: z
      .object({
        estateSecurity: z.boolean().optional(),
        cctv: z.boolean().optional(),
        gatedCommunity: z.boolean().optional(),
        accessControl: z.boolean().optional(),
        securityGuards: z.boolean().optional(),
        electricFence: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

const landListingSchema = baseListingSchema.extend({
  propertyCategory: z.literal('land'),
  propertyType: landPropertyTypeSchema,
  pricePeriod: z.enum(['yearly', 'one-time'], { error: 'Please select a price period' }),
  bedrooms: z.undefined().optional(),
  bathrooms: z.undefined().optional(),
  landDetails: landDetailsSchema,
  buildingDetails: z.unknown().superRefine((value, ctx) => {
    if (value !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Building details are not valid for land listings',
      });
    }
  }).optional(),
});

const buildingListingSchema = baseListingSchema.extend({
  propertyCategory: z.literal('building'),
  propertyType: buildingPropertyTypeSchema,
  pricePeriod: z.enum(['yearly', 'monthly', 'nightly'], { error: 'Please select a price period' }),
  landDetails: z.unknown().superRefine((value, ctx) => {
    if (value !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Land details are not valid for building listings',
      });
    }
  }).optional(),
  buildingDetails: buildingDetailsSchema,
});

export const listingSchema = z.discriminatedUnion('propertyCategory', [landListingSchema, buildingListingSchema]).superRefine((data, ctx) => {
  if (data.propertyCategory === 'building') {
    if (data.bedrooms == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bedrooms'],
        message: 'Bedrooms are required for building listings',
      });
    }

    if (data.bathrooms == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bathrooms'],
        message: 'Bathrooms are required for building listings',
      });
    }
  }

});

// ─── Enquiry ──────────────────────────────────────────────────────────────────

export const enquirySchema = z.object({
  seekerName: z.string().min(2, 'Name must be at least 2 characters'),
  seekerEmail: z.string().email('Please enter a valid email address'),
  seekerPhone: z
    .string()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number')
    .optional()
    .or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// ─── Neighbourhood ────────────────────────────────────────────────────────────

export const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  areaName: z.string().min(2, 'Please enter an area name'),
});


// Simple resident report (used inside listing/neighbourhood pages)
export const residentReportSchema = z.object({
  areaName:           z.string().min(1, 'Please select your area'),
  reporterEmail:      z.string().email().optional().or(z.literal('')),
  powerHoursDaily:    z.number().min(0).max(24).optional(),
  floodedLastSeason:  z.boolean().optional(),
  floodSeverity:      z.enum(['none','minor','moderate','severe']).optional(),
  securityRating:     z.number().int().min(1).max(5).optional(),
  incidentCategory:   z.enum(['none','petty_theft','robbery','area_boys','other']).optional(),
}).refine(
  d => d.powerHoursDaily !== undefined || d.floodedLastSeason !== undefined || d.securityRating !== undefined,
  { message: 'Please fill in at least one section', path: ['areaName'] }
);

// ─── NEW: Full neighbourhood update schema ─────────────────────
// Used in NeighbourhoodReportForm (ContributeDataPage)
export const neighbourhoodUpdateSchema = z.object({

  // ── Reporter info ──────────────────────────────────────────
  reporterEmail:  z.string().email('Please enter a valid email').optional().or(z.literal('')),
  reporterName:   z.string().optional(),
  areaName:       z.string().min(1, 'Please select your area'),
  streetEstate:   z.string().min(2, 'Please enter your street or estate name'),
  reportDate:     z.string().min(1, 'Please select a date'),

  // ── Season selector — drives conditional sections ──────────
  season: z.enum(['rainy', 'dry'], {
    error: 'Please select the current season',
  }),

  // ── Power supply (both seasons) ────────────────────────────
  powerHoursDaily: z.enum([
    'none',        // 0 hours
    'low',         // 1–6 hours
    'moderate',    // 7–12 hours
    'good',        // 13–20 hours
    'excellent',   // 21–24 hours
  ], { error: 'Please select your daily power hours' }),

  powerTrend: z.enum(['better', 'same', 'worse']).optional(),

  // ── Water supply (both seasons — different concerns) ───────
  waterSource: z.enum([
    'public_mains',
    'borehole',
    'tanker',
    'no_reliable_source',
  ], { error: 'Please select your main water source' }),

  // Dry season only — borehole status
  boreholeStatus: z.enum(['functioning', 'reduced_flow', 'dry']).optional(),

  // Rainy season only — water affected by flooding
  waterAffectedByFlood: z.boolean().optional(),

  // ── Flooding — rainy season only ──────────────────────────
  floodingLevel: z.enum([
    'none',
    'minor',     // puddles, slow drainage
    'moderate',  // ankle-to-knee deep
    'severe',    // waist deep or worse
  ]).optional(),

  drainageRating: z.number().int().min(1).max(5).optional(),

  // ── Harmattan / dry season only ───────────────────────────
  dustIntensity: z.enum([
    'none',
    'mild',
    'moderate',
    'heavy',
  ]).optional(),

  fireIncidentNearby: z.boolean().optional(),

  // ── Security (both seasons) ────────────────────────────────
  securityIncidents: z.enum(['none', 'one', 'multiple']).optional(),

  incidentTypes: z.array(
    z.enum(['robbery_burglary', 'phone_bag_snatching', 'car_theft', 'attempted_break_in', 'other'])
  ).optional(),

  nightSafetyRating:    z.number().int().min(1).max(5).optional(),
  vigilantePresent:     z.enum(['yes_active', 'yes_rarely', 'no']).optional(),

  // ── Roads (both seasons) ───────────────────────────────────
  roadCondition: z.enum([
    'good',      // tarred, no major issues
    'fair',      // some potholes
    'poor',      // badly damaged
    'impassable',
  ]).optional(),

  roadChangedRecently: z.enum(['no_change', 'got_worse', 'got_better']).optional(),

  // ── Street environment (both seasons) ─────────────────────
  streetLighting:  z.enum(['fully_lit', 'partially_lit', 'not_lit']).optional(),
  noiseLevel:      z.number().int().min(1).max(5).optional(),

  // ── Open notes ────────────────────────────────────────────
  additionalNotes: z.string().max(500).optional(),
});

export type NeighbourhoodUpdateFormData = z.infer<typeof neighbourhoodUpdateSchema>;

// ─── Agent Profile ────────────────────────────────────────────────────────────

export const agentProfileSchema = z.object({
  businessName: z.string().optional(),
  phone: z
    .string()
    .regex(/^(\+234|0)[789][01]\d{8}$/, 'Please enter a valid Nigerian phone number')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

// ─── Admin Actions ────────────────────────────────────────────────────────────

export const rejectReasonSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason of at least 10 characters'),
});

export const suspendAgentSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason of at least 10 characters'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ListingFormData = z.infer<typeof baseListingSchema>;
export type ListingSubmissionData = z.infer<typeof listingSchema>;

export const normalizeListingSubmissionData = (data: ListingFormData): ListingFormData => {
  const basePayload: ListingFormData = {
    ...data,
    serviceCharge: data.serviceCharge ?? 0,
    nearbyPlaces: data.nearbyPlaces ?? ((data as ListingFormData & { landDetails?: { nearbyPlaces?: ListingFormData['nearbyPlaces'] } }).landDetails?.nearbyPlaces),
    nearbyAmenities: data.nearbyAmenities ?? ((data as ListingFormData & { buildingDetails?: { nearbyAmenities?: ListingFormData['nearbyAmenities'] } }).buildingDetails?.nearbyAmenities),
  } as ListingFormData;

  if (data.propertyCategory === 'land') {
    const { bedrooms: _bedrooms, bathrooms: _bathrooms, buildingDetails: _buildingDetails, ...rest } = basePayload as Record<string, unknown>;
    void _bedrooms;
    void _bathrooms;
    void _buildingDetails;
    return rest as ListingFormData;
  }

  if (data.propertyCategory === 'building') {
    const { landDetails: _landDetails, ...rest } = basePayload as Record<string, unknown>;
    void _landDetails;
    return rest as ListingFormData;
  }

  return basePayload;
};
export type EnquiryFormData = z.infer<typeof enquirySchema>;
export type WaitlistFormData = z.infer<typeof waitlistSchema>;
export type ResidentReportFormData = z.infer<typeof residentReportSchema>;
export type AgentProfileFormData = z.infer<typeof agentProfileSchema>;
export type RejectReasonFormData = z.infer<typeof rejectReasonSchema>;
export type SuspendAgentFormData = z.infer<typeof suspendAgentSchema>;
