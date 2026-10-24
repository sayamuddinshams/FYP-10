import { useMemo, useState } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatDate, formatNumber, formatPrice } from '../../utils/format';
import { PLATFORM_FEE_RATE } from '../../utils/constants';
import transactionService from '../../services/transactionService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import Tabs from '../../components/common/Tabs';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { TransactionStatusBadge } from '../../components/common/Badge';
import { StatSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export default function Transactions() {
  useDocumentTitle('Transactions');
  const [filter, setFilter] = useState('all');

  const summary = useAsync(() => transactionService.adminSummary(), []);
  const list = useAsync(() => transactionService.list({ status: filter }), [filter]);

  const txns = useMemo(() => list.data || [], [list.data]);
  const s = summary.data;
  const feePercent = Math.round((s?.rate ?? PLATFORM_FEE_RATE) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Rental settlements, platform fees and payout breakdowns."
      />

      {summary.loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Gross volume" value={s?.revenue} prefix="Rs " tone="brand" icon={<Icon name="wallet" className="h-5 w-5" />} />
          <StatCard label="Platform fees collected" value={s?.fees} prefix="Rs " tone="success" icon={<Icon name="coins" className="h-5 w-5" />} />
          <StatCard label="Pending fees" value={s?.pendingFees} prefix="Rs " tone="warning" icon={<Icon name="clock" className="h-5 w-5" />} />
          <StatCard label="Failed volume" value={s?.failed} prefix="Rs " tone="danger" icon={<Icon name="x" className="h-5 w-5" />} />
        </div>
      )}

      <Tabs
        ariaLabel="Filter transactions by status"
        tabs={FILTERS.map((f) => ({
          ...f,
          count: f.value === 'all' ? s?.count : f.value === 'completed' ? s?.completed : f.value === 'pending' ? s?.pending : s?.failedCount,
        }))}
        value={filter}
        onChange={setFilter}
      />

      {!list.loading && !list.error && (
        <p role="status" aria-live="polite" className="text-sm text-slate-600">
          Showing {formatNumber(txns.length)} transaction{txns.length === 1 ? '' : 's'}
          {filter === 'all' ? '' : ` with ${filter} status`}.
        </p>
      )}

      {list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : (
        <DataTable
          columns={[
            {
              key: 'id',
              label: 'Transaction',
              render: (t) => (
                <div>
                  <p className="font-mono text-xs font-semibold tracking-tight text-slate-800">{t.id}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDate(t.date)}</p>
                </div>
              ),
            },
            {
              key: 'property',
              label: 'Property',
              render: (t) => <span className="text-sm font-medium text-slate-800">{t.property?.title || '–'}</span>,
              hideOnMobile: true,
            },
            { key: 'tenant', label: 'Tenant', render: (t) => <span className="text-sm text-slate-700">{t.tenant?.name || '–'}</span>, hideOnMobile: true },
            { key: 'owner', label: 'Owner', render: (t) => <span className="text-sm text-slate-700">{t.owner?.name || '–'}</span>, hideOnMobile: true },
            { key: 'amount', label: 'Rental Amount', align: 'right', render: (t) => <span className="text-sm font-semibold text-slate-900">{formatPrice(t.amount)}</span> },
            {
              key: 'fee',
              label: 'Platform Fee',
              align: 'right',
              render: (t) => (
                <span className="text-sm text-slate-700">
                  {formatPrice(t.platformFee)}
                  <span className="ml-1 text-xs text-slate-500">({feePercent}%)</span>
                </span>
              ),
              hideOnMobile: true,
            },
            { key: 'ownerAmount', label: 'Owner Amount', align: 'right', render: (t) => <span className="text-sm font-medium text-emerald-700">{formatPrice(t.ownerAmount)}</span>, hideOnMobile: true },
            { key: 'status', label: 'Status', render: (t) => <TransactionStatusBadge status={t.status} />, align: 'right' },
          ]}
          rows={txns}
          rowKey="id"
          loading={list.loading}
          empty={
            <EmptyState
              icon="inbox"
              title={filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
              message="Rental settlements will appear here once tenants complete payments."
            />
          }
        />
      )}

      {/* Fee explainer */}
      <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon name="info" className="h-5 w-5" />
          </span>
          <div className="text-sm leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-900">How platform fees work</p>
            <p className="mt-1">
              RentLink collects a flat <span className="font-semibold text-slate-800">{feePercent}% platform fee</span> on every
              completed rental payment. The owner receives the remaining{' '}
              <span className="font-semibold text-slate-800">{100 - feePercent}%</span>, and fees for pending transactions are
              settled when the payment clears. Failed transactions generate no fee income.
            </p>
          </div>
          <div className="shrink-0 rounded-lg bg-slate-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Total records</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{formatNumber(s?.count || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}