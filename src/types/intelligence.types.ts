/**
 * Intelligence types mirror the backend structured intelligence response.
 * Used across chat, detail pages, and intelligence components.
 */

export type IntelligenceConfidence = 'low' | 'medium' | 'high';
export type IntelligenceStatus = 
  | 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Needs Review'
  | 'Low Risk' | 'High Risk';

export interface IntelligenceEvidence {
  dataConfidence: IntelligenceConfidence;
  totalReportsUsed: number | null;
  lastUpdated: string | null;
  dataSources: string[];
  [key: string]: unknown;
}

export interface IntelligenceBlock {
  score?: number | null;
  status: IntelligenceStatus;
  confidence: IntelligenceConfidence;
  summary: string;
  evidence: IntelligenceEvidence;
  [key: string]: unknown;
}

export interface NeighbourhoodIntelligenceSummary {
  neighbourhood: string;
  overallScore?: number | null;
  overallStatus?: IntelligenceStatus;
  overallConfidence?: IntelligenceConfidence;
  power?: IntelligenceBlock;
  flood?: IntelligenceBlock;
  security?: IntelligenceBlock;
  traffic?: IntelligenceBlock;
  costOfLiving?: IntelligenceBlock;
  education?: IntelligenceBlock;
  finance?: IntelligenceBlock;
  retail?: IntelligenceBlock;
  transit?: IntelligenceBlock;
  lifestyle?: IntelligenceBlock;
  community?: IntelligenceBlock;
  description?: string;
  availableCategories: string[];
}

export const INTELLIGENCE_CATEGORIES = [
  'power',
  'flood',
  'security',
  'traffic',
  'costOfLiving',
  'education',
  'finance',
  'retail',
  'transit',
  'lifestyle',
  'community',
] as const;

export type IntelligenceCategory = typeof INTELLIGENCE_CATEGORIES[number];

// Friendly labels for categories
export const CATEGORY_LABELS: Record<IntelligenceCategory, string> = {
  power: 'Power Supply',
  flood: 'Flood Risk',
  security: 'Security',
  traffic: 'Traffic & Commute',
  costOfLiving: 'Cost of Living',
  education: 'Education',
  finance: 'Finance',
  retail: 'Retail & Amenities',
  transit: 'Transit',
  lifestyle: 'Lifestyle',
  community: 'Community',
};

// Icons for categories (lucide-react icon names)
export const CATEGORY_ICONS: Record<IntelligenceCategory, string> = {
  power: 'Zap',
  flood: 'Droplets',
  security: 'Shield',
  traffic: 'Car',
  costOfLiving: 'DollarSign',
  education: 'BookOpen',
  finance: 'CreditCard',
  retail: 'ShoppingCart',
  transit: 'Train',
  lifestyle: 'Heart',
  community: 'Users',
};

// Color scheme for confidence levels
export const CONFIDENCE_COLORS = {
  high: { bg: 'bg-[#00C9A7]/10', border: 'border-[#00C9A7]/25', text: 'text-[#00C9A7]' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-400/20', text: 'text-amber-300' },
  low: { bg: 'bg-red-500/10', border: 'border-red-400/20', text: 'text-red-300' },
};

// Color scheme for status levels
export const STATUS_COLORS: Record<IntelligenceStatus, { bg: string; border: string; text: string }> = {
  'Excellent': { bg: 'bg-[#00C9A7]/10', border: 'border-[#00C9A7]/25', text: 'text-[#00C9A7]' },
  'Good': { bg: 'bg-blue-500/10', border: 'border-blue-400/20', text: 'text-blue-300' },
  'Fair': { bg: 'bg-amber-500/10', border: 'border-amber-400/20', text: 'text-amber-300' },
  'Poor': { bg: 'bg-red-500/10', border: 'border-red-400/20', text: 'text-red-300' },
  'Needs Review': { bg: 'bg-slate-500/10', border: 'border-slate-400/20', text: 'text-slate-300' },
  'Low Risk': { bg: 'bg-[#00C9A7]/10', border: 'border-[#00C9A7]/25', text: 'text-[#00C9A7]' },
  'High Risk': { bg: 'bg-red-500/10', border: 'border-red-400/20', text: 'text-red-300' },
};
