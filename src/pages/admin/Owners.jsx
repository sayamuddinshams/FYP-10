import { useMemo, useState } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { formatDate, formatNumber } from '../../utils/format';
import userService from '../../services/userService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Dropdown from '../../components/common/Dropdown';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { VerificationBadge, UserStatusBadge } from '../../components/common/Badge';
import { Textarea } from '../../components/common/Input';
import { StatSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

export default function Owners() {
  useDocumentTitle('Owners');
  const toast = useToast();
  const { confirm } = useModals();

  const [viewOwner, setViewOwner] = useState(null);
  const [rejectOwner, setRejectOwner] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, loading, error, reload } = useAsync(() => userService.listOwners(), []);

  const owners = data || [];

  const stats = useMemo(() => {
    const verified = owners.filter((o) => o.verification === 'verified').length;
    const pending = owners.filter((o) => o.verification === 'pending').length;
    const suspended = owners.filter((o) => o.status === 'suspended').length;
    return { total: owners.length, verified, pending, suspended };
  }, [owners]);

  async function handleVerify(owner) {
    const ok = await confirm({
      title: `Verify ${owner.name}?`,
      message: `Marking this owner as verified builds trust with tenants and unlocks priority listing placement.`,
      confirmLabel: 'Verify owner',
      tone: 'success',
    });
    if (!ok) return;
    try {
      await userService.setVerification(owner.id, 'verified');
      toast.success('Owner verified.');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  async function handleRejectVerify(e) {
    e.preventDefault();
    if (!rejectOwner) return;
    const reason = rejectReason.trim();
    if (!reason) return;
    try {
      await userService.setVerification(rejectOwner.id, 'rejected');
      toast.info(`Documents rejected for ${rejectOwner.name}. Reason: ${reason}`, 'Verification rejected');
      setRejectOwner(null);
      setRejectReason('');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  async function handleSuspendToggle(owner) {
    const suspending = owner.status !== 'suspended';
    const ok = await confirm({
      title: suspending ? `Suspend ${owner.name}?` : `Reactivate ${owner.name}?`,
      message: suspending
        ? `This owner will lose access to their account and their listings will be hidden from search.`
        : `The owner regains access and their approved listings become visible again.`,
      confirmLabel: suspending ? 'Suspend owner' : 'Reactivate owner',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await userService.setStatus(owner.id, suspending ? 'suspended' : 'active');
      toast.success(suspending ? 'Owner suspended.' : 'Owner reactivated.');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  const columns = [
    {
      key: 'owner',
      label: 'Owner',
      render: (o) => (
        <div className="flex items-center gap-3">
          <Avatar name={o.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{o.name}</p>
            <p className="truncate text-xs text-slate-500">{o.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'verification', label: 'Verification', render: (o) => <VerificationBadge status={o.verification} /> },
    {
      key: 'properties',
      label: 'Properties',
      align: 'right',
      render: (o) => (
        <span className="text-sm font-semibold text-slate-700">
          {formatNumber(o.propertyCount || 0)}
          <span className="ml-1 font-normal text-slate-400">({formatNumber(o.approvedCount || 0)} live)</span>
        </span>
      ),
    },
    { key: 'joined', label: 'Joined', render: (o) => <span className="text-sm text-slate-600">{formatDate(o.joinedAt)}</span>, hideOnMobile: true },
    { key: 'status', label: 'Status', render: (o) => <UserStatusBadge status={o.status} />, align: 'right' },
  ];

  const actions = (o) => (
    <Dropdown
      ariaLabel={`Actions for ${o.name}`}
      trigger={
        <Button variant="outline" size="sm">
          Actions
          <Icon name="chevronDown" className="h-4 w-4" />
        </Button>
      }
      items={[
        { label: 'View profile', icon: <Icon name="eye" className="h-4 w-4" />, onClick: () => setViewOwner(o) },
        ...(o.verification !== 'verified'
          ? [
              { label: 'Verify owner', icon: <Icon name="check" className="h-4 w-4" />, onClick: () => handleVerify(o) },
              { label: 'Reject verification', icon: <Icon name="x" className="h-4 w-4" />, tone: 'danger', onClick: () => { setRejectReason(''); setRejectOwner(o); } },
            ]
          : []),
        '-',
        {
          label: o.status === 'suspended' ? 'Reactivate' : 'Suspend',
          icon: <Icon name={o.status === 'suspended' ? 'check' : 'x'} className="h-4 w-4" />,
          tone: 'danger',
          onClick: () => handleSuspendToggle(o),
        },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owners"
        subtitle="Review owner verification documents and manage owner accounts."
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
          <StatCard label="Total owners" value={stats.total} tone="brand" icon={<Icon name="user" className="h-5 w-5" />} />
          <StatCard label="Verified" value={stats.verified} tone="success" icon={<Icon name="verified" className="h-5 w-5" />} />
          <StatCard label="Pending verification" value={stats.pending} tone="warning" icon={<Icon name="clock" className="h-5 w-5" />} />
          <StatCard label="Suspended" value={stats.suspended} tone="danger" icon={<Icon name="shield" className="h-5 w-5" />} />
        </div>
      )}

      {error ? null : (
        <DataTable
          columns={columns}
          rows={owners}
          rowKey="id"
          loading={loading}
          empty={
            <EmptyState
              icon="inbox"
              title="No owners yet"
              message="Owners and agents will appear here as they join RentLink."
            />
          }
          actions={actions}
        />
      )}

      {/* View owner modal */}
      <Modal
        open={Boolean(viewOwner)}
        onClose={() => setViewOwner(null)}
        title={viewOwner?.name}
        description={viewOwner?.email}
        size="md"
      >
        {viewOwner && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-5 text-center">
              <Avatar name={viewOwner.name} size="lg" />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <VerificationBadge status={viewOwner.verification} />
                <UserStatusBadge status={viewOwner.status} />
              </div>
              <p className="text-sm text-slate-500">Member since {viewOwner.memberSince || formatDate(viewOwner.joinedAt)}</p>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Phone</dt>
                <dd className="mt-0.5 text-slate-800">{viewOwner.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Location</dt>
                <dd className="mt-0.5 text-slate-800">
                  {[viewOwner.area, viewOwner.city, viewOwner.district].filter(Boolean).join(', ') || '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Bio</dt>
                <dd className="mt-0.5 text-slate-700">{viewOwner.bio || 'No bio provided.'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Total listings</dt>
                <dd className="mt-0.5 text-slate-800">{formatNumber(viewOwner.propertyCount || 0)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Live listings</dt>
                <dd className="mt-0.5 text-slate-800">{formatNumber(viewOwner.approvedCount || 0)}</dd>
              </div>
            </dl>

            <div className="rounded-xl border border-line bg-slate-50/60 p-4 text-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Portfolio summary</p>
              <p className="mt-1.5 text-slate-600">
                {viewOwner.approvedCount || 0} approved listings are live, with {Math.max(0, (viewOwner.propertyCount || 0) - (viewOwner.approvedCount || 0))} awaiting
                review, edits or suspension.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {viewOwner.verification !== 'verified' && (
                <Button variant="success" onClick={() => { handleVerify(viewOwner); setViewOwner(null); }}>
                  Verify owner
                </Button>
              )}
              <Button variant="outline" onClick={() => setViewOwner(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject verification modal */}
      <Modal
        open={Boolean(rejectOwner)}
        onClose={() => setRejectOwner(null)}
        title="Reject verification"
        description={`Let ${rejectOwner?.name} know why their documents were not accepted.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectOwner(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" form="reject-owner-form" disabled={!rejectReason.trim()}>
              Reject verification
            </Button>
          </div>
        }
      >
        <form id="reject-owner-form" onSubmit={handleRejectVerify}>
          <Textarea
            label="Reason for rejection"
            required
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Ownership documents are illegible — please re-upload clear scans."
            error={!rejectReason.trim() ? 'A reason is required to reject verification.' : ''}
          />
        </form>
      </Modal>
    </div>
  );
}