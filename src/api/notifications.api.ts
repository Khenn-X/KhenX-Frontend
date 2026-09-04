import api from './axios';
import type { ApiResponse } from '../types/api.types';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  getAll: async (params: NotificationParams = {}): Promise<ApiResponse<{ notifications: AppNotification[]; total: number; page: number; pages: number }>> => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },
  markRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
};