import api from "./axios";

export interface IntelligenceCard {
  type: "listing" | "neighbourhood";
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkPath: string;
  meta?: Record<string, any>;
}

export interface IntelligenceUsage {
  used: number;
  limit: number | null;
  plan: string;
  remaining: number | null;
}

export interface IntelligenceMessage {
  role: "user" | "agent";
  content: string;
  source?: "database" | "llm" | "hybrid";
  cards?: IntelligenceCard[];
  createdAt: string;
}

// ─── Structured Intelligence Types ──────────────────────────────────────────

export type IntelligenceConfidence = "low" | "medium" | "high";
export type IntelligenceStatus =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor"
  | "Needs Review"
  | "Low Risk"
  | "High Risk";

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

export interface SendIntelligenceResponse {
  data: {
    sessionId: string;
    message: string;
    cards: IntelligenceCard[];
    source: string;
    intelligence: NeighbourhoodIntelligenceSummary | null;
    usage: IntelligenceUsage;
  };
}

export interface IntelligenceSessionResponse {
  data: {
    session: { _id: string; messages: IntelligenceMessage[] } | null;
    usage: IntelligenceUsage;
  };
}

export const intelligenceApi = {
  sendMessage: async (payload: {
    message: string;
    sessionId?: string;
    areaContext?: string;
  }): Promise<SendIntelligenceResponse> => {
    const { data } = await api.post("/intelligence/message", payload);
    return data;
  },

  getSession: async (
    areaContext?: string,
  ): Promise<IntelligenceSessionResponse> => {
    const { data } = await api.get("/intelligence/session", {
      params: areaContext ? { areaContext } : undefined,
    });
    return data;
  },
  initializeSubscription: async (plan: string, returnUrl?: string) => {
    const { data } = await api.post("/intelligence/subscribe", {
      plan,
      returnUrl,
    });
    return data.data as { authorizationUrl: string; reference: string };
  },

  verifySubscription: async (reference: string, returnUrl?: string) => {
    const { data } = await api.get("/intelligence/subscribe/verify", {
      params: { reference, returnUrl },
    });
    return data.data as { plan: string; expiresAt: string; returnUrl: string };
  },
};
