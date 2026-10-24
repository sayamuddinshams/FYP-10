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
import Badge, { TransactionStatusBadge } from '../../components/common/Badge';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';

export default function Dashboard() {
  useDocumentTitle('Platform Overview — Admin Command');
  const navigate = useNavigate();

  const overview = useAsync(() => adminService.overview(), []);
  const analytics = useAsync(() => adminService.analytics(), []);
  const pending = useAsync(() => propertyService.adminList('pending'), []);
  const reports = useAsync(() => adminService.listReports('open'), []);
  const transactions = useAsync(() => transactionService.list({ status: 'all' }), []);
  const finance = useAsync(() => transactionService.adminSummary(), []);

  const o = overview.data;
  const a = analytics.data;

  const recentTransactions = useMemo(() => (transactions.data || []).slice(0, 5), [transactions.data]);
  const openReportsList = useMemo(() => (reports.data || []).slice(0, 3), [reports.data]);

  // Executive Top KPI Cards
  const statCards = [
    {
      label: 'Registered Ecosystem',
      value: (o?.totalUsers || 0) + (o?.totalOwners || 0),
      tone: 'brand',
      icon: <Icon name="users" className="h-5 w-5" />,
      hint: `${o?.totalUsers || 0} tenants • ${o?.totalOwners || 0} owners/agents`,
    },
    {
      label: 'Active Listings',
      value: o?.activeListings,
      tone: 'success',
      icon: <Icon name="building" className="h-5 w-5" />,
      hint: `Out of ${o?.totalProperties || 0} total registered inventory`,
    },
    {
      label: 'Platform Revenue',
      value: finance.data?.fees || o?.platformRevenue,
      prefix: 'Rs ',
      tone: 'success',
      icon: <Icon name="coins" className="h-5 w-5" />,
      hint: '5% commission collected on rent',
    },
    {
      label: 'Action Required',
      value: (pending.data?.length || 0) + (o?.openReports || 0),
      tone: (pending.data?.length || 0) + (o?.openReports || 0) > 0 ? 'warning' : 'neutral',
      icon: <Icon name="shield" className="h-5 w-5" />,
      hint: `${pending.data?.length || 0} pending reviews • ${o?.openReports || 0} open reports`,
    },
  ];

  /** Chart body with explicit loading / empty / data states */
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

  // Calculation for financial collection progress bar
  const feesCollected = finance.data?.fees || 0;
  const feesPending = finance.data?.pendingFees || 0;
  const totalFees = feesCollected + feesPending;
  const collectionPct = totalFees > 0 ? Math.round((feesCollected / totalFees) * 100) : 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Command Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Platform Overview"
          subtitle="Real-time ecosystem metrics, property moderation queue, trust dispatch, and financial settlements across Gilgit-Baltistan."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Synced
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              overview.reload();
              pending.reload();
              finance.reload();
              reports.reload();
              transactions.reload();
            }}
            className="text-xs"
          >
            <Icon name="refresh" className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Stats KPI Grid */}
      {overview.loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.reload} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* High-Priority Operations Hub: Platform Revenue & Trust Dispatch */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Revenue & Settlement Card */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20">
                  <Icon name="coins" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900">Platform Revenue &amp; Settlements</h3>
                  <p className="text-xs text-slate-500">5% platform service fee on verified rental leases</p>
                </div>
              </div>
            </div>
            <Badge tone="success" className="shrink-0 font-bold">5.0% Fee Rate</Badge>
          </div>

          {finance.loading ? (
            <div className="mt-6">
              <StatSkeleton />
            </div>
          ) : finance.error ? (
            <div className="mt-4">
              <ErrorState message={finance.error} onRetry={finance.reload} compact />
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {/* Highlight Hero Metric */}
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-teal-50/20 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">Total Fees Collected</span>
                  <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    {collectionPct}% Settled
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-slate-950">
                    {formatPrice(feesCollected)}
                  </span>
                  <span className="text-xs font-medium text-emerald-700">realized revenue</span>
                </div>

                {/* Progress Visual Bar */}
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${collectionPct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
                    <span>Collected: {formatPrice(feesCollected)}</span>
                    <span>Pending Escrow: {formatPrice(feesPending)}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Metric Tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                  <p className="text-[11px] font-medium text-slate-500">Fees Collected</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{formatPrice(feesCollected)}</p>
                  <p className="mt-0.5 text-[10px] text-emerald-600 font-semibold">Ready for payout</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                  <p className="text-[11px] font-medium text-slate-500">Pending Fees</p>
                  <p className="mt-1 text-base font-bold text-amber-700">{formatPrice(feesPending)}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">In escrow cycle</p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                  <p className="text-[11px] font-medium text-slate-500">Gross Rental Volume</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{formatPrice(finance.data?.revenue || 0)}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{finance.data?.count || 0} leases transacted</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Automatic payouts distributed to owners upon check-in</span>
                <Link
                  to="/admin/transactions"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
                >
                  Open Ledger
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Trust & Safety Priority Dispatch Card */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-500/20">
                <Icon name="flag" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900">Trust &amp; Safety Dispatch</h3>
                <p className="text-xs text-slate-500">Moderation flags and tenant protection reports</p>
              </div>
            </div>
            <Badge tone={(o?.openReports || 0) > 0 ? 'warning' : 'success'} className="shrink-0 font-bold">
              {(o?.openReports || 0) > 0 ? `${o?.openReports} Open Item${o?.openReports === 1 ? '' : 's'}` : 'All Clear'}
            </Badge>
          </div>

          {reports.loading ? (
            <div className="mt-6">
              <StatSkeleton />
            </div>
          ) : reports.error ? (
            <div className="mt-4">
              <ErrorState message={reports.error} onRetry={reports.reload} compact />
            </div>
          ) : openReportsList.length === 0 ? (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/40 p-6 text-center">
              <Icon name="check" className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-2 text-sm font-bold text-slate-900">No unresolved complaints</p>
              <p className="mt-1 text-xs text-slate-500">All member disputes and property flag reports have been resolved.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active safety tickets needing investigation
              </p>
              <div className="space-y-2.5">
                {openReportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 transition-all hover:border-amber-300 hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 uppercase tracking-wide">
                          {rep.reason}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 capitalize">
                          {rep.type}
                        </span>
                      </div>
                      <p className="truncate text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {rep.targetLabel}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {rep.details}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-slate-400">
                      {formatDate(rep.createdAt)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Investigate fraud flags or incorrect pricing</span>
                <Link
                  to="/admin/reports"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 transition-colors"
                >
                  Review All Reports ({o?.openReports || openReportsList.length})
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Main Operational Workspace: Moderation Queue & Recent Settlements */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left (7 Cols): Pending Property Reviews Queue */}
        <section className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-serif text-lg font-bold text-slate-900">Pending Property Reviews</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {pending.data?.length || 0} waiting
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Listings submitted by mountain hosts awaiting moderation approval before public release.
              </p>
            </div>
            <Link
              to="/admin/properties?status=pending"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
            >
              View all queue →
            </Link>
          </header>

          <div className="flex-1 pt-4">
            {pending.loading ? (
              <TableSkeleton rows={3} cols={4} />
            ) : pending.error ? (
              <ErrorState message={pending.error} onRetry={pending.reload} compact />
            ) : !pending.data?.length ? (
              <EmptyState
                icon="inbox"
                title="Moderation queue clear"
                message="All submitted properties have been reviewed and approved. Great job!"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.data.slice(0, 4).map((p) => (
                  <article
                    key={p.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 first:pt-0 last:pb-0 transition-colors hover:bg-slate-50/60 rounded-xl px-2 -mx-2"
                  >
                    {/* Fixed Size Thumbnail with Type Badge */}
                    <div className="relative h-20 w-full sm:h-22 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs">
                      <ImageWithFallback
                        src={p.images?.[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-[#0B1320]/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-xs uppercase tracking-wider">
                        {p.type}
                      </span>
                    </div>

                    {/* Listing Information */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          <Icon name="pin" className="h-3 w-3 text-slate-400" />
                          {p.district}{p.area ? ` • ${p.area}` : p.city ? ` • ${p.city}` : ''}
                        </span>
                        <span className="font-serif text-xs font-bold text-emerald-700">
                          {formatPrice(p.price)}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                        </span>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-slate-900 truncate group-hover:text-amber-800 transition-colors">
                        {p.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Icon name="user" className="h-3 w-3 text-slate-400" />
                          {p.owner?.name || 'Deosai Property Group'}
                          {p.ownerVerified && (
                            <Icon name="verified" className="h-3 w-3 text-emerald-600" />
                          )}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">
                          Submitted {formatDate(p.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/properties/${p.id}/review`)}
                        className="group-hover:border-amber-400 group-hover:text-amber-800 group-hover:bg-amber-50/50 font-semibold"
                      >
                        Review Listing
                        <Icon name="arrowRight" className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standard review SLA: Within 24 business hours</span>
            <Link to="/admin/properties" className="text-brand-700 font-semibold hover:underline">
              Browse all {o?.totalProperties || 0} listings
            </Link>
          </div>
        </section>

        {/* Right (5 Cols): Recent Settlements / Transactions */}
        <section className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Recent Transactions</h3>
              <p className="mt-0.5 text-xs text-slate-500">Latest rental settlements on the platform</p>
            </div>
            <Link
              to="/admin/transactions"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
            >
              View all →
            </Link>
          </header>

          <div className="flex-1 pt-4">
            {transactions.loading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : transactions.error ? (
              <ErrorState message={transactions.error} onRetry={transactions.reload} compact />
            ) : !recentTransactions.length ? (
              <EmptyState
                icon="inbox"
                title="No transactions yet"
                message="Rental settlements will appear here once tenants complete payments."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTransactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-slate-50/50 rounded-lg px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <Icon name={t.status === 'completed' ? 'check' : 'clock'} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {t.property?.title || 'Mountain Property Lease'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {t.id} · {formatDate(t.date)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-xs font-bold text-slate-900">{formatPrice(t.amount)}</p>
                      <TransactionStatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold"
              as={Link}
              to="/admin/transactions"
            >
              Open Complete Ledger
            </Button>
          </div>
        </section>
      </div>

      {/* Market Trends & Analytical Charts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Ecosystem Analytics &amp; Market Growth</h2>
            <p className="text-xs text-slate-500">Historical velocity of accounts, listings, and tenant inquiries</p>
          </div>
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
          >
            Deep-dive charts &amp; telemetry
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>

        {chartsError ? (
          <ErrorState message={chartsError} onRetry={analytics.reload} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <ChartCard title="User Growth" subtitle="Registered tenants over the last six months">
                {chartBody(chartsLoading, a?.userGrowth, () => (
                  <LineChart data={a.userGrowth} valueKey="users" />
                ))}
              </ChartCard>
            </div>
            <div>
              <ChartCard title="Property Growth" subtitle="Listings added per month across 10 districts">
                {chartBody(chartsLoading, a?.propertyGrowth, () => (
                  <BarChart data={a.propertyGrowth} valueKey="properties" />
                ))}
              </ChartCard>
            </div>
            <div>
              <ChartCard title="Listing Status" subtitle="Distribution of all listings by moderation status">
                {chartBody(chartsLoading, a?.listingStatus, () => (
                  <DonutChart data={a.listingStatus} />
                ))}
              </ChartCard>
            </div>
            <div>
              <ChartCard title="Visit Requests" subtitle="Monthly mountain property visit inquiry volume">
                {chartBody(chartsLoading, a?.visitRequests, () => (
                  <BarChart data={a.visitRequests} valueKey="value" />
                ))}
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}