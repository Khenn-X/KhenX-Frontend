import { z } from 'zod';

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