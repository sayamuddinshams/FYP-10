import { useMemo, useState } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { timeAgo } from '../../utils/format';
import adminService from '../../services/adminService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge, { ReportStatusBadge } from '../../components/common/Badge';
import Dropdown from '../../components/common/Dropdown';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { Textarea } from '../../components/common/Input';
import { StatSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'removed', label: 'Removed' },
];

const TYPE_META = {
  property: { label: 'Property', tone: 'brand', icon: 'building' },
  user: { label: 'User', tone: 'info', icon: 'user' },
  review: { label: 'Review', tone: 'neutral', icon: 'star' },
};

export default function Reports() {
  useDocumentTitle('Reviews & Reports');
  const toast = useToast();
  const { confirm } = useModals();

  const [filter, setFilter] = useState('all');
  const [review, setReview] = useState(null);
  const [resolve, setResolve] = useState(null);
  const [removeFlow, setRemoveFlow] = useState(null);
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(() => adminService.listReports('all'), []);

  const all = data || [];

  const counts = useMemo(
    () => ({
      all: all.length,
      open: all.filter((r) => r.status === 'open').length,
      resolved: all.filter((r) => r.status === 'resolved').length,
      removed: all.filter((r) => r.status === 'removed').length,
    }),
    [all]
  );

  const filtered = filter === 'all' ? all : all.filter((r) => r.status === filter);

  async function handleResolve(e) {
    e.preventDefault();
    if (!resolve) return;
    const text = resolution.trim();
    if (!text) return;
    setBusy(true);
    try {
      await adminService.resolveReport(resolve.id, text);
      toast.success('Report resolved.');
      setResolve(null);
      setResolution('');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(e) {
    e.preventDefault();
    if (!removeFlow) return;
    const text = resolution.trim();
    if (!text) return;
    setBusy(true);
    try {
      await adminService.removeReport(removeFlow.id, text);
      toast.info('Reported content removed from the platform.', 'Report removed');
      setRemoveFlow(null);
      setResolution('');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDismiss(report) {
    const ok = await confirm({
      title: 'Dismiss this report?',
      message: 'The report will be marked as resolved with the note "Dismissed: no violation found."',
      confirmLabel: 'Dismiss report',
      tone: 'neutral',
    });
    if (!ok) return;
    try {
      await adminService.updateReport(report.id, 'resolved', 'Dismissed: no violation found.');
      toast.info('Report dismissed.', 'No violation');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  function startRemove(report) {
    confirm({
      title: 'Remove reported content?',
      message: 'The reported listing, user or review will be actioned by removing it from the platform. A reason is required.',
      confirmLabel: 'Continue',
      tone: 'danger',
    }).then((ok) => {
      if (ok) {
        setResolution('');
        setRemoveFlow(report);
      }
    });
  }

  const actions = (r) => (
    <Dropdown
      ariaLabel={`Actions for report ${r.id}`}
      trigger={
        <Button variant="outline" size="md">
          Actions
          <Icon name="chevronDown" className="h-4 w-4" />
        </Button>
      }
      items={[
        { label: 'Review report', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => setReview(r) },
        { label: 'Resolve', icon: <Icon name="check" className="h-4 w-4" />, onClick: () => { setResolution(r.resolution || ''); setResolve(r); } },
        '-',
        { label: 'Remove content', icon: <Icon name="trash" className="h-4 w-4" />, tone: 'danger', onClick: () => startRemove(r) },
        { label: 'Dismiss', icon: <Icon name="x" className="h-4 w-4" />, onClick: () => handleDismiss(r) },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Reports"
        subtitle="Trust & safety queue: investigate reports and take action on violations."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total reports" value={counts.all} tone="brand" icon={<Icon name="flag" className="h-5 w-5" />} />
          <StatCard label="Open" value={counts.open} tone="warning" icon={<Icon name="info" className="h-5 w-5" />} />
          <StatCard label="Resolved" value={counts.resolved} tone="success" icon={<Icon name="check" className="h-5 w-5" />} />
          <StatCard label="Removed" value={counts.removed} tone="danger" icon={<Icon name="trash" className="h-5 w-5" />} />
        </div>
      )}

      <Tabs
        ariaLabel="Filter reports by status"
        tabs={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        value={filter}
        onChange={setFilter}
      />

      {!loading && !error && (
        <p role="status" aria-live="polite" className="text-sm text-slate-600">
          Showing {filtered.length} of {counts.all} report{counts.all === 1 ? '' : 's'}
          {filter === 'all' ? '' : ` marked ${filter}`}.
        </p>
      )}

      {error ? null : loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : !filtered.length ? (
        <EmptyState
          icon="alert"
          title={filter === 'all' ? 'No reports' : `No ${filter} reports`}
          message="Reports filed by tenants and owners will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const type = TYPE_META[r.type] || { label: r.type, tone: 'neutral', icon: 'flag' };
            return (
              <article key={r.id} className="rounded-xl border border-line bg-white p-5 animate-fade-up">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon name={type.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={type.tone}>{type.label} report</Badge>
                        <ReportStatusBadge status={r.status} />
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">
                        Reported by <span className="font-medium text-slate-700">{r.reporter?.name || 'Unknown'}</span>
                        {r.reporter?.role && <span className="capitalize"> ({r.reporter.role})</span>} · {timeAgo(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  {actions(r)}
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Reported content</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{r.targetLabel || '–'}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium">{r.reason}</span>: {r.details}
                  </p>
                </div>

                {r.resolution && (
                  <p className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Resolution:</span> {r.resolution}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Review modal */}
      <Modal
        open={Boolean(review)}
        onClose={() => setReview(null)}
        title="Review report"
        description={review ? `Reported ${timeAgo(review.createdAt)} by ${review.reporter?.name || 'unknown'}.` : undefined}
        size="md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setReview(null)}>Close</Button>
            {review?.status === 'open' && (
              <Button
                onClick={() => {
                  setResolve(review);
                  setResolution('');
                  setReview(null);
                }}
              >
                Resolve with note
              </Button>
            )}
          </div>
        }
      >
        {review && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={(TYPE_META[review.type] || {}).tone || 'neutral'}>{(TYPE_META[review.type] || {}).label || review.type}</Badge>
              <ReportStatusBadge status={review.status} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Reported content</p>
              <p className="mt-1 font-medium text-slate-800">{review.targetLabel || '–'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Reason</p>
              <p className="mt-1 text-slate-700">{review.reason}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Details</p>
              <p className="mt-1 leading-relaxed text-slate-700">{review.details || 'No details provided.'}</p>
            </div>
            {review.resolution && (
              <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
                <p className="text-xs font-semibold tracking-wide uppercase">Resolution</p>
                <p className="mt-1">{review.resolution}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve modal */}
      <Modal
        open={Boolean(resolve)}
        onClose={() => setResolve(null)}
        title="Resolve report"
        description="Record the outcome so the reporter and audit trail stay clear."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResolve(null)} disabled={busy}>Cancel</Button>
            <Button variant="success" type="submit" form="resolve-report-form" loading={busy} disabled={!resolution.trim()}>
              Resolve report
            </Button>
          </div>
        }
      >
        <form id="resolve-report-form" onSubmit={handleResolve}>
          <Textarea
            label="Resolution notes"
            hint="Required"
            required
            rows={4}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="e.g. Contacted the owner and confirmed the price was outdated. Listing updated to Rs 78,000."
            error={!resolution.trim() ? 'Resolution notes are required.' : ''}
          />
        </form>
      </Modal>

      {/* Remove modal */}
      <Modal
        open={Boolean(removeFlow)}
        onClose={() => setRemoveFlow(null)}
        title="Remove reported content"
        description="This action removes the reported content from the platform. A reason is required for the audit log."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRemoveFlow(null)} disabled={busy}>Cancel</Button>
            <Button variant="danger" type="submit" form="remove-report-form" loading={busy} disabled={!resolution.trim()}>
              Remove content
            </Button>
          </div>
        }
      >
        <form id="remove-report-form" onSubmit={handleRemove}>
          <Textarea
            label="Reason for removal"
            hint="Required"
            required
            rows={4}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="e.g. Listing violates the misleading-information policy. Removed and owner notified."
            error={!resolution.trim() ? 'A removal reason is required.' : ''}
          />
        </form>
      </Modal>
    </div>
  );
}