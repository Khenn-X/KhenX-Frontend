/**
 * All application route paths as constants.
 * Never hardcode route strings anywhere else — always import from here.
 */
export const ROUTES = {
  // Public
  HOME: "/",
  LISTINGS: "/listings",
  LISTING_DETAIL: (id: string) => `/listings/${id}`,
  AGENTS: "/agents",
  AGENT_DETAIL: (id: string) => `/agents/${id}`,
  LANDLORDS: "/landlords",
  LANDLORD_DETAIL: (id: string) => `/landlords/${id}`,
  NEIGHBOURHOOD: "/neighbourhood",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: (token: string) => `/reset-password/${token}`,
  VERIFY_EMAIL: "/verify-email",
  PAYMENT_VERIFY: "/payment/verify",

  // Seeker
  DASHBOARD: "/dashboard",
  SAVED: "/saved",

  // Agent
  AGENT_DASHBOARD: "/agent/dashboard",
  AGENT_LISTINGS: "/agent/listings",

  AGENT_LISTINGS_NEW: "/agent/listings/new",
  AGENT_LISTING_EDIT: (id: string) => `/agent/listings/${id}/edit`,
  AGENT_ENQUIRIES: "/agent/enquiries",
  AGENT_KYC: "/agent/kyc",
  AGENT_PROFILE: "/agent/profile",
  AGENT_SETTINGS: "/agent/settings",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_LISTINGS: "/admin/listings",
  ADMIN_KYC: "/admin/kyc",
  ADMIN_FRAUD: "/admin/fraud",
  ADMIN_AGENTS: "/admin/agents",
  ADMIN_NEIGHBOURHOODS: "/admin/neighbourhoods",
  ADMIN_NEIGHBOURHOOD_IMPORT: "/admin/neighbourhoods/import",
  ADMIN_NEIGHBOURHOOD_NEW: "/admin/neighbourhoods/new",
  ADMIN_NEIGHBOURHOOD_EDIT: (areaName: string) =>
    `/admin/neighbourhoods/${encodeURIComponent(areaName)}/edit`,
  ADMIN_NEIGHBOURHOOD_VIEW: (areaName: string) =>
    `/admin/neighbourhoods/${encodeURIComponent(areaName)}/view`,
  ADMIN_PROFILE: "/admin/profile",
  ADMIN_SETTINGS: "/admin/settings",

  // Superadmin
  SUPERADMIN_DASHBOARD: "/superadmin/dashboard",
  SUPERADMIN_ADMIN_REQUESTS: "/superadmin/admin-requests",
  SUPERADMIN_PROFILE: "/superadmin/profile",
  SUPERADMIN_SETTINGS: "/superadmin/settings",

  // Catch-all
  NOT_FOUND: "*",
} as const;
