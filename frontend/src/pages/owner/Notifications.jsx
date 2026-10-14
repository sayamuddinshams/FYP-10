import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { RowSkeleton } from '../../components/common/Skeleton';

import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { cn, timeAgo } from '../../utils/format';

const TYPE_META = {
  listing_approved: { icon: 'check', tone: 'bg-emerald-50 text-emerald-600', group: 'Listings' },
  listing_pending: { icon: 'clock', tone: 'bg-amber-50 text-amber-600', group: 'Listings' },
  listing_changes: { icon: 'edit', tone: 'bg-amber-50 text-amber-600', group: 'Listings' },
  listing_suspended: { icon: 'pause', tone: 'bg-red-50 text-red-600', group: 'Listings' },
  listing_rejected: { icon: 'flag', tone: 'bg-red-50 text-red-600', group: 'Listings' },
  visit_request: { icon: 'calendar', tone: 'bg-brand-50 text-brand-700', group: 'Visits' },
  visit_approved: { icon: 'check', tone: 'bg-emerald-50 text-emerald-600', group: 'Visits' },
  visit_rescheduled: { icon: 'refresh', tone: 'bg-sky-50 text-sky-600', group: 'Visits' },
  visit_rejected: { icon: 'x', tone: 'bg-red-50 text-red-600', group: 'Visits' },
  visit_completed: { icon: 'verified', tone: 'bg-brand-50 text-brand-700', group: 'Visits' },
  message: { icon: 'chat', tone: 'bg-sky-50 text-sky-600', group: 'Messages' },
  fee_update: { icon: 'coins', tone: 'bg-brand-50 text-brand-700', group: 'Payments' },
  property_update: { icon: 'building', tone: 'bg-slate-100 text-slate-500', group: 'Listings' },
  report: { icon: 'flag', tone: 'bg-red-50 text-red-600', group: 'Reports' },
  system: { icon: 'info', tone: 'bg-slate-100 text-slate-500', group: 'System' },
};

const FALLBACK_META = { icon: 'bell', tone: 'bg-slate-100 text-slate-500', group: 'Updates' };

export default function Notifications() {
  useDocumentTitle('Notifications');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState('');

  const { data, loading, error, reload, setData } = useAsync(
    () => notificationService.list(user.id),
    [user?.id],
    { immediate: Boolean(user) }
  );

  const items = data || [];
  const unreadCount = items.filter((n) => !n.read).length;

  const rows = useMemo(
    () => (tab === 'unread' ? items.filter((n) => !n.read) : items),
    [items, tab]
  );

  async function markRead(note) {
    if (note.read) {
      if (note.link) navigate(note.link);
      return;
    }
    setBusyId(note.id);
    setData((prev) => (prev || []).map((n) => (n.id === note.id ? { ...n, read: true } : n)));
    try {
      await notificationService.markRead(note.id);
      if (note.link) navigate(note.link);
    } catch (err) {
      toast.error(err?.message || 'Unable to update the notification.');
      reload();
    } finally {
      setBusyId('');
    }
  }

  async function markAll() {
    setBusyId('all');
    try {
      await notificationService.markAllRead(user.id);
      toast.success('All notifications marked as read.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to mark all as read.');
    } finally {
      setBusyId('');
    }
  }

  const empty = (
    <div className="rounded-xl border border-line bg-white">
      <EmptyState
        icon="bell"
        title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'}
        message={
          tab === 'unread'
            ? 'Every notification has been read. New listing decisions and visit requests will show up here.'
            : 'Listing approvals, visit requests and payment updates will appear here as they happen.'
        }
        actionLabel={tab !== 'all' ? 'Show all notifications' : undefined}
        onAction={() => setTab('all')}
      />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Notifications"
        subtitle="Listing decisions, visit requests, messages and payment updates for your properties."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            loading={busyId === 'all'}
            disabled={unreadCount === 0 || Boolean(busyId)}
          >
            <Icon name="check" className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="mb-5">
        <Tabs
          ariaLabel="Filter notifications"
          tabs={[
            { value: 'all', label: 'All', count: items.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
          ]}
          value={tab}
          onChange={setTab}
        />
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          {loading && !data
            ? 'Loading notifications…'
            : error && !data
              ? 'Notifications could not be loaded.'
              : `${rows.length} ${rows.length === 1 ? 'notification' : 'notifications'} shown · ${unreadCount} unread`}
        </p>
      </div>

      {error && !data && <ErrorState message={error} onRetry={reload} />}
      {loading && !data && !error && <RowSkeleton rows={5} />}

      {data && !error && (
        <div key={tab} className="space-y-2.5 animate-fade-up">
          {rows.length === 0 ? (
            empty
          ) : (
            <ul className="space-y-2.5">
              {rows.map((note) => {
                const meta = TYPE_META[note.type] || FALLBACK_META;
                return (
                  <li
                    key={note.id}
                    className={cn(
                      'group flex items-start gap-3.5 rounded-xl border bg-white px-4 py-3.5 transition-all duration-200 sm:px-5',
                      note.read
                        ? 'border-line hover:border-brand-200'
                        : 'border-brand-100 bg-brand-50/40 shadow-sm hover:border-brand-200'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        meta.tone
                      )}
                    >
                      <Icon name={meta.icon} className="h-5 w-5" />
                    </span>

                    <button
                      type="button"
                      onClick={() => markRead(note)}
                      disabled={busyId === note.id}
                      className="min-w-0 flex-1 text-left focus-visible:rounded-lg"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{note.title}</span>
                        {!note.read && (
                          <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                            New
                          </span>
                        )}
                        <span className="ml-auto text-xs text-slate-500">{timeAgo(note.at)}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-600">{note.body}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-medium text-slate-500">{meta.group}</span>
                        {note.link && (
                          <span className="inline-flex items-center gap-1 font-semibold text-brand-700 transition group-hover:text-brand-900">
                            Open
                            <Icon name="arrowRight" className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </span>
                    </button>

                    {!note.read && (
                      <button
                        type="button"
                        onClick={() => markRead(note)}
                        aria-label={`Mark "${note.title}" as read`}
                        className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-slate-500 transition hover:border-brand-300 hover:text-brand-700 sm:flex"
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
      )}
    </div>
  );
}
