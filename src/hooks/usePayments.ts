import { useQuery } from '@tanstack/react-query';
import { paymentsApi, type PaymentHistoryParams } from '../api/payments.api';
import { queryKeys } from '../constants/queryKeys';
import { dashboardQueryOptions } from '../lib/dashboardQuery';

export const usePaymentHistory = (params: PaymentHistoryParams = {}) => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.payments.history(params),
      queryFn: () => paymentsApi.getHistory(params),
    }),
  );
};