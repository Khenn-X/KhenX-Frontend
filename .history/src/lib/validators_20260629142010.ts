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
  role: z.enum(['seeker', 'agent', 'admin']).default('seeker'),
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

export const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  propertyType: z.enum(
    ['apartment', 'duplex', 'bungalow', 'self-con', 'mini-flat', 'terrace', 'detached'],
    { error: 'Please select a property type' }
  ),
  listingType: z.enum(['rent', 'sale', 'short-let'], {
    error: 'Please select a listing type',
  }),
  bedrooms: z
    .number({ error: 'Please enter number of bedrooms' })
    .min(0, 'Bedrooms cannot be negative'),
  bathrooms: z
    .number({ error: 'Please enter number of bathrooms' })
    .min(1, 'At least 1 bathroom is required'),
  areaName: z.string().min(2, 'Area name is required'),
  estateName: z.string().optional(),
  price: z
    .number({ error: 'Please enter a valid price' })
    .positive('Price must be greater than zero'),
  pricePeriod: z.enum(['yearly', 'monthly', 'nightly'], {
    error: 'Please select a price period',
  }),
  serviceCharge: z.number().positive().optional(),
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


// ─── EXISTING SCHEMAS (unchanged) ─────────────────────────────
export const waitlistSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Please enter a valid email'),
  areaName: z.string().min(1, 'Please select an area'),
});
export type WaitlistFormData = z.infer<typeof waitlistSchema>;

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
export type ResidentReportFormData = z.infer<typeof residentReportSchema>;

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
    required_error: 'Please select the current season',
  }),

  // ── Power supply (both seasons) ────────────────────────────
  powerHoursDaily: z.enum([
    'none',        // 0 hours
    'low',         // 1–6 hours
    'moderate',    // 7–12 hours
    'good',        // 13–20 hours
    'excellent',   // 21–24 hours
  ], { required_error: 'Please select your daily power hours' }),

  powerTrend: z.enum(['better', 'same', 'worse']).optional(),

  // ── Water supply (both seasons — different concerns) ───────
  waterSource: z.enum([
    'public_mains',
    'borehole',
    'tanker',
    'no_reliable_source',
  ], { required_error: 'Please select your main water source' }),

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
export type ListingFormData = z.infer<typeof listingSchema>;
export type EnquiryFormData = z.infer<typeof enquirySchema>;
export type WaitlistFormData = z.infer<typeof waitlistSchema>;
export type ResidentReportFormData = z.infer<typeof residentReportSchema>;
export type AgentProfileFormData = z.infer<typeof agentProfileSchema>;
export type RejectReasonFormData = z.infer<typeof rejectReasonSchema>;
export type SuspendAgentFormData = z.infer<typeof suspendAgentSchema>;
