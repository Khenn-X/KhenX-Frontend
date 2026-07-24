# KhenX Frontend — Master Implementation Reference
> Use this document to resume work in any chat session without losing context.
> Last updated: Session 1 — pre-implementation

---

## 1. PROJECT IDENTITY

**Product:** KhenX — Nigeria's first AI-powered Property Listing + Neighbourhood Intelligence Platform for Lagos.
**Tagline:** "Before you pay, know the area."
**Mission:** KhenX is a full property listing marketplace (find, filter, enquire on properties) PLUS a neighbourhood intelligence layer (power scores, flood risk, security, commute) that no competitor offers.

---

## 2. TECH STACK

### Frontend
| Layer | Choice |
|---|---|
| Framework | React + Vite (TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Data Fetching | React Query (TanStack Query v5) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (with interceptors) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge, class-variance-authority |

### Backend (already built — do not change)
| Layer | Choice |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT stored in httpOnly cookie |
| Email | Resend |
| File Upload | Cloudinary |
| AI | Anthropic Claude SDK |
| Validation | express-validator |

---

## 3. BRAND / DESIGN TOKENS

These must be used consistently across ALL components.

```
Primary Dark:     #0A1628   (navy — main background, headers)
Primary Teal:     #00C9A7   (brand green — CTAs, badges, highlights)
Amber Accent:     #F59E0B   (warnings, secondary CTAs)
Red Danger:       #DC2626   (fraud, errors, suspension)
Text Primary:     #0F172A
Text Secondary:   #475569
Text Muted:       #94A3B8
Background:       #F8FAFC
Card:             #FFFFFF
Border:           #E2E8F0
Font:             Poppins (Google Fonts)
Border Radius:    8px cards, 6px buttons, 4px inputs
```

**KYC Status Colors:**
- `pending` → amber `#F59E0B`
- `approved` → teal `#00C9A7`
- `rejected` → red `#DC2626`
- `suspended` → slate `#64748B`

**Listing Status Colors:**
- `pending` → amber
- `active` → teal
- `paused` → slate
- `rejected` → red

---

## 4. USER ROLES & ACCESS MAP

Three roles exist. Every page/route must enforce the correct role.

### SEEKER (default role)
- Browse all active listings (public, no auth required)
- AI natural language search (public)
- View neighbourhood intelligence (public)
- Save/unsave listings (auth required)
- Submit enquiries on listings (no auth required — just name/email/phone/message)
- View saved listings dashboard

### AGENT
- All seeker capabilities
- Must complete KYC before submitting listings
- Submit listings (pending admin approval)
- Edit/pause/delete own listings
- View enquiries received on own listings
- Mark enquiries as read/responded
- View own dashboard stats
- Update own profile

### ADMIN
- All agent capabilities
- Approve/reject listings with reason
- Approve/reject KYC with reason
- Feature/unfeature listings
- Suspend agents with reason
- View and manage fraud reports
- Full audit log visible

---

## 5. BACKEND API ROUTES (complete map)

Base URL: `http://localhost:5000/api` (dev) | `https://api.khen-x.com/api` (prod)
All responses: `{ status: 'success'|'fail'|'error', message: string, data: any }`
Auth: httpOnly JWT cookie (set automatically by browser on login)

### AUTH — `/api/auth`
```
POST   /signup              Body: { fullName, email, password, role? }
POST   /login               Body: { email, password }
POST   /logout              (clears cookie)
GET    /me                  (requires auth) → returns current user
GET    /verify-email        Query: ?token=xxx
POST   /forgot-password     Body: { email }
POST   /reset-password/:token  Body: { password }
```

### LISTINGS — `/api/listings`
```
GET    /                    Query: ?areaName=&bedrooms=&maxPrice=&listingType=&propertyType=&page=&limit=
                            Public. Returns active listings only.
GET    /:id                 Public. Single listing detail + increments viewCount.
POST   /                    Agent + KYC approved. Submit new listing.
PATCH  /:id                 Agent. Edit own listing.
DELETE /:id                 Agent. Delete own listing.
GET    /agent/my-listings   Agent. Own listings (all statuses).
```

### SEARCH — `/api/search`
```
POST   /natural             Body: { query: string }
                            Public. Passes natural language to Claude AI.
                            Claude extracts filters → returns matched listings.
                            Rate limited: 30 req/min per IP.
```

### NEIGHBOURHOOD — `/api/neighbourhood`
```
GET    /                    Query: ?areaName=xxx  → returns intelligence data for area
POST   /waitlist            Body: { email, areaName } → join waitlist for unavailable area
POST   /resident-report     Body: { areaName, powerHoursDaily, floodedLastSeason,
                                    floodSeverity, securityRating, incidentCategory, reporterEmail? }
```

### ENQUIRIES — `/api/enquiries`
```
POST   /                    Public. Body: { listingId, seekerName, seekerEmail, seekerPhone?, message }
                            Triggers email to agent via Resend.
GET    /agent/my-enquiries  Agent. Own enquiries. Query: ?status=new|read|responded
PATCH  /:id/status          Agent. Body: { status: 'read'|'responded' }
```

### SAVED — `/api/saved`
```
POST   /                    Auth required. Body: { listingId }
DELETE /:listingId          Auth required.
GET    /                    Auth required. Returns all saved listings for current user.
```

### FRAUD — `/api/fraud`
```
POST   /                    Public. Body: { listingId, reason, reporterEmail? }
GET    /                    Admin only. All fraud reports.
PATCH  /:id                 Admin only. Body: { status, adminNotes? }
```

### KYC — `/api/kyc`
```
POST   /submit              Agent. Multipart form: document (file) + selfie (file)
GET    /status              Agent. Own KYC status.
GET    /                    Admin only. All pending KYC submissions.
PATCH  /:agentId/approve    Admin only.
PATCH  /:agentId/reject     Admin only. Body: { reason }
```

### AGENTS — `/api/agents`
```
GET    /:id                 Public. Agent public profile.
PATCH  /profile             Agent. Body: { businessName, phone, bio }
```

### ADMIN — `/api/admin`
```
GET    /listings/pending    Admin only. All pending listings.
PATCH  /listings/:id/approve   Admin only.
PATCH  /listings/:id/reject    Admin only. Body: { reason }
PATCH  /listings/:id/feature   Admin only. Body: { isFeatured: boolean }
GET    /agents              Admin only. All agents with KYC status.
PATCH  /agents/:id/suspend  Admin only. Body: { reason }
GET    /stats               Admin only. Platform stats.
```

---

## 6. FOLDER STRUCTURE (complete)

```
client/
├── src/
│   ├── api/                    # Axios API call functions (1 file per domain)
│   │   ├── axios.ts            # Axios instance with interceptors
│   │   ├── auth.api.ts
│   │   ├── listings.api.ts
│   │   ├── agents.api.ts
│   │   ├── search.api.ts
│   │   ├── enquiries.api.ts
│   │   ├── neighbourhood.api.ts
│   │   ├── saved.api.ts
│   │   ├── fraud.api.ts
│   │   ├── admin.api.ts
│   │   └── kyc.api.ts
│   │
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts       # currentUser, isAuthenticated, setUser, clearUser
│   │   ├── search.store.ts     # query string, filters, results
│   │   └── ui.store.ts         # modals open/close, sidebar, toasts
│   │
│   ├── hooks/                  # React Query hooks (1 per domain)
│   │   ├── useAuth.ts          # useMe, useLogin, useSignup, useLogout etc.
│   │   ├── useListings.ts      # useListings, useListing, useCreateListing etc.
│   │   ├── useSearch.ts        # useNaturalSearch
│   │   ├── useEnquiries.ts     # useSubmitEnquiry, useAgentEnquiries, useUpdateEnquiryStatus
│   │   ├── useNeighbourhood.ts # useNeighbourhood, useWaitlist, useResidentReport
│   │   ├── useSaved.ts         # useSavedListings, useSaveListing, useUnsaveListing
│   │   ├── useAgent.ts         # useAgentProfile, useUpdateProfile
│   │   ├── useAdmin.ts         # useAdminListings, useApprove, useReject, useSuspend etc.
│   │   ├── useKYC.ts           # useKYCStatus, useSubmitKYC, useAdminKYC etc.
│   │   └── useFraud.ts         # useReportFraud, useAdminFraudReports, useUpdateFraud
│   │
│   ├── types/                  # TypeScript interfaces (mirrors backend models)
│   │   ├── auth.types.ts       # IUser, UserRole, LoginPayload, SignupPayload
│   │   ├── listing.types.ts    # IListing, PropertyType, ListingType, ListingStatus
│   │   ├── agent.types.ts      # IAgent, KYCStatus, AgentTier
│   │   ├── neighbourhood.types.ts  # INeighbourhoodIntelligence, FloodRisk
│   │   ├── enquiry.types.ts    # IEnquiry, EnquiryStatus
│   │   ├── search.types.ts     # ParsedListingFilters, SearchResult
│   │   └── api.types.ts        # ApiResponse<T>, PaginatedResponse<T>
│   │
│   ├── lib/
│   │   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │   ├── queryClient.ts      # React Query client config
│   │   └── validators.ts       # Zod schemas for all forms
│   │
│   ├── constants/
│   │   ├── routes.ts           # All route path strings as constants
│   │   ├── queryKeys.ts        # All React Query key factories
│   │   └── lagos-areas.ts      # Full list of Lagos areas for dropdowns/search
│   │
│   ├── routes/
│   │   ├── AppRouter.tsx       # Main router with all route definitions
│   │   ├── ProtectedRoute.tsx  # Redirects to /login if not authenticated
│   │   ├── AgentRoute.tsx      # Requires role === 'agent'
│   │   └── AdminRoute.tsx      # Requires role === 'admin'
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Public nav with auth state
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx # Sidebar layout for agent dashboard
│   │   │   ├── AdminLayout.tsx     # Sidebar layout for admin panel
│   │   │   └── PageWrapper.tsx     # Max-width wrapper + padding
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── EmailVerificationBanner.tsx
│   │   │
│   │   ├── listings/
│   │   │   ├── ListingCard.tsx         # Grid card with photo, price, area, badges
│   │   │   ├── ListingGrid.tsx         # Responsive grid of ListingCards
│   │   │   ├── ListingDetail.tsx       # Full listing view with all info
│   │   │   ├── ListingPhotos.tsx       # Photo carousel/gallery
│   │   │   ├── ListingBadge.tsx        # Status/featured badges
│   │   │   ├── ListingFilters.tsx      # Filter sidebar/drawer
│   │   │   ├── ListingForm.tsx         # Create/edit form (shared)
│   │   │   ├── PhotoUploader.tsx       # Drag & drop photo upload
│   │   │   ├── FeaturesCheckbox.tsx    # Generator, borehole, security etc.
│   │   │   └── PriceDisplay.tsx        # Formats ₦ price with period
│   │   │
│   │   ├── search/
│   │   │   ├── NaturalSearchBar.tsx    # The AI search input (hero component)
│   │   │   ├── SearchResults.tsx       # Results after AI search
│   │   │   ├── SearchSuggestions.tsx   # Example queries shown below search bar
│   │   │   └── FilterPanel.tsx         # Manual filter fallback
│   │   │
│   │   ├── neighbourhood/
│   │   │   ├── IntelligenceCard.tsx    # Full neighbourhood score card
│   │   │   ├── ScoreBadge.tsx          # Circular/pill score display (0-10)
│   │   │   ├── FloodRiskBadge.tsx      # Low/medium/high with color
│   │   │   ├── WaitlistForm.tsx        # Email + area waitlist signup
│   │   │   └── ResidentReportForm.tsx  # Resident data submission form
│   │   │
│   │   ├── agent/
│   │   │   ├── AgentCard.tsx           # Public-facing agent card
│   │   │   ├── AgentProfile.tsx        # Agent public profile page component
│   │   │   ├── KYCUploadForm.tsx       # Document + selfie upload
│   │   │   ├── KYCStatusBanner.tsx     # Shows pending/approved/rejected status
│   │   │   ├── EnquiryList.tsx         # List of enquiries
│   │   │   ├── EnquiryItem.tsx         # Single enquiry row with status
│   │   │   ├── ListingManager.tsx      # Agent's listing table with actions
│   │   │   └── DashboardStats.tsx      # Stats cards (views, enquiries, listings)
│   │   │
│   │   ├── admin/
│   │   │   ├── ListingReviewCard.tsx   # Approve/reject listing card
│   │   │   ├── KYCReviewCard.tsx       # Approve/reject KYC card
│   │   │   ├── FraudReportCard.tsx     # Fraud report with actions
│   │   │   ├── AgentSuspendModal.tsx   # Suspension confirm + reason modal
│   │   │   └── AdminStats.tsx          # Platform-wide stats
│   │   │
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmModal.tsx
│   │       ├── Pagination.tsx
│   │       ├── ImageWithFallback.tsx
│   │       └── FraudReportButton.tsx   # Floating report button on listing detail
│   │
│   └── pages/
│       ├── public/
│       │   ├── HomePage.tsx            # Hero + search bar + featured listings + neighbourhood teaser
│       │   ├── ListingsPage.tsx        # Browse all listings with filters
│       │   ├── ListingDetailPage.tsx   # Single listing + neighbourhood intel + enquiry form
│       │   ├── NeighbourhoodPage.tsx   # Search area → see intelligence card
│       │   └── NotFoundPage.tsx
│       │
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── ResetPasswordPage.tsx
│       │   └── VerifyEmailPage.tsx
│       │
│       ├── seeker/
│       │   ├── SavedListingsPage.tsx
│       │   └── SeekerDashboardPage.tsx
│       │
│       ├── agent/
│       │   ├── AgentDashboardPage.tsx
│       │   ├── AgentListingsPage.tsx
│       │   ├── CreateListingPage.tsx
│       │   ├── EditListingPage.tsx
│       │   ├── AgentEnquiriesPage.tsx
│       │   ├── KYCPage.tsx
│       │   └── AgentProfilePage.tsx
│       │
│       └── admin/
│           ├── AdminDashboardPage.tsx
│           ├── AdminListingsPage.tsx
│           ├── AdminKYCPage.tsx
│           ├── AdminFraudPage.tsx
│           └── AdminAgentsPage.tsx
```

---

## 7. ROUTE DEFINITIONS (AppRouter.tsx)

```
PUBLIC (no auth required):
/                           → HomePage
/listings                   → ListingsPage
/listings/:id               → ListingDetailPage
/neighbourhood              → NeighbourhoodPage
/login                      → LoginPage
/signup                     → SignupPage
/forgot-password            → ForgotPasswordPage
/reset-password/:token      → ResetPasswordPage
/verify-email               → VerifyEmailPage (reads ?token= from URL)
*                           → NotFoundPage

SEEKER (auth required, any role):
/saved                      → SavedListingsPage
/dashboard                  → SeekerDashboardPage

AGENT (role === 'agent'):
/agent/dashboard            → AgentDashboardPage
/agent/listings             → AgentListingsPage
/agent/listings/new         → CreateListingPage
/agent/listings/:id/edit    → EditListingPage
/agent/enquiries            → AgentEnquiriesPage
/agent/kyc                  → KYCPage
/agent/profile              → AgentProfilePage

ADMIN (role === 'admin'):
/admin/dashboard            → AdminDashboardPage
/admin/listings             → AdminListingsPage
/admin/kyc                  → AdminKYCPage
/admin/fraud                → AdminFraudPage
/admin/agents               → AdminAgentsPage
```

---

## 8. ZUSTAND STORES

### auth.store.ts
```typescript
interface AuthStore {
  user: IUser | null
  isAuthenticated: boolean
  setUser: (user: IUser) => void
  clearUser: () => void
}
```

### search.store.ts
```typescript
interface SearchStore {
  query: string
  filters: ParsedListingFilters
  results: IListing[]
  isSearching: boolean
  setQuery: (q: string) => void
  setFilters: (f: ParsedListingFilters) => void
  setResults: (r: IListing[]) => void
  setIsSearching: (v: boolean) => void
  clearSearch: () => void
}
```

### ui.store.ts
```typescript
interface UIStore {
  isSidebarOpen: boolean
  activeModal: string | null
  toggleSidebar: () => void
  openModal: (name: string) => void
  closeModal: () => void
}
```

---

## 9. REACT QUERY KEY FACTORIES (queryKeys.ts)

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  listings: {
    all: (filters?) => ['listings', filters],
    detail: (id) => ['listings', id],
    myListings: ['listings', 'mine'],
    pending: ['listings', 'pending'],
  },
  search: {
    natural: (query) => ['search', 'natural', query],
  },
  neighbourhood: {
    area: (name) => ['neighbourhood', name],
  },
  enquiries: {
    mine: (status?) => ['enquiries', 'mine', status],
  },
  saved: {
    all: ['saved'],
  },
  fraud: {
    all: ['fraud', 'all'],
  },
  kyc: {
    status: ['kyc', 'status'],
    all: ['kyc', 'all'],
  },
  admin: {
    stats: ['admin', 'stats'],
    agents: ['admin', 'agents'],
  },
}
```

---

## 10. ZOD FORM SCHEMAS (validators.ts)

```typescript
// Signup
{ fullName: min(2), email: email(), password: min(8) + uppercase + number, role: enum(['seeker','agent']) }

// Login
{ email: email(), password: min(1) }

// Forgot Password
{ email: email() }

// Reset Password
{ password: min(8) + uppercase + number, confirmPassword: must match password }

// Create/Edit Listing
{
  title: min(10),
  description: min(30),
  propertyType: enum([...]),
  listingType: enum(['rent','sale','short-let']),
  bedrooms: min(0),
  bathrooms: min(1),
  areaName: min(2),
  estateName: optional string,
  price: positive number,
  pricePeriod: enum(['yearly','monthly','nightly']),
  serviceCharge: optional positive number,
  features: object of booleans
  // photos handled separately via FormData
}

// Enquiry
{ seekerName: min(2), seekerEmail: email(), seekerPhone: optional, message: min(10) }

// Neighbourhood Waitlist
{ email: email(), areaName: min(2) }

// Resident Report
{ areaName: min(2), powerHoursDaily: 0-24, floodedLastSeason: boolean,
  floodSeverity: optional enum, securityRating: 1-5, incidentCategory: optional }

// Agent Profile
{ businessName: optional, phone: optional, bio: optional max(500) }
```

---

## 11. AXIOS INSTANCE SETUP (axios.ts)

```
baseURL: import.meta.env.VITE_API_URL
withCredentials: true   ← CRITICAL: sends httpOnly cookie automatically
headers: { Content-Type: application/json }

Request interceptor: none needed (cookie is automatic)
Response interceptor:
  - On 401: clear Zustand auth store, redirect to /login
  - On any error: extract error.response.data.message and throw
```

---

## 12. IMPLEMENTATION ORDER

Implement files in this exact order. Each step depends on the previous.

```
PHASE 1 — Foundation
  1.  src/lib/utils.ts
  2.  src/lib/queryClient.ts
  3.  src/constants/routes.ts
  4.  src/constants/queryKeys.ts
  5.  src/constants/lagos-areas.ts
  6.  src/types/api.types.ts
  7.  src/types/auth.types.ts
  8.  src/types/listing.types.ts
  9.  src/types/agent.types.ts
  10. src/types/neighbourhood.types.ts
  11. src/types/enquiry.types.ts
  12. src/types/search.types.ts
  13. src/lib/validators.ts
  14. src/api/axios.ts

PHASE 2 — Zustand Stores
  15. src/store/auth.store.ts
  16. src/store/search.store.ts
  17. src/store/ui.store.ts

PHASE 3 — API Layer
  18. src/api/auth.api.ts
  19. src/api/listings.api.ts
  20. src/api/search.api.ts
  21. src/api/neighbourhood.api.ts
  22. src/api/enquiries.api.ts
  23. src/api/saved.api.ts
  24. src/api/fraud.api.ts
  25. src/api/kyc.api.ts
  26. src/api/agents.api.ts
  27. src/api/admin.api.ts

PHASE 4 — React Query Hooks
  28. src/hooks/useAuth.ts
  29. src/hooks/useListings.ts
  30. src/hooks/useSearch.ts
  31. src/hooks/useNeighbourhood.ts
  32. src/hooks/useEnquiries.ts
  33. src/hooks/useSaved.ts
  34. src/hooks/useFraud.ts
  35. src/hooks/useKYC.ts
  36. src/hooks/useAgent.ts
  37. src/hooks/useAdmin.ts

PHASE 5 — Routing
  38. src/routes/ProtectedRoute.tsx
  39. src/routes/AgentRoute.tsx
  40. src/routes/AdminRoute.tsx
  41. src/routes/AppRouter.tsx

PHASE 6 — Layout Components
  42. src/components/layout/PageWrapper.tsx
  43. src/components/layout/Navbar.tsx
  44. src/components/layout/Footer.tsx
  45. src/components/layout/DashboardLayout.tsx
  46. src/components/layout/AdminLayout.tsx

PHASE 7 — Shared Components
  47. src/components/shared/LoadingSpinner.tsx
  48. src/components/shared/ErrorMessage.tsx
  49. src/components/shared/EmptyState.tsx
  50. src/components/shared/ConfirmModal.tsx
  51. src/components/shared/Pagination.tsx
  52. src/components/shared/ImageWithFallback.tsx
  53. src/components/shared/FraudReportButton.tsx

PHASE 8 — Auth Components + Pages
  54. src/components/auth/LoginForm.tsx
  55. src/components/auth/SignupForm.tsx
  56. src/components/auth/ForgotPasswordForm.tsx
  57. src/components/auth/ResetPasswordForm.tsx
  58. src/components/auth/EmailVerificationBanner.tsx
  59. src/pages/auth/LoginPage.tsx
  60. src/pages/auth/SignupPage.tsx
  61. src/pages/auth/ForgotPasswordPage.tsx
  62. src/pages/auth/ResetPasswordPage.tsx
  63. src/pages/auth/VerifyEmailPage.tsx

PHASE 9 — Listing Components
  64. src/components/listings/PriceDisplay.tsx
  65. src/components/listings/ListingBadge.tsx
  66. src/components/listings/FeaturesCheckbox.tsx
  67. src/components/listings/ListingPhotos.tsx
  68. src/components/listings/PhotoUploader.tsx
  69. src/components/listings/ListingCard.tsx
  70. src/components/listings/ListingGrid.tsx
  71. src/components/listings/ListingFilters.tsx
  72. src/components/listings/ListingDetail.tsx
  73. src/components/listings/ListingForm.tsx

PHASE 10 — Search Components
  74. src/components/search/SearchSuggestions.tsx
  75. src/components/search/NaturalSearchBar.tsx
  76. src/components/search/SearchResults.tsx
  77. src/components/search/FilterPanel.tsx

PHASE 11 — Neighbourhood Components
  78. src/components/neighbourhood/ScoreBadge.tsx
  79. src/components/neighbourhood/FloodRiskBadge.tsx
  80. src/components/neighbourhood/IntelligenceCard.tsx
  81. src/components/neighbourhood/WaitlistForm.tsx
  82. src/components/neighbourhood/ResidentReportForm.tsx

PHASE 12 — Agent Components + Pages
  83. src/components/agent/DashboardStats.tsx
  84. src/components/agent/KYCStatusBanner.tsx
  85. src/components/agent/KYCUploadForm.tsx
  86. src/components/agent/EnquiryItem.tsx
  87. src/components/agent/EnquiryList.tsx
  88. src/components/agent/ListingManager.tsx
  89. src/components/agent/AgentCard.tsx
  90. src/components/agent/AgentProfile.tsx
  91. src/pages/agent/AgentDashboardPage.tsx
  92. src/pages/agent/AgentListingsPage.tsx
  93. src/pages/agent/CreateListingPage.tsx
  94. src/pages/agent/EditListingPage.tsx
  95. src/pages/agent/AgentEnquiriesPage.tsx
  96. src/pages/agent/KYCPage.tsx
  97. src/pages/agent/AgentProfilePage.tsx

PHASE 13 — Admin Components + Pages
  98. src/components/admin/AdminStats.tsx
  99. src/components/admin/ListingReviewCard.tsx
  100. src/components/admin/KYCReviewCard.tsx
  101. src/components/admin/FraudReportCard.tsx
  102. src/components/admin/AgentSuspendModal.tsx
  103. src/pages/admin/AdminDashboardPage.tsx
  104. src/pages/admin/AdminListingsPage.tsx
  105. src/pages/admin/AdminKYCPage.tsx
  106. src/pages/admin/AdminFraudPage.tsx
  107. src/pages/admin/AdminAgentsPage.tsx

PHASE 14 — Seeker Pages
  108. src/pages/seeker/SavedListingsPage.tsx
  109. src/pages/seeker/SeekerDashboardPage.tsx

PHASE 15 — Public Pages
  110. src/pages/public/NotFoundPage.tsx
  111. src/pages/public/NeighbourhoodPage.tsx
  112. src/pages/public/ListingDetailPage.tsx
  113. src/pages/public/ListingsPage.tsx
  114. src/pages/public/HomePage.tsx   ← saved for last (depends on everything)

PHASE 16 — Entry Point
  115. src/main.tsx                   ← wraps app in QueryClientProvider + Router
  116. src/App.tsx                    ← renders AppRouter
```

---

## 13. ENVIRONMENT VARIABLES (.env)

```
VITE_API_URL=http://localhost:5000/api
```

Production:
```
VITE_API_URL=https://api.khen-x.com/api
```

---

## 14. CRITICAL RULES FOR ALL FILES

1. **Cookie auth** — never store JWT in localStorage. Axios `withCredentials: true` handles it automatically.
2. **Role guards** — every protected page checks role from Zustand auth store.
3. **API error handling** — all errors come through Axios interceptor. Show `error.message` in UI.
4. **React Query** — use `queryKeys` constants everywhere, never hardcode strings.
5. **Forms** — always React Hook Form + Zod. Never uncontrolled inputs.
6. **Images** — always use `ImageWithFallback` component, never raw `<img>` tags.
7. **Loading states** — always handle `isLoading`, `isError`, and empty states.
8. **Price** — always format as ₦ with `toLocaleString('en-NG')`.
9. **Tailwind** — use `cn()` utility for conditional classes, never string concatenation.
10. **shadcn/ui** — use shadcn components (Button, Input, Card, Badge, Dialog, Select, Tabs) as base. Never rebuild primitives.

---

## 15. HOW TO RESUME IN A NEW CHAT

Paste this into the new chat:

> "I am building KhenX — a React + Vite (TypeScript) frontend with Tailwind + shadcn/ui, React Query, and Zustand. The backend is already fully built in Express + MongoDB. I have a master reference document. I am currently on Phase [X], implementing [filename]. Please continue from where we left off."

Then paste the relevant section of this document (the API routes, types, or component spec for whatever phase you are on).

**Current progress:** Phase 1 — not yet started.
Update this line each session.
