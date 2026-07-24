import api from './axios';

export interface IntelligenceCard {
  type:      'listing' | 'neighbourhood';
  id:        string;
  title:     string;
  subtitle?: string;
  imageUrl?: string;
  linkPath:  string;
  meta?:     Record<string, any>;
}

export interface IntelligenceUsage {
  used:      number;
  limit:     number | null;
  plan:      string;
  remaining: number | null;
}

export interface IntelligenceMessage {
  role:      'user' | 'agent';
  content:   string;
  source?:   'database' | 'llm' | 'hybrid';
  cards?:    IntelligenceCard[];
  createdAt: string;
}

export interface SendIntelligenceResponse {
  data: {
    sessionId: string;
    message:   string;
    cards:     IntelligenceCard[];
    source:    string;
    usage:     IntelligenceUsage;
  };
}

export interface IntelligenceSessionResponse {
  data: {
    session: { _id: string; messages: IntelligenceMessage[] } | null;
    usage:   IntelligenceUsage;
  };
}

export const intelligenceApi = {
  sendMessage: async (payload: {
    message:      string;
    sessionId?:   string;
    areaContext?: string;
  }): Promise<SendIntelligenceResponse> => {
    const { data } = await api.post('/intelligence/message', payload);
    return data;
  },

  getSession: async (areaContext?: string): Promise<IntelligenceSessionResponse> => {
    const { data } = await api.get('/intelligence/session', {
      params: areaContext ? { areaContext } : undefined,
    });
    return data;
  },

  upgradePlan: async (plan: string) => {
    const { data } = await api.post('/intelligence/subscribe', { plan });
    return data;
  },
};