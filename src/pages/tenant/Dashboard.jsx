import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import PropertyCard from '../../components/property/PropertyCard';
import StatCard from '../../components/dashboard/StatCard';
import { VisitStatusBadge } from '../../components/common/Badge';
import { ErrorState } from '../../components/common/Feedback';
import { Skeleton, StatSkeleton, PropertyGridSkeleton, RowSkeleton } from '../../components/common/Skeleton';
import { cn, formatDate, greeting, timeAgo } from '../../utils/format';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import propertyService from '../../services/propertyService';
import visitService from '../../services/visitService';
import messageService from '../../services/messageService';

/** "11:00 AM" → "11:00", "03:05 PM" → "15:05" */
function to24(time = '') {
  const m = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '00:00';
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

function visitSortKey(v) {
  return `${v.date}T${to24(v.time)}`;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function Section({ title, to, toLabel = 'View all', className = '', children }) {
  return (
    <section className={cn('rounded-xl border border-line bg-white p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
        {to && (
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
          >
            {toLabel}
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function SectionEmpty({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/70 px-6 py-10 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-line">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {message && <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">{message}</p>}
      {actionLabel && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Tenant Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.id;

  const favorites = useAsync(() => propertyService.getFavorites(uid), [uid], { immediate: Boolean(uid) });
  const pending = useAsync(() => visitService.listByTenant(uid, 'pending'), [uid], { immediate: Boolean(uid) });
  const approved = useAsync(() => visitService.listByTenant(uid, 'approved'), [uid], { immediate: Boolean(uid) });
  const convos = useAsync(() => messageService.conversations(uid), [uid], { immediate: Boolean(uid) });
  const recommended = useAsync(() => propertyService.getFeatured(3), [], { immediate: true });

  const savedList = favorites.data || [];
  const pendingList = pending.data || [];
  const approvedList = approved.data || [];
  const conversationList = convos.data || [];
  const recommendations = recommended.data || [];

  const unreadMessages = useMemo(
    () => conversationList.reduce((sum, c) => sum + (c.unread || 0), 0),
    [conversationList]
  );

  const upcoming = useMemo(() => {
    const today = todayKey();
    return [...pendingList, ...approvedList]
      .filter((v) => v.date >= today)
      .sort((a, b) => visitSortKey(a).localeCompare(visitSortKey(b)));
  }, [pendingList, approvedList]);

  const loading = Boolean(
    (favorites.loading && !favorites.data) ||
      (pending.loading && !pending.data) ||
      (approved.loading && !approved.data) ||
      (convos.loading && !convos.data) ||
      (recommended.loading && !recommended.data)
  );

  const error = favorites.error || pending.error || approved.error || convos.error || recommended.error;

  if (!user) return null;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          favorites.reload();
          pending.reload();
          approved.reload();
          convos.reload();
          recommended.reload();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="animate-fade-up space-y-6">
        <div>
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <PropertyGridSkeleton count={2} />
          <RowSkeleton rows={3} />
        </div>
        <PropertyGridSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500">Here is what is happening with your property search.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saved Properties"
          value={savedList.length}
          icon={<Icon name="heart" className="h-5 w-5" />}
          tone="brand"
          hint="From your shortlist"
        />
        <StatCard
          label="Pending Visits"
          value={pendingList.length}
          icon={<Icon name="clock" className="h-5 w-5" />}
          tone="warning"
          hint="Awaiting owner reply"
        />
        <StatCard
          label="Approved Visits"
          value={approvedList.length}
          icon={<Icon name="check" className="h-5 w-5" />}
          tone="success"
          hint="Confirmed walkthroughs"
        />
        <StatCard
          label="Unread Messages"
          value={unreadMessages}
          icon={<Icon name="chat" className="h-5 w-5" />}
          tone="danger"
          hint="Across all threads"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section title="Recent Saved Properties" to="/tenant/saved" className="lg:col-span-3">
          {savedList.length === 0 ? (
            <SectionEmpty
              icon="bookmark"
              title="Nothing saved yet"
              message="Tap the heart on any listing to keep it here for later."
              actionLabel="Browse properties"
              onAction={() => navigate('/browse')}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {savedList.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} compact />
              ))}
            </div>
          )}
        </Section>

        <div className="space-y-6 lg:col-span-2">
          <Section title="Upcoming Visits" to="/tenant/visits">
            {upcoming.length === 0 ? (
              <SectionEmpty
                icon="calendar"
                title="No upcoming visits"
                message="Request a visit from any listing to schedule a walkthrough."
                actionLabel="Browse properties"
                onAction={() => navigate('/browse')}
              />
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((v) => (
                  <div key={v.id} className="flex items-start gap-3.5 rounded-xl border border-line p-3.5 transition hover:border-brand-200">
                    <Link
                      to={`/property/${v.propertyId}`}
                      aria-label={`View ${v.property?.title}`}
                      className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <Icon name="building" className="h-6 w-6" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/property/${v.propertyId}`} className="line-clamp-1 text-sm font-semibold text-slate-900 transition hover:text-brand-700">
                          {v.property?.title}
                        </Link>
                        <VisitStatusBadge status={v.status} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{v.property?.location}</span>
                      </p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(v.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                          {v.time}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Recent Messages" to="/tenant/messages">
            {conversationList.length === 0 ? (
              <SectionEmpty
                icon="chat"
                title="No messages yet"
                message="Reach out to owners from any listing to start a conversation."
                actionLabel="Browse properties"
                onAction={() => navigate('/browse')}
              />
            ) : (
              <div className="space-y-3">
                {conversationList.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to="/tenant/messages"
                    className="flex items-center gap-3 rounded-xl border border-line p-3.5 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <Avatar name={c.other?.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{c.other?.name || 'Owner'}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(c.updatedAt)}</span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                        {c.unread > 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />}
                        <span className="truncate">{c.lastMessage?.text || 'No messages yet'}</span>
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-900 px-1.5 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      <Section title="Recommended for You" to="/browse" toLabel="Explore all">
        {recommendations.length === 0 ? (
          <SectionEmpty
            icon="building"
            title="No recommendations yet"
            message="Check back soon — we curate listings based on your searches and saved properties."
            actionLabel="Browse properties"
            onAction={() => navigate('/browse')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recommendations.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}