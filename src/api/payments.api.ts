import api from './axios';
import type { ApiResponse } from '../types/api.types';

export type PaymentState = 'pending' | 'successful' | 'failed' | 'abandoned' | 'reversed' | 'refunded';

export interface PaymentStateChange {
  state: string;
  changedAt: string;
  reason?: string;
}

export interface PaymentHistoryTransaction {
  _id: string;
  paymentReference: string;
  payerType: 'agent' | 'landlord' | 'user';
  payerId: string;
  payerEmail: string;
  subscriptionType: 'agent_listing' | 'landlord_listing' | 'agent_ai_usage' | 'user_ai_usage';
  amount: number;
  currency: string;
  channel?: string;
  plan: string;
  state: PaymentState;
  stateHistory: PaymentStateChange[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryParams {
  page?: number;
  limit?: number;
  state?: PaymentState;
  from?: string;
  to?: string;
}

export const paymentsApi = {
  getHistory: async (params: PaymentHistoryParams = {}): Promise<ApiResponse<{
    transactions: PaymentHistoryTransaction[];
    total: number;
    page: number;
    pages: number;
  }>> => {
    const { data } = await api.get('/payments/history', { params });
    return data;
  },
};