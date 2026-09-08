import api from './axios';
import type { ApiResponse } from '../types/api.types';

export type SupportConversationStatus =
  | 'ai_handling'
  | 'waiting_for_agent'
  | 'agent_handling'
  | 'resolved';

export interface SupportMessage {
  _id: string;
  conversationId: string;
  senderType: 'user' | 'ai' | 'agent' | 'system';
  senderId?: string | { _id: string; fullName: string; email?: string } | null;
  senderName?: string;
  text: string;
  attachment?: {
    url?: string | null;
    filename?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
  } | null;
  visibility?: 'public' | 'internal';
  createdAt: string;
  updatedAt: string;
}

export interface SupportConversation {
  _id: string;
  userId: string;
  status: SupportConversationStatus;
  assignedAgentId?: string | SupportUserIdentity | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportUserIdentity {
  _id: string;
  fullName: string;
  email: string;
}

export interface SupportQueueConversation extends Omit<SupportConversation, 'userId'> {
  userId: SupportUserIdentity;
  assignedAgent?: SupportUserIdentity | null;
  lastMessage?: Pick<SupportMessage, '_id' | 'text' | 'createdAt' | 'senderType'>;
}

export const supportApi = {
  createConversation: async (): Promise<ApiResponse<{ conversation: SupportConversation }>> => {
    const { data } = await api.post('/support/conversations');
    return data;
  },

  getConversation: async (
    conversationId: string,
  ): Promise<ApiResponse<{ conversation: SupportConversation; messages: SupportMessage[] }>> => {
    const { data } = await api.get(`/support/conversations/${conversationId}`);
    return data;
  },

  sendMessage: async (
    conversationId: string,
    text: string,
  ): Promise<ApiResponse<{ conversation: SupportConversation; messages: SupportMessage[] }>> => {
    const { data } = await api.post(`/support/conversations/${conversationId}/messages`, { text });
    return data;
  },

  uploadAttachment: async (
    conversationId: string,
    file: File,
    text = '',
  ): Promise<ApiResponse<{ conversation: SupportConversation; message: SupportMessage; aiResponded: boolean }>> => {
    const formData = new FormData();
    formData.append('attachment', file);
    if (text.trim()) formData.append('text', text.trim());
    const { data } = await api.post(`/support/conversations/${conversationId}/attachments`, formData);
    return data;
  },

  getQueue: async (): Promise<ApiResponse<{ conversations: SupportQueueConversation[] }>> => {
    const { data } = await api.get('/support/conversations');
    return data;
  },

  sendAgentMessage: async (
    conversationId: string,
    text: string,
  ): Promise<ApiResponse<{ message: SupportMessage }>> => {
    const { data } = await api.post(`/support/conversations/${conversationId}/agent-messages`, { text });
    return data;
  },

  claimConversation: async (
    conversationId: string,
  ): Promise<ApiResponse<{ conversation: SupportConversation; message: SupportMessage }>> => {
    const { data } = await api.post(`/support/conversations/${conversationId}/claim`);
    return data;
  },

  takeoverConversation: async (
    conversationId: string,
  ): Promise<ApiResponse<{ conversation: SupportConversation; message: SupportMessage }>> => {
    const { data } = await api.post(`/support/conversations/${conversationId}/takeover`);
    return data;
  },

  resolveConversation: async (
    conversationId: string,
  ): Promise<ApiResponse<{ conversation: SupportConversation }>> => {
    const { data } = await api.post(`/support/conversations/${conversationId}/resolve`);
    return data;
  },
};
