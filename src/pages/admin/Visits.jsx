import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatDate, formatNumber, timeAgo } from '../../utils/format';
import { VISIT_STATUS_LABELS } from '../../utils/constants';
import visitService from '../../services/visitService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { VisitStatusBadge } from '../../components/common/Badge';
import { StatSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Visits() {
  useDocumentTitle('Visit Requests');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  // One fetch of the full list so tab counts and stats stay correct for every filter.
  const { data, loading, error, reload } = useAsync(() => visitService.listAll('all'), []);

  const allVisits = data || [];
  const visits = useMemo(
    () => (filter === 'all' ? allVisits : allVisits.filter((v) => v.status === filter)),
    [allVisits, filter]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const inAWeek = now + 7 * 24 * 60 * 60 * 1000;
    const approvedThisWeek = allVisits.filter(
      (v) => v.status === 'approved' && new Date(v.date).getTime() >= now && new Date(v.date).getTime() <= inAWeek
    ).length;
    return {
      total: allVisits.length,
      pending: allVisits.filter((v) => v.status === 'pending').length,
      approvedThisWeek,
    };
  }, [allVisits]);

  useEffect(() => {
    setDetail(null);
  }, [filter]);

  const columns = [
    { key: 'tenant', label: 'Tenant', render: (v) => <span className="text-sm font-semibold text-slate-900">{v.tenant?.name || '—'}</span> },
    { key: 'owner', label: 'Owner', render: (v) => <span className="text-sm text-slate-700">{v.owner?.name || '—'}</span>, hideOnMobile: true },
    {
      key: 'property',
      label: 'Property',
      render: (v) =>
        v.property ? (
          <Link to={`/property/${v.property.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-900 hover:underline">
            {v.property.title}
          </Link>
        ) : (
          <span className="text-sm text-slate-500">—</span>
        ),
    },
    { key: 'date', label: 'Date', render: (v) => <span className="text-sm text-slate-600">{formatDate(v.date)}</span>, hideOnMobile: true },
    { key: 'time', label: 'Time', render: (v) => <span className="text-sm text-slate-600">{v.time || '—'}</span>, hideOnMobile: true },
    { key: 'status', label: 'Status', render: (v) => <VisitStatusBadge status={v.status} /> },
    { key: 'created', label: 'Created', align: 'right', render: (v) => <span className="text-xs text-slate-500">{timeAgo(v.createdAt)}</span>, hideOnMobile: true },
  ];

  const actions = (v) => (
    <Dropdown
      ariaLabel={`Actions for visit to ${v.property?.title || 'property'}`}
      trigger={
        <Button variant="outline" size="md">
          Actions
          <Icon name="chevronDown" className="h-4 w-4" />
        </Button>
      }
      items={[
        { label: 'View property', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => v.property && navigate(`/property/${v.property.id}`) },
        { label: 'View details', icon: <Icon name="info" className="h-4 w-4" />, onClick: () => setDetail(v) },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visit Requests"
        subtitle="Read-only oversight of all visit activity across the platform."
      />

      {loading ? (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total visits"
            value={stats.total}
            icon={<Icon name="calendar" className="h-5 w-5" />}
            hint="All requests, every status"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            tone="warning"
            icon={<Icon name="clock" className="h-5 w-5" />}
            hint="Awaiting a decision"
          />
          <StatCard
            label="Approved this week"
            value={stats.approvedThisWeek}
            tone="success"
            icon={<Icon name="check" className="h-5 w-5" />}
            hint="Upcoming approved visits"
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}

      <Tabs
        ariaLabel="Filter visits by status"
        tabs={FILTERS.map((f) => ({
          ...f,
          count: f.value === 'all' ? undefined : allVisits.filter((v) => v.status === f.value).length,
        }))}
        value={filter}
        onChange={setFilter}
        variant="pill"
      />

      {!loading && !error && (
        <p role="status" aria-live="polite" className="mb-3 text-sm text-slate-600">
          Showing {formatNumber(visits.length)} of {formatNumber(allVisits.length)} visit requests.
        </p>
      )}

      {error ? null : (
        <DataTable
          columns={columns}
          rows={visits}
          rowKey="id"
          loading={loading}
          empty={
            <EmptyState
              icon="bell"
              title={filter === 'all' ? 'No visit requests' : `No ${VISIT_STATUS_LABELS[filter]?.toLowerCase() || filter} visits`}
              message="Visit requests from tenants appear here once owners or tenants schedule them."
            />
          }
          actions={actions}
        />
      )}

      {/* Details modal */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Visit details"
        description={detail ? `${VISIT_STATUS_LABELS[detail.status] || detail.status} · ${formatDate(detail.date)} at ${detail.time || '—'}` : undefined}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            {detail?.property && (
              <Button variant="outline" as={Link} to={`/property/${detail.property.id}`} onClick={() => setDetail(null)}>
                View property
              </Button>
            )}
            <Button onClick={() => setDetail(null)}>Close</Button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tenant</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{detail.tenant?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Owner</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{detail.owner?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Requested</dt>
                <dd className="mt-0.5 text-slate-600">{timeAgo(detail.createdAt)}</dd>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tenant message</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{detail.message || 'No message provided.'}</p>
            </div>

            {detail.ownerNote ? (
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
                <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">Owner note</p>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-900">{detail.ownerNote}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No owner note on file.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}