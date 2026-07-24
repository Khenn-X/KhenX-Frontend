/**
 * All application route paths as constants.
 * Never hardcode route strings anywhere else — always import from here.
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LISTINGS: '/listings',
  LISTING_DETAIL: (id: string) => `/listings/${id}`,
  NEIGHBOURHOOD: '/neighbourhood',

  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: (token: string) => `/reset-password/${token}`,
  VERIFY_EMAIL: '/verify-email',

  // Seeker
  DASHBOARD: '/dashboard',
  SAVED: '/saved',

  // Agent
  AGENT_DASHBOARD: '/agent/dashboard',
  AGENT_LISTINGS: '/agent/listings',
  
  AGENT_LISTINGS_NEW: '/agent/listings/new',
  AGENT_LISTING_EDIT: (id: string) => `/agent/listings/${id}/edit`,
  AGENT_ENQUIRIES: '/agent/enquiries',
  AGENT_KYC: '/agent/kyc',
  AGENT_PROFILE: '/agent/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_KYC: '/admin/kyc',
  ADMIN_FRAUD: '/admin/fraud',
  ADMIN_AGENTS: '/admin/agents',

  // Superadmin
  SUPERADMIN_DASHBOARD: '/superadmin/dashboard',
  SUPERADMIN_ADMIN_REQUESTS: '/superadmin/admin-requests',

  // Catch-all
  NOT_FOUND: '*',
} as const;
