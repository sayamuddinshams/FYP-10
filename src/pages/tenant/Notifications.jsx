import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Tabs from '../../components/common/Tabs';
import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { RowSkeleton } from '../../components/common/Skeleton';
import { cn, timeAgo } from '../../utils/format';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import notificationService from '../../services/notificationService';

const TYPE_STYLES = {
  visit_approved: { icon: 'check', wrap: 'bg-emerald-50 text-emerald-600' },
  visit_rejected: { icon: 'x', wrap: 'bg-red-50 text-red-600' },
  visit_rescheduled: { icon: 'calendar', wrap: 'bg-sky-50 text-sky-600' },
  visit_pending: { icon: 'clock', wrap: 'bg-amber-50 text-amber-600' },
  visit_request: { icon: 'calendar', wrap: 'bg-brand-50 text-brand-700' },
  message: { icon: 'chat', wrap: 'bg-brand-50 text-brand-700' },
  property_update: { icon: 'building', wrap: 'bg-amber-50 text-amber-600' },
  system: { icon: 'info', wrap: 'bg-slate-100 text-slate-500' },
};

const FALLBACK_STYLE = { icon: 'bell', wrap: 'bg-slate-100 text-slate-500' };

export default function Notifications() {
  useDocumentTitle('Notifications');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState('all');

  const { data, loading, error, reload } = useAsync(() => notificationService.list(user?.id), [user?.id], {
    immediate: Boolean(user),
  });

  const items = data || [];
  const visible = useMemo(() => (filter === 'unread' ? items.filter((n) => !n.read) : items), [items, filter]);
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  async function handleMarkAllRead() {
    if (!user || unread === 0) return;
    try {
      await notificationService.markAllRead(user.id);
      toast.success('All notifications marked as read.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Could not update notifications.');
    }
  }

  async function handleMarkRead(n) {
    try {
      await notificationService.markRead(n.id);
      reload();
    } catch (err) {
      toast.error(err?.message || 'Could not mark as read.');
    }
  }

  function openNotification(n) {
    if (n.link) navigate(n.link);
  }

  if (!user) return null;

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Notifications"
        subtitle={
          unread > 0
            ? `You have ${unread} unread ${unread === 1 ? 'update' : 'updates'}.`
            : 'You are all caught up.'
        }
        actions={
          <Button variant="outline" size="sm" disabled={unread === 0} onClick={handleMarkAllRead}>
            <Icon name="check" className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <Tabs
        tabs={[
          { value: 'all', label: 'All', count: items.length },
          { value: 'unread', label: 'Unread', count: unread },
        ]}
        value={filter}
        onChange={setFilter}
        variant="pill"
        ariaLabel="Filter notifications"
        className="mb-6"
      />

      {loading && !data ? (
        <RowSkeleton rows={6} />
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          {filter === 'unread' ? (
            <EmptyState
              icon="bell"
              title="No unread notifications"
              message="You have read everything — new updates about visits and messages will land here."
            />
          ) : (
            <EmptyState
              icon="bell"
              title="You're all caught up"
              message="Updates about visits, messages and saved properties will appear here."
              actionLabel="Browse properties"
              onAction={() => navigate('/browse')}
            />
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => {
            const style = TYPE_STYLES[n.type] || FALLBACK_STYLE;
            return (
              <li key={n.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openNotification(n)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openNotification(n);
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition sm:px-5',
                    n.read
                      ? 'border-line bg-white hover:border-brand-200'
                      : 'border-brand-200 bg-brand-50/40 hover:bg-brand-50/70'
                  )}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', style.wrap)}>
                    <Icon name={style.icon} className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn('text-sm', n.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900')}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.at)}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{n.body}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n);
                        }}
                        className="rounded-lg border border-line bg-white p-2 text-slate-400 transition hover:border-brand-200 hover:text-brand-700"
                        aria-label={`Mark “${n.title}” as read`}
                      >
                        <Icon name="eye" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}