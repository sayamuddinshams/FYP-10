import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatDate, formatNumber, formatPrice } from '../../utils/format';
import adminService from '../../services/adminService';
import propertyService from '../../services/propertyService';
import transactionService from '../../services/transactionService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { LineChart, BarChart, DonutChart } from '../../components/dashboard/charts';
import { TableSkeleton, StatSkeleton, LineSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/Feedback';
import EmptyState from '../../components/common/EmptyState';
import { TransactionStatusBadge } from '../../components/common/Badge';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';

export default function Dashboard() {
  useDocumentTitle('Platform Overview');
  const navigate = useNavigate();

  const overview = useAsync(() => adminService.overview(), []);
  const analytics = useAsync(() => adminService.analytics(), []);
  const pending = useAsync(() => propertyService.adminList('pending'), []);
  const transactions = useAsync(() => transactionService.list({ status: 'all' }), []);
  const finance = useAsync(() => transactionService.adminSummary(), []);

  const o = overview.data;
  const a = analytics.data;

  const recentTransactions = useMemo(() => (transactions.data || []).slice(0, 5), [transactions.data]);

  // KPIs are built strictly from adminService.overview() fields — no invented deltas.
  const statCards = [
    { label: 'Total Tenants', value: o?.totalUsers, tone: 'brand', icon: <Icon name="users" className="h-5 w-5" />, hint: 'registered tenant accounts' },
    { label: 'Total Owners', value: o?.totalOwners, tone: 'info', icon: <Icon name="user" className="h-5 w-5" />, hint: 'owners & agents' },
    { label: 'Total Properties', value: o?.totalProperties, tone: 'brand', icon: <Icon name="building" className="h-5 w-5" />, hint: 'listings of all statuses' },
    { label: 'Pending Properties', value: o?.pendingProperties, tone: 'warning', icon: <Icon name="file" className="h-5 w-5" />, hint: 'awaiting review' },
    { label: 'Active Listings', value: o?.activeListings, tone: 'success', icon: <Icon name="check" className="h-5 w-5" />, hint: 'approved & live' },
    { label: 'Visit Requests', value: o?.visitRequests, tone: 'info', icon: <Icon name="calendar" className="h-5 w-5" />, hint: 'received to date' },
    { label: 'Platform Revenue', value: o?.platformRevenue, prefix: 'Rs ', tone: 'success', icon: <Icon name="coins" className="h-5 w-5" />, hint: 'fees from completed rent' },
  ];

  /** Chart body with explicit loading / empty / data states (works for empty datasets). */
  function chartBody(loading, dataset, render) {
    if (loading) return <LineSkeleton />;
    if (!dataset?.length) {
      return (
        <EmptyState
          icon="chart"
          title="No data yet"
          message="This chart will populate as platform activity is recorded."
        />
      );
    }
    return render();
  }

  const chartsLoading = analytics.loading;
  const chartsError = analytics.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        subtitle="A live summary of users, listings, visits and revenue across Gilgit-Baltistan."
      />

      {/* Stats */}
      {overview.loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {statCards.map((card, i) => (
            <div key={card.label} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <StatCard {...card} />
            </div>
          ))}
          <div className="hidden items-center justify-center rounded-xl border border-dashed border-line bg-white/60 p-5 text-center xl:flex">
            <Link to="/admin/analytics" className="group flex flex-col items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700">
              <Icon name="chart" className="h-5 w-5" />
              View full analytics
              <span className="text-xs text-slate-500 group-hover:text-brand-600">Deep-dive charts &amp; trends</span>
            </Link>
          </div>
        </div>
      )}

      {/* Charts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900">Market trends</h2>
        {chartsError ? (
          <ErrorState message={chartsError} onRetry={analytics.reload} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="animate-fade-up">
              <ChartCard title="User Growth" subtitle="Registered tenants over the last six months">
                {chartBody(chartsLoading, a?.userGrowth, () => (
                  <LineChart data={a.userGrowth} valueKey="users" />
                ))}
              </ChartCard>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
              <ChartCard title="Property Growth" subtitle="Listings added per month">
                {chartBody(chartsLoading, a?.propertyGrowth, () => (
                  <BarChart data={a.propertyGrowth} valueKey="properties" />
                ))}
              </ChartCard>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <ChartCard title="Listing Status" subtitle="Distribution of all listings by moderation status">
                {chartBody(chartsLoading, a?.listingStatus, () => (
                  <DonutChart data={a.listingStatus} />
                ))}
              </ChartCard>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
              <ChartCard title="Visit Requests" subtitle="Visit volume per month">
                {chartBody(chartsLoading, a?.visitRequests, () => (
                  <BarChart data={a.visitRequests} valueKey="value" />
                ))}
              </ChartCard>
            </div>
          </div>
        )}
      </div>

      {/* Quick action sections */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Pending property reviews */}
        <section className="rounded-xl border border-line bg-white p-5 xl:col-span-2 sm:p-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Pending property reviews</h3>
              <p className="mt-0.5 text-xs text-slate-500" aria-live="polite">
                {pending.loading
                  ? 'Loading listings awaiting review…'
                  : pending.error
                    ? 'Listings could not be loaded.'
                    : `${pending.data?.length || 0} listing${(pending.data?.length || 0) === 1 ? '' : 's'} waiting for moderation approval.`}
              </p>
            </div>
            <Link to="/admin/properties?status=pending" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
              View all →
            </Link>
          </header>
          {pending.loading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : pending.error ? (
            <ErrorState message={pending.error} onRetry={pending.reload} compact />
          ) : !pending.data?.length ? (
            <EmptyState
              icon="inbox"
              title="All caught up"
              message="There are no listings waiting for review right now."
            />
          ) : (
            <ul className="divide-y divide-line">
              {pending.data.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <ImageWithFallback
                    src={p.images?.[0]}
                    alt={p.title}
                    imgClassName="h-12 w-12 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                      <span>{p.owner?.name || 'Unknown owner'}</span>
                      <span className="text-slate-400">•</span>
                      <span>Submitted {formatDate(p.createdAt)}</span>
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/properties/${p.id}/review`)}>
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Finance + trust panels */}
        <section className="space-y-6">
          {/* Platform revenue — real figures from transactionService.adminSummary() */}
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Platform revenue</h3>
                <p className="mt-0.5 text-xs text-slate-500">5% platform fee collected on completed rentals.</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon name="coins" className="h-5 w-5" />
              </span>
            </header>
            {finance.loading ? (
              <StatSkeleton />
            ) : finance.error ? (
              <ErrorState message={finance.error} onRetry={finance.reload} compact />
            ) : !finance.data?.count ? (
              <EmptyState
                icon="inbox"
                title="No rental payments yet"
                message="Fees will appear here as soon as tenants complete their first payments."
              />
            ) : (
              <dl className="divide-y divide-line text-sm">
                <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                  <dt className="text-slate-600">Fees collected</dt>
                  <dd className="font-bold text-slate-900">{formatPrice(finance.data.fees)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-slate-600">Pending fees</dt>
                  <dd className="font-semibold text-slate-700">{formatPrice(finance.data.pendingFees)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
                  <dt className="text-slate-600">Gross rental volume</dt>
                  <dd className="font-semibold text-slate-700">{formatPrice(finance.data.revenue)}</dd>
                </div>
              </dl>
            )}
            <Button variant="outline" size="sm" className="mt-4" as={Link} to="/admin/transactions">
              Open transactions
            </Button>
          </div>

          {/* Open reports */}
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Open reports</h3>
                <p className="mt-0.5 text-xs text-slate-500">Trust &amp; safety items needing attention.</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Icon name="flag" className="h-5 w-5" />
              </span>
            </header>
            {overview.loading ? (
              <StatSkeleton />
            ) : overview.error ? (
              <ErrorState message={overview.error} onRetry={overview.reload} compact />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-slate-900" aria-live="polite">
                {formatNumber(o?.openReports || 0)}
                <span className="ml-2 align-middle text-xs font-medium text-slate-500">
                  {o?.openReports === 1 ? 'open report' : 'open reports'}
                </span>
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-4" as={Link} to="/admin/reports">
              Review reports
            </Button>
          </div>

          {/* Recent transactions */}
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Recent transactions</h3>
                <p className="mt-0.5 text-xs text-slate-500">Latest rental settlements on the platform.</p>
              </div>
              <Link to="/admin/transactions" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
                View all →
              </Link>
            </header>
            {transactions.loading ? (
              <TableSkeleton rows={3} cols={3} />
            ) : transactions.error ? (
              <ErrorState message={transactions.error} onRetry={transactions.reload} compact />
            ) : !recentTransactions.length ? (
              <EmptyState icon="inbox" title="No transactions yet" message="Rental settlements will appear here once tenants complete payments." />
            ) : (
              <ul className="divide-y divide-line">
                {recentTransactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.property?.title || 'Property'}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t.id} · {formatDate(t.date)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900">{formatPrice(t.amount)}</p>
                      <TransactionStatusBadge status={t.status} className="mt-1" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}