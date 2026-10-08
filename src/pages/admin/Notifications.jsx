import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/format';
import notificationService from '../../services/notificationService';
import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { RowSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const TYPE_META = {
  listing_pending: { icon: 'file', ring: 'bg-amber-50 text-amber-600' },
  report: { icon: 'flag', ring: 'bg-red-50 text-red-600' },
  system: { icon: 'info', ring: 'bg-slate-100 text-slate-500' },
  listing_approved: { icon: 'check', ring: 'bg-emerald-50 text-emerald-600' },
  message: { icon: 'chat', ring: 'bg-brand-50 text-brand-700' },
  fee_update: { icon: 'coins', ring: 'bg-brand-50 text-brand-700' },
  listing_changes: { icon: 'edit', ring: 'bg-amber-50 text-amber-600' },
  listing_suspended: { icon: 'pause', ring: 'bg-red-50 text-red-600' },
  property_update: { icon: 'tag', ring: 'bg-sky-50 text-sky-600' },
};

function typeMeta(type = '') {
  if (type.startsWith('visit_')) return { icon: 'calendar', ring: 'bg-sky-50 text-sky-600' };
  return TYPE_META[type] || { icon: 'bell', ring: 'bg-slate-100 text-slate-500' };
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

export default function Notifications() {
  useDocumentTitle('Notifications');
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data, loading, error, reload } = useAsync(() => notificationService.list(user?.id), [user?.id]);

  const items = data || [];
  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = useMemo(
    () => (filter === 'unread' ? items.filter((n) => !n.read) : items),
    [items, filter]
  );

  async function markRead(note) {
    if (note.read) return;
    try {
      await notificationService.markRead(note.id);
      reload();
    } catch {
      // best effort
    }
  }

  async function markAllRead() {
    if (!user?.id || !unreadCount) return;
    try {
      await notificationService.markAllRead(user.id);
      reload();
    } catch {
      // best effort
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`Platform-wide activity for your admin account — ${unreadCount} unread.`}
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={!unreadCount}>
            <Icon name="check" className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
              {f.value === 'unread' && unreadCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-900 px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <RowSkeleton rows={6} />
      ) : !filtered.length ? (
        <EmptyState
          icon="bell"
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          message={
            filter === 'unread'
              ? 'You are all caught up. New platform activity will appear here.'
              : 'Listing submissions, reports, payouts and system updates will appear here.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => {
            const meta = typeMeta(n.type);
            return (
              <li
                key={n.id}
                className={`group relative flex items-start gap-3.5 rounded-xl border bg-white p-4 transition animate-fade-up ${
                  n.read ? 'border-line' : 'border-brand-200 shadow-sm'
                }`}
              >
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.ring}`}>
                  <Icon name={meta.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />}
                      <span className="text-xs text-slate-400">{timeAgo(n.at)}</span>
                    </div>
                  </div>
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={() => markRead(n)}
                      className="mt-1 block text-sm leading-relaxed text-slate-600 hover:text-brand-700"
                    >
                      {n.body}
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{n.body}</p>
                  )}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n)}
                    aria-label={`Mark "${n.title}" as read`}
                    className="self-center rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-brand-700 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Icon name="check" className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}