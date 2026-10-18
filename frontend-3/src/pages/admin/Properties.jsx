import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { formatDate, formatPrice } from '../../utils/format';
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_MAP, propertyTypeLabel } from '../../utils/constants';
import propertyService from '../../services/propertyService';
import PageHeader from '../../components/dashboard/PageHeader';
import DataTable from '../../components/dashboard/DataTable';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Dropdown from '../../components/common/Dropdown';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { ListingStatusBadge } from '../../components/common/Badge';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { StatSkeleton } from '../../components/common/Skeleton';
import { Textarea } from '../../components/common/Input';
import Icon from '../../components/common/icons';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const MODE_META = {
  reject: {
    title: 'Reject listing',
    description: 'Explain why this listing cannot be approved.',
    status: 'rejected',
    toast: 'Property rejected.',
    placeholder: 'e.g. The photos do not match the listed address and ownership is unconfirmed.',
    label: 'Reason for rejection',
  },
  changes: {
    title: 'Request changes',
    description: 'Ask the owner to update specific details before it can be approved.',
    status: 'changes',
    toast: 'Changes requested from the owner.',
    placeholder: 'e.g. Please add clear photos of the kitchen and confirm the monthly rent.',
    label: 'Changes required',
  },
  suspend: {
    title: 'Suspend listing',
    description: 'Remove this listing from public view. It can be reinstated later.',
    status: 'suspended',
    toast: 'Property suspended.',
    placeholder: 'e.g. Suspended after a tenant complaint about misleading information.',
    label: 'Reason for suspension',
  },
};

export default function Properties() {
  useDocumentTitle('Properties');
  const toast = useToast();
  const { confirm } = useModals();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = TABS.some((t) => t.value === searchParams.get('status')) ? searchParams.get('status') : 'all';
  const [decision, setDecision] = useState(null); // { property, mode } | { ids, mode }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data, loading, error, reload } = useAsync(() => propertyService.adminList('all'), []);

  useEffect(() => {
    setReason('');
  }, [decision]);

  const all = data || [];

  const counts = useMemo(() => {
    const c = { all: all.length, pending: 0, approved: 0, rejected: 0, suspended: 0, changes: 0, draft: 0 };
    all.forEach((p) => {
      if (c[p.status] !== undefined) c[p.status] += 1;
    });
    return c;
  }, [all]);

  const rows = useMemo(() => {
    if (activeTab === 'all') return all;
    return all.filter((p) => p.status === activeTab);
  }, [all, activeTab]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedRows = useMemo(() => rows.filter((p) => selectedSet.has(p.id)), [rows, selectedSet]);
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  function setTab(tab) {
    const next = new URLSearchParams(searchParams);
    if (tab === 'all') next.delete('status');
    else next.set('status', tab);
    setSelectedIds([]);
    setSearchParams(next, { replace: true });
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : rows.map((p) => p.id));
  }

  async function handleBulkApprove() {
    const targets = selectedRows;
    if (!targets.length) return;
    const ok = await confirm({
      title: `Approve ${targets.length} listing${targets.length === 1 ? '' : 's'}?`,
      message: `"${targets[0].title}"${targets.length > 1 ? ` and ${targets.length - 1} other listing${targets.length === 2 ? '' : 's'}` : ''} will become publicly visible on RentLink immediately.`,
      confirmLabel: 'Approve listings',
      tone: 'success',
    });
    if (!ok) return;
    setBusy(true);
    try {
      for (const p of targets) {
        await propertyService.setListingStatus(p.id, 'approved');
      }
      toast.success(`${targets.length} listing${targets.length === 1 ? '' : 's'} approved.`);
      setSelectedIds([]);
      reload();
    } catch (err) {
      toast.error(err.message, 'Bulk approval failed');
    } finally {
      setBusy(false);
    }
  }

  async function openBulkReject() {
    const targets = selectedRows;
    if (!targets.length) return;
    const ok = await confirm({
      title: `Reject ${targets.length} listing${targets.length === 1 ? '' : 's'}?`,
      message: `${targets.length === 1 ? 'This listing' : `All ${targets.length} selected listings`} will be rejected and hidden from tenants. A reason is required on the next step and owners will see it.`,
      confirmLabel: 'Continue',
      tone: 'danger',
    });
    if (!ok) return;
    setDecision({ mode: 'reject', ids: targets.map((t) => t.id) });
  }

  async function handleApprove(p) {
    const ok = await confirm({
      title: 'Approve this listing?',
      message: `"${p.title}" will become publicly visible on RentLink and visible to tenants immediately.`,
      confirmLabel: 'Approve listing',
      tone: 'success',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await propertyService.setListingStatus(p.id, 'approved');
      toast.success('Property approved.');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  function openDecision(property, mode) {
    if (mode === 'suspend') {
      // Decision actions require an explicit confirmation before the reason step.
      confirm({
        title: `Suspend "${property.title}"?`,
        message: 'The listing will be hidden from tenants and search. This can be reversed later.',
        confirmLabel: 'Continue',
        tone: 'danger',
      }).then((ok) => {
        if (ok) setDecision({ property, mode });
      });
      return;
    }
    setDecision({ property, mode });
  }

  async function submitDecision(e) {
    e.preventDefault();
    const trimReason = reason.trim();
    if (!decision || !trimReason) return;
    const meta = MODE_META[decision.mode];
    const ids = decision.ids || [decision.property.id];
    const bulk = Boolean(decision.ids);
    setBusy(true);
    try {
      for (const id of ids) {
        await propertyService.setListingStatus(id, meta.status, trimReason);
      }
      if (bulk) {
        const bulkToasts = {
          reject: `${ids.length} listings rejected.`,
          changes: `Changes requested for ${ids.length} listings.`,
          suspend: `${ids.length} listings suspended.`,
        };
        toast.success(bulkToasts[decision.mode]);
        setSelectedIds([]);
      } else {
        toast.success(meta.toast);
      }
      setDecision(null);
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      key: 'select',
      label: 'Select',
      cellClassName: 'w-10',
      render: (p) => (
        <input
          type="checkbox"
          checked={selectedSet.has(p.id)}
          onChange={() => toggleSelect(p.id)}
          aria-label={`Select ${p.title}`}
          className="h-4.5 w-4.5 cursor-pointer rounded border-line accent-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
      ),
    },
    {
      key: 'image',
      label: 'Listing',
      render: (p) => (
        <div className="flex items-center gap-3">
          <ImageWithFallback src={p.images?.[0]} alt={p.title} imgClassName="h-11 w-14 rounded-lg shrink-0" />
          <div className="min-w-0">
            <Link
              to={`/admin/properties/${p.id}/review`}
              className="block max-w-[220px] truncate text-sm font-semibold text-slate-900 transition hover:text-brand-700"
            >
              {p.title}
            </Link>
            <p className="truncate text-xs text-slate-500">{p.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Avatar name={p.owner?.name} size="xs" />
          <span className="text-sm text-slate-700">{p.owner?.name || '–'}</span>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'location',
      label: 'Location',
      render: (p) => <span className="text-sm text-slate-600">{`${p.area}, ${p.city}`}</span>,
      hideOnMobile: true,
    },
    {
      key: 'type',
      label: 'Type',
      render: (p) => <span className="text-sm text-slate-600">{propertyTypeLabel(p.type)}</span>,
      hideOnMobile: true,
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (p) => <span className="text-sm font-semibold text-slate-900">{formatPrice(p.price)}</span>,
    },
    { key: 'status', label: 'Status', render: (p) => <ListingStatusBadge status={p.status} /> },
    {
      key: 'submitted',
      label: 'Submitted',
      render: (p) => <span className="text-sm text-slate-500">{formatDate(p.createdAt)}</span>,
      hideOnMobile: true,
    },
  ];

  const actions = (p) => (
    <Dropdown
      ariaLabel={`Actions for ${p.title}`}
      trigger={
        <Button variant="outline" size="md">
          Actions
          <Icon name="chevronDown" className="h-4 w-4" />
        </Button>
      }
      items={[
        { label: 'Review listing', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => navigate(`/admin/properties/${p.id}/review`) },
        ...(p.status === 'approved'
          ? []
          : [{ label: 'Approve', icon: <Icon name="check" className="h-4 w-4" />, onClick: () => handleApprove(p) }]),
        '-',
        { label: 'Reject', icon: <Icon name="x" className="h-4 w-4" />, tone: 'danger', onClick: () => openDecision(p, 'reject') },
        { label: 'Request changes', icon: <Icon name="edit" className="h-4 w-4" />, onClick: () => openDecision(p, 'changes') },
        { label: 'Suspend', icon: <Icon name="pause" className="h-4 w-4" />, tone: 'danger', onClick: () => openDecision(p, 'suspend') },
      ]}
    />
  );

  const decisionMeta = decision ? MODE_META[decision.mode] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        subtitle="Moderate listings, approve new submissions and manage the live catalogue."
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
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{counts.pending}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{counts.approved}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{counts.rejected}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Suspended</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{counts.suspended}</p>
          </div>
        </div>
      )}

      <Tabs
        ariaLabel="Filter listings by status"
        tabs={TABS.map((t) => ({ ...t, count: loading || error ? undefined : counts[t.value] }))}
        value={activeTab}
        onChange={setTab}
      />

      {/* Bulk action bar */}
      {!loading && !error && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4.5 w-4.5 rounded border-line accent-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            Select all ({rows.length})
          </label>
          <div className="flex flex-wrap items-center gap-2.5" aria-live="polite">
            {selectedRows.length > 0 && (
              <>
                <span className="text-sm font-medium text-slate-600">
                  {selectedRows.length} selected
                </span>
                <Button size="md" variant="success" loading={busy} onClick={handleBulkApprove}>
                  <Icon name="check" className="h-4 w-4" />
                  Approve
                </Button>
                <Button size="md" variant="danger" loading={busy} onClick={openBulkReject}>
                  <Icon name="x" className="h-4 w-4" />
                  Reject
                </Button>
                <Button size="md" variant="ghost" disabled={busy} onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {error ? null : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          empty={
            activeTab === 'all' ? (
              <EmptyState
                icon="building"
                title="No listings yet"
                message="Listings submitted by owners will appear here for moderation."
              />
            ) : (
              <EmptyState
                icon="search"
                title={`No ${LISTING_STATUS_LABELS[activeTab]?.toLowerCase() || activeTab} listings`}
                message="Nothing in this status right now. Browse another status or clear the filter."
                actionLabel="Show all listings"
                onAction={() => setTab('all')}
                secondaryLabel={counts.all > 0 ? 'Refresh list' : undefined}
                onSecondary={reload}
              />
            )
          }
          actions={actions}
        />
      )}

      <p className="text-xs text-slate-500" aria-live="polite">
        {loading
          ? 'Loading listings…'
          : error
            ? ''
            : `Showing ${rows.length} of ${counts.all} listings · ${
                LISTING_STATUS_LABELS[activeTab] ? LISTING_STATUS_LABELS[activeTab] : 'All statuses'
              } · ${
                counts.changes > 0 ? `${counts.changes} awaiting owner changes` : 'No listings awaiting owner changes'
              }`}
      </p>

      {/* Decision modal */}
      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={decisionMeta?.title}
        description={decisionMeta?.description}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDecision(null)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant={decision?.mode === 'suspend' ? 'danger' : decision?.mode === 'reject' ? 'danger' : 'primary'}
              type="submit"
              form="decision-form"
              loading={busy}
              disabled={!reason.trim()}
            >
              {decision?.mode === 'changes'
                ? 'Request changes'
                : decision?.ids
                  ? `${decisionMeta?.title}${decision.ids.length === 1 ? '' : 's'}`
                  : decisionMeta?.title}
            </Button>
          </div>
        }
      >
        {decisionMeta && (
          <form id="decision-form" onSubmit={submitDecision}>
            <div className="mb-4 rounded-xl bg-slate-50 p-4">
              {decision.ids ? (
                <>
                  <p className="text-sm font-semibold text-slate-900">
                    {decision.ids.length} listing{decision.ids.length === 1 ? '' : 's'} selected
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    The same reason will be applied to every selected listing.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">{decision.property.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {PROPERTY_TYPE_MAP[decision.property.type] || decision.property.type} · {formatPrice(decision.property.price)}
                  </p>
                </>
              )}
            </div>
            <Textarea
              label={decisionMeta.label}
              hint="Required"
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={decisionMeta.placeholder}
              error={!reason.trim() ? 'A reason is required to continue.' : ''}
            />
          </form>
        )}
      </Modal>
    </div>
  );
}