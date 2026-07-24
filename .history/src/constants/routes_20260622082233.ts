export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Seeker
  DASHBOARD: '/dashboard',
  SAVED: '/saved',

  // Agent
  AGENT_DASHBOARD: '/agent/dashboard',
  AGENT_LISTINGS: '/agent/listings',
  AGENT_LISTINGS_NEW: '/agent/listings/new',
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
  SUPERADMIN_DASHBOARD: '/superadmin/dashboard',           // ← new home for superadmin
  SUPERADMIN_ADMIN_REQUESTS: '/superadmin/admin-requests',
} as const;