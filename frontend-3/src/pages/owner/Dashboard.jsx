import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { LineChart, BarChart } from '../../components/dashboard/charts';
import VisitRequestCard from '../../components/property/VisitRequestCard';
import { ListingStatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { PageLoader } from '../../components/common/Spinner';
import { StatSkeleton, RowSkeleton } from '../../components/common/Skeleton';

import propertyService from '../../services/propertyService';
import visitService from '../../services/visitService';
import messageService from '../../services/messageService';
import transactionService from '../../services/transactionService';
import adminService from '../../services/adminService';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatNumber, greeting } from '../../utils/format';

export default function Dashboard() {
  useDocumentTitle('Owner Dashboard');
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();
  const navigate = useNavigate();
  const [busyVisit, setBusyVisit] = useState('');

  const { data, loading, error, reload } = useAsync(
    async () => {
      const [summary, finances, analytics, visits, properties, conversations] = await Promise.all([
        transactionService.ownerSummary(user.id),
        transactionService.summarize(user.id),
        adminService.analytics(),
        visitService.listByOwner(user.id),
        propertyService.getByOwner(user.id),
        messageService.conversations(user.id),
      ]);
      return { summary, finances, analytics, visits, properties, conversations };
    },
    [user?.id],
    { immediate: Boolean(user) }
  );

  if (!user) return <PageLoader label="Loading your dashboard…" />;

  const summary = data?.summary || {};
  const finances = data?.finances || {};
  const analytics = data?.analytics || {};
  const visits = data?.visits || [];
  const properties = data?.properties || [];
  const conversations = data?.conversations || [];

  // Scoped to this owner: top listings by lifetime views (the shared analytics
  // payload only contains marketplace-wide figures).
  const performance = properties
    .filter((p) => Number(p.views) > 0)
    .slice()
    .sort((a, b) => Number(b.views) - Number(a.views))
    .slice(0, 5)
    .map((p) => {
      const full = `${p.title || 'Listing'}${p.area ? `, ${p.area}` : ''}`;
      return { label: full.length > 34 ? `${full.slice(0, 33).trimEnd()}…` : full, views: Number(p.views) || 0 };
    });

  async function handleVisit(visit, status) {
    if (status === 'rejected') {
      const ok = await confirm({
        title: 'Decline this visit request?',
        message: `${visit.tenant?.name || 'The tenant'} will be notified that ${visit.property?.title || 'the property'} is not available at the requested time.`,
        confirmLabel: 'Decline request',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setBusyVisit(visit.id);
    try {
      await visitService.updateStatus(visit.id, status);
      toast.success(
        status === 'approved' ? 'Visit approved.' : 'Visit request declined.',
        'Visit request updated'
      );
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to update the visit request.');
    } finally {
      setBusyVisit('');
    }
  }

  const stats = [
    {
      label: 'Total Properties',
      value: summary.totalProperties,
      icon: <Icon name="building" className="h-5 w-5" />,
      tone: 'brand',
      hint: 'Across every status',
    },
    {
      label: 'Active Listings',
      value: summary.activeListings,
      icon: <Icon name="check" className="h-5 w-5" />,
      tone: 'success',
      hint: 'Live on the marketplace',
    },
    {
      label: 'Pending Approval',
      value: summary.pendingApproval,
      icon: <Icon name="clock" className="h-5 w-5" />,
      tone: 'warning',
      hint: 'With the review team',
    },
    {
      label: 'Total Views',
      value: summary.totalViews,
      icon: <Icon name="eye" className="h-5 w-5" />,
      tone: 'info',
      hint: 'All time, all listings',
    },
    {
      label: 'Visit Requests',
      value: summary.visitRequests,
      icon: <Icon name="calendar" className="h-5 w-5" />,
      tone: 'brand',
      hint: `${summary.pendingVisits || 0} awaiting your response`,
    },
    {
      label: 'Earnings',
      value: finances.totalEarnings,
      prefix: 'Rs ',
      icon: <Icon name="wallet" className="h-5 w-5" />,
      tone: 'success',
      hint: 'Kept after the platform fee',
    },
  ];

  const firstName = (user.name || '').split(' ')[0];

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle="Here is how your rental listings are performing across Gilgit-Baltistan today."
        actions={
          <Button as={Link} to="/owner/properties/new" size="md">
            <Icon name="plus" className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      {loading && !data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="skeleton h-80 rounded-xl lg:col-span-3" />
            <div className="skeleton h-80 rounded-xl lg:col-span-2" />
          </div>
          <div className="mt-5">
            <RowSkeleton rows={3} />
          </div>
        </>
      )}

      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {data && !error && (
        <>
          {/* Statistics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="space-y-5">
          {/* Charts */}
          <div className="grid gap-5 lg:grid-cols-5">
            <ChartCard
              className="lg:col-span-3"
              title="Property Views"
              subtitle="Daily views across your listings"
              actions={
                <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                  Last 6 days
                </span>
              }
            >
              {(analytics.ownerViews || []).length === 0 ? (
                <EmptyState
                  icon="chart"
                  title="No views recorded yet"
                  message="Daily views across your listings appear here as soon as tenants open them."
                  actionLabel="Add Property"
                  onAction={() => navigate('/owner/properties/new')}
                />
              ) : (
                <LineChart
                  data={analytics.ownerViews || []}
                  valueKey="views"
                  height={250}
                  formatValue={(t) => formatNumber(Math.round(t))}
                />
              )}
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-700" /> Views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                  {formatNumber(conversations.length)} tenant conversation
                  {conversations.length === 1 ? '' : 's'} started
                </span>
              </p>
            </ChartCard>

            <ChartCard
              className="lg:col-span-2"
              title="Listing Performance"
              subtitle="Views by listing this month"
            >
              {performance.length === 0 ? (
                <EmptyState
                  icon="chart"
                  title="No listing views yet"
                  message="Once tenants start finding your listings in search, the best performers are ranked here."
                  actionLabel="Add Property"
                  onAction={() => navigate('/owner/properties/new')}
                />
              ) : (
                <BarChart
                  data={performance}
                  valueKey="views"
                  horizontal
                  color="#e11d48"
                  height={250}
                  formatValue={(t) => formatNumber(Math.round(t))}
                />
              )}
            </ChartCard>
          </div>

          {/* Lower sections */}
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">
                    Recent Visit Requests
                  </h2>
                  <p className="text-xs text-slate-500">Respond quickly to keep your conversion high</p>
                </div>
                <Link
                  to="/owner/visits"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
                >
                  View all
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading && !data ? (
                <RowSkeleton rows={3} />
              ) : visits.length === 0 ? (
                <div className="rounded-xl border border-line bg-white">
                  <EmptyState
                    icon="inbox"
                    title="No visit requests yet"
                    message="When a tenant requests a visit to one of your listings, it will appear here."
                    actionLabel="Add a property"
                    onAction={() => navigate('/owner/properties/new')}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.slice(0, 3).map((visit) => (
                    <VisitRequestCard
                      key={visit.id}
                      visit={visit}
                      role="owner"
                      actions={
                        visit.status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="xs"
                              variant="success"
                              loading={busyVisit === visit.id}
                              disabled={Boolean(busyVisit) && busyVisit !== visit.id}
                              onClick={() => handleVisit(visit, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={Boolean(busyVisit)}
                              onClick={() => handleVisit(visit, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Link
                            to="/owner/visits"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
                          >
                            Manage
                            <Icon name="arrowRight" className="h-3.5 w-3.5" />
                          </Link>
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">Recent Listings</h2>
                  <p className="text-xs text-slate-500">Your four most recently updated properties</p>
                </div>
                <Link
                  to="/owner/properties"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
                >
                  View all
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading && !data ? (
                <RowSkeleton rows={4} />
              ) : properties.length === 0 ? (
                <div className="rounded-xl border border-line bg-white">
                  <EmptyState
                    icon="building"
                    title="No listings yet"
                    message="Create your first listing to start receiving views, saves and visit requests."
                    actionLabel="Add Property"
                    onAction={() => navigate('/owner/properties/new')}
                  />
                </div>
              ) : (
                <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                  {properties.slice(0, 4).map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-slate-50/70"
                    >
                      <Link
                        to={`/owner/properties/${property.id}`}
                        className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                      >
                        <img
                          src={property.images?.[0]}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.visibility = 'hidden';
                          }}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/owner/properties/${property.id}`}
                          className="line-clamp-1 text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                        >
                          {property.title}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {property.area}, {property.city} · {property.bedrooms} bed · Rs{' '}
                          {formatNumber(property.price)}/mo
                        </p>
                      </div>

                      <div className="hidden shrink-0 sm:block">
                        <ListingStatusBadge status={property.status} />
                      </div>

                      <span className="flex w-16 shrink-0 items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
                        <Icon name="eye" className="h-3.5 w-3.5 text-slate-500" />
                        {formatNumber(property.views)}
                      </span>

                      <Link
                        to="/owner/properties"
                        className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50"
                      >
                        Manage
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
