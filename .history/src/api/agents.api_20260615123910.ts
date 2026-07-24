import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IAgent, UpdateAgentProfilePayload } from '../types/agent.types';
import type { IUser } from '../types/auth.types';

export interface AgentPublicProfile {
  agent: IAgent;
  user: Pick<IUser, '_id' | 'fullName' | 'avatarUrl'>;
}

export const agentsApi = {
  // Public — get an agent's public profile
  getAgentProfile: async (id: string): Promise<ApiResponse<AgentPublicProfile>> => {
    const { data } = await api.get(`/agents/${id}`);
    return data;
  },

  // Agent — update own profile
  updateProfile: async (
    payload: UpdateAgentProfilePayload
  ): Promise<ApiResponse<{ agent: IAgent }>> => {
    const { data } = await api.patch('/agents/profile', payload);
    return data;
  },
};
