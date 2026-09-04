import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../../hooks/useNotifications';
import PageWrapper from '../../components/layout/PageWrapper';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import { cn } from '../../lib/utils';

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useNotifications({ page, limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.data?.notifications ?? [];

  return <PageWrapper className="py-10"><div className="mb-6 flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C9A7]/10 text-[#00A88C]"><Bell className="h-5 w-5" /></div><div><h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1><p className="mt-1 text-sm text-slate-500">Updates about your KhenX account and activity.</p></div></div>{notifications.some((notification) => !notification.readAt) && <button onClick={() => markAllRead.mutate()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006A61] hover:underline"><CheckCheck className="h-4 w-4" /> Mark all read</button>}</div>{isLoading ? <LoadingSpinner label="Loading notifications..." /> : isError ? <ErrorMessage message={error?.message} onRetry={refetch} /> : notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications yet" description="Important account and activity updates will appear here." /> : <><div className="space-y-3">{notifications.map((notification) => <button key={notification._id} onClick={() => { if (!notification.readAt) markRead.mutate(notification._id); }} className={cn('w-full rounded-xl border p-4 text-left transition-colors hover:border-[#00C9A7]/40', notification.readAt ? 'border-slate-200 bg-white' : 'border-[#00C9A7]/30 bg-[#00C9A7]/[0.04]')}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#0F172A]">{notification.title}</p><p className="mt-1 text-sm text-slate-600">{notification.body}</p></div><p className="shrink-0 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p></div>{notification.link && <p className="mt-2 text-xs font-medium text-[#006A61]">Open related page</p>}</button>)}</div><Pagination currentPage={page} totalPages={data?.data?.pages ?? 0} onPageChange={setPage} className="mt-6" /></>}</PageWrapper>;
};

export default NotificationsPage;