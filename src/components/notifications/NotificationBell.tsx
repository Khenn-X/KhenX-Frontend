import { useState } from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadNotificationCount } from '../../hooks/useNotifications';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/auth.store';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: countData } = useUnreadNotificationCount();
  const { data } = useNotifications({ page: 1, limit: 5 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const count = countData?.data?.count ?? 0;
  const notifications = data?.data?.notifications ?? [];
  const inboxRoute = user?.role === 'agent'
    ? ROUTES.AGENT_NOTIFICATIONS
    : user?.role === 'admin' || user?.role === 'superadmin'
      ? ROUTES.ADMIN_NOTIFICATIONS
      : ROUTES.NOTIFICATIONS;

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" aria-label="Notifications" aria-expanded={open}>
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#0F172A]">Notifications</p>
            {count > 0 && <button onClick={() => markAllRead.mutate()} className="inline-flex items-center gap-1 text-xs font-medium text-[#006A61] hover:underline"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>}
          </div>
          {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p> : <div className="divide-y divide-slate-100">{notifications.map((notification) => <button key={notification._id} onClick={() => { if (!notification.readAt) markRead.mutate(notification._id); }} className={cn('block w-full px-4 py-3 text-left hover:bg-slate-50', !notification.readAt && 'bg-[#00C9A7]/[0.04]')}><div className="flex gap-2"><Circle className={cn('mt-1 h-2 w-2 shrink-0 fill-current', notification.readAt ? 'text-transparent' : 'text-[#00A88C]')} /><div className="min-w-0"><p className="text-sm font-medium text-[#0F172A]">{notification.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notification.body}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p></div></div></button>)}</div>}
          <Link to={inboxRoute} onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-[#006A61] hover:bg-slate-50">View all notifications</Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;