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

export const residentReportSchema = z.object({
  areaName: z.string().min(2, 'Please select an area'),
  reporterEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  powerHoursDaily: z
    .number()
    .min(0, 'Cannot be negative')
    .max(24, 'Cannot exceed 24 hours')
    .optional(),
  floodedLastSeason: z.boolean().optional(),
  floodSeverity: z.enum(['minor', 'moderate', 'severe']).optional(),
  securityRating: z.number().min(1).max(5).optional(),
  incidentCategory: z.string().optional(),
});

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
