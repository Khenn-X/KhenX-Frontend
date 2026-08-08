import api from "./axios";
import type { ApiResponse } from "../types/api.types";
import type { IAgent, UpdateAgentProfilePayload } from "../types/agent.types";
import type { IUser } from "../types/auth.types";

export interface AgentPublicProfile {
  agent: IAgent | null;
  user: Pick<IUser, "_id" | "fullName" | "avatarUrl" | "email"> | null;
}

export interface AgentsListResponse {
  agents: AgentPublicProfile[];
  total: number;
}

export const agentsApi = {
  // in agents.api.ts
  getDashboard: async (): Promise<
    ApiResponse<{
      listings: {
        total: number;
        active: number;
        pending: number;
        paused: number;
        rejected: number;
      };
      totalEnquiries: number;
      totalViews: number;
    }>
  > => {
    const { data } = await api.get("/agents/dashboard");
    return data;
  },

  // Public — get all approved agents (for grids, directories)
  getAllAgents: async (params?: {
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<AgentsListResponse>> => {
    const { data } = await api.get("/agents", { params });
    return data;
  },

  // Public — get a single agent's public profile
  getAgentProfile: async (
    id: string,
  ): Promise<ApiResponse<AgentPublicProfile>> => {
    const { data } = await api.get(`/agents/${id}`);
    return data;
  },

  getOwnProfile: async (): Promise<ApiResponse<{ agent: IAgent; user: Pick<IUser, "_id" | "fullName" | "avatarUrl" | "email"> }>> => {
    const { data } = await api.get("/agents/profile");
    return data;
  },

  // Agent — update own profile
  updateProfile: async (
    payload: UpdateAgentProfilePayload,
  ): Promise<ApiResponse<{ agent: IAgent; user?: Pick<IUser, "_id" | "fullName" | "avatarUrl" | "email"> }>> => {
    const { data } = await api.patch("/agents/profile", payload);
    return data;
  },

  uploadAgentAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file, file.name);

    if (import.meta.env.DEV) {
      console.log('[agentsApi.uploadAgentAvatar] file', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      for (const entry of formData.entries()) {
        console.log('[agentsApi.uploadAgentAvatar] formData entry', entry[0], entry[1]);
      }
    }

    const { data } = await api.post('/agents/profile/avatar', formData);
    return data;
  },
};
