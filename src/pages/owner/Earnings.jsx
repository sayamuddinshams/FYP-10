import { useMemo, useState } from 'react';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import DataTable from '../../components/dashboard/DataTable';
import { DonutChart } from '../../components/dashboard/charts';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { TransactionStatusBadge } from '../../components/common/Badge';

import transactionService from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { PLATFORM_FEE_RATE } from '../../utils/constants';
import { cn, formatDate, formatNumber, formatPrice } from '../../utils/format';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export default function Earnings() {
  useDocumentTitle('Earnings');
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data, loading, error, reload } = useAsync(
    async () => {
      const [summary, transactions] = await Promise.all([
        transactionService.summarize(user.id),
        transactionService.listForOwner(user.id),
      ]);
      return { summary, transactions };
    },
    [user?.id],
    { immediate: Boolean(user) }
  );

  const summary = data?.summary;
  const transactions = data?.transactions || [];
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  // The donut shows how completed money is split — with nothing completed there is nothing to split.
  const splitTotal = (summary?.totalEarnings || 0) + (summary?.platformFees || 0);

  const rows = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((t) => t.status === filter)),
    [transactions, filter]
  );

  const stats = [
    {
      label: 'Total Earnings',
      value: summary?.totalEarnings,
      prefix: 'Rs ',
      icon: <Icon name="wallet" className="h-5 w-5" />,
      tone: 'success',
      hint: 'Kept after the platform fee',
    },
    {
      label: 'Pending Amount',
      value: summary?.pendingAmount,
      prefix: 'Rs ',
      icon: <Icon name="clock" className="h-5 w-5" />,
      tone: 'warning',
      hint: 'Cleared once the stay is confirmed',
    },
    {
      label: 'Completed Amount',
      value: summary?.completedAmount,
      prefix: 'Rs ',
      icon: <Icon name="coins" className="h-5 w-5" />,
      tone: 'brand',
      hint: `${completedCount} completed transaction${completedCount === 1 ? '' : 's'}`,
    },
    {
      label: 'Platform Fees',
      value: summary?.platformFees,
      prefix: 'Rs ',
      icon: <Icon name="tag" className="h-5 w-5" />,
      tone: 'info',
      hint: `${Math.round((summary?.rate ?? PLATFORM_FEE_RATE) * 100)}% of each completed rental`,
    },
  ];

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      hideOnMobile: true,
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span>,
    },
    {
      key: 'property',
      label: 'Property',
      render: (row) => (
        <span className="line-clamp-1 font-semibold text-slate-900">
          {row.property?.title || 'Removed listing'}
        </span>
      ),
    },
    {
      key: 'tenant',
      label: 'Tenant',
      hideOnMobile: true,
      render: (row) => <span className="text-slate-600">{row.tenant?.name || '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Rental Amount',
      align: 'right',
      render: (row) => <span className="font-semibold text-slate-900">{formatPrice(row.amount)}</span>,
    },
    {
      key: 'platformFee',
      label: 'Platform Fee',
      align: 'right',
      render: (row) => <span className="text-red-600">− {formatPrice(row.platformFee)}</span>,
    },
    {
      key: 'ownerAmount',
      label: 'Owner Amount',
      align: 'right',
      render: (row) => <span className="font-semibold text-emerald-700">{formatPrice(row.ownerAmount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <TransactionStatusBadge status={row.status} />,
    },
    {
      key: 'date',
      label: 'Date',
      hideOnMobile: true,
      render: (row) => <span className="text-slate-600">{formatDate(row.date)}</span>,
    },
  ];

  const empty = (
    <div className="rounded-xl border border-line bg-white">
      <EmptyState
        icon="wallet"
        title={filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
        message={
          filter === 'all'
            ? 'As soon as a rental payment is processed for one of your listings, it will appear here.'
            : 'Try another filter to see the rest of your transaction history.'
        }
        actionLabel={filter !== 'all' ? 'Show all transactions' : undefined}
        onAction={() => setFilter('all')}
      />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Earnings"
        subtitle="Everything you have earned on RentLink, the fees deducted and what is still clearing."
        actions={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading && !data}>
            <Icon name="refresh" className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {loading && !data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      )}

      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} value={stat.value || 0} />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="How the platform fee works"
              subtitle="Platform fee 5% — deducted from each completed rental transaction."
            >
              {splitTotal > 0 ? (
                <DonutChart
                  data={[
                    { label: 'You keep', value: summary?.totalEarnings || 0, tone: 'success' },
                    { label: 'Platform fee', value: summary?.platformFees || 0, tone: 'warning' },
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Icon name="coins" className="h-6 w-6" />
                  </span>
                  <p className="max-w-xs text-sm text-slate-500">
                    No completed rentals yet — the fee split appears here as soon as your first payment clears.
                  </p>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Payment breakdown" subtitle="Where every completed rupee goes">
              <dl className="divide-y divide-line">
                {[
                  ['Gross rental value (completed)', summary?.grossCompleted || 0, 'text-slate-900'],
                  ['Platform fee at 5%', -(summary?.platformFees || 0), 'text-red-600'],
                  ['Your take-home earnings', summary?.totalEarnings || 0, 'text-emerald-700'],
                  ['Still pending clearance', summary?.pendingAmount || 0, 'text-amber-600'],
                  ['Failed transactions', summary?.failedAmount || 0, 'text-red-600'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-sm text-slate-600">{label}</dt>
                    <dd className={cn('text-sm font-semibold', tone)}>
                      {value < 0 ? '− ' : ''}
                      {formatPrice(Math.abs(value))}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 rounded-lg bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500">
                Payouts are released every week to your saved payout method. Pending amounts clear as soon as the
                tenant's stay is confirmed.
              </p>
            </ChartCard>
          </div>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">Transactions</h2>
              <span className="text-xs text-slate-500">
                {formatNumber(rows.length)} of {formatNumber(transactions.length)} shown
              </span>
            </div>

            <div className="mb-4">
              <Tabs
                ariaLabel="Filter transactions by status"
                tabs={FILTERS.map((f) => ({
                  ...f,
                  count:
                    f.value === 'all'
                      ? transactions.length
                      : transactions.filter((t) => t.status === f.value).length,
                }))}
                value={filter}
                onChange={setFilter}
                variant="pill"
              />
            </div>

            <DataTable
              columns={columns}
              rows={rows}
              rowKey="id"
              loading={loading && !data}
              empty={empty}
            />
          </section>
        </div>
      )}
    </div>
  );
}
