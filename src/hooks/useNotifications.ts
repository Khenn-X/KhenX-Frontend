import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationParams } from '../api/notifications.api';
import { queryKeys } from '../constants/queryKeys';

export const useNotifications = (params: NotificationParams = {}) => useQuery({
  queryKey: queryKeys.notifications.all(params),
  queryFn: () => notificationsApi.getAll(params),
  refetchInterval: 30_000,
});

export const useUnreadNotificationCount = () => useQuery({
  queryKey: queryKeys.notifications.unreadCount,
  queryFn: notificationsApi.getUnreadCount,
  refetchInterval: 30_000,
});

const invalidateNotifications = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['notifications'] });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => invalidateNotifications(queryClient),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => invalidateNotifications(queryClient),
  });
};