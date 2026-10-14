import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import DataTable from '../../components/dashboard/DataTable';
import Tabs from '../../components/common/Tabs';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { ListingStatusBadge } from '../../components/common/Badge';

import propertyService from '../../services/propertyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatNumber, formatPrice } from '../../utils/format';
import { propertyTypeLabel } from '../../utils/constants';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'changes', label: 'Changes Requested' },
  { value: 'suspended', label: 'Suspended' },
];

const EMPTY_COPY = {
  all: {
    title: 'You have not added a property yet',
    message: 'Create your listing and it will be reviewed by our team.',
  },
  draft: {
    title: 'No drafts yet',
    message: 'Save a listing part-way through and it will wait here until you are ready to submit.',
  },
  pending: {
    title: 'Nothing awaiting review',
    message: 'Listings you submit appear here while the admin team checks them.',
  },
  approved: {
    title: 'No live listings yet',
    message: 'Once a listing is approved it will be visible to tenants across Gilgit-Baltistan.',
  },
  rejected: {
    title: 'No rejected listings',
    message: 'If a listing is rejected, the reason will be shown here so you can fix and resubmit.',
  },
  changes: {
    title: 'No listings need changes',
    message: 'When the review team asks for edits, they will appear here with the note attached.',
  },
  suspended: {
    title: 'No paused listings',
    message: 'Paused listings are hidden from tenants but keep their views and reviews.',
  },
};

export default function Properties() {
  useDocumentTitle('My Properties');
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState('');

  const { data, loading, error, reload } = useAsync(
    () => propertyService.getByOwner(user.id),
    [user?.id],
    { immediate: Boolean(user) }
  );

  const properties = data || [];

  const counts = useMemo(() => {
    const result = { all: properties.length };
    TABS.forEach((t) => {
      if (t.value !== 'all') result[t.value] = properties.filter((p) => p.status === t.value).length;
    });
    return result;
  }, [properties]);

  const rows = useMemo(
    () => (tab === 'all' ? properties : properties.filter((p) => p.status === tab)),
    [properties, tab]
  );

  async function handlePause(property) {
    const pausing = property.status === 'approved';
    if (pausing) {
      const ok = await confirm({
        title: 'Pause this listing?',
        message: 'Tenants will no longer see it in search results. You can activate it again at any time.',
        confirmLabel: 'Pause listing',
        tone: 'warning',
      });
      if (!ok) return;
    }
    setBusyId(property.id);
    try {
      await propertyService.pause(property.id);
      toast.success(pausing ? 'Listing paused.' : 'Listing activated and sent for review.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to update the listing.');
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(property) {
    const ok = await confirm({
      title: 'Delete this listing?',
      message: `"${property.title}" and its reviews will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(property.id);
    try {
      await propertyService.remove(property.id);
      toast.success('Listing deleted.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to delete the listing.');
    } finally {
      setBusyId('');
    }
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      hideOnMobile: true,
      render: (row) => (
        <Link
          to={`/owner/properties/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block h-12 w-16 overflow-hidden rounded-lg bg-slate-100"
        >
          <ImageWithFallback src={row.images?.[0]} alt={row.title} />
        </Link>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div className="min-w-0">
          <Link
            to={`/owner/properties/${row.id}`}
            onClick={(e) => e.stopPropagation()}
            className="line-clamp-1 font-semibold text-slate-900 transition hover:text-brand-700"
          >
            {row.title}
          </Link>
          <span className="text-xs text-slate-500">{propertyTypeLabel(row.type)}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => (
        <span className="block max-w-[12rem] truncate text-slate-600">
          {row.area}, {row.city}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="whitespace-nowrap font-semibold text-slate-900">{formatPrice(row.price)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <ListingStatusBadge status={row.status} />,
    },
    {
      key: 'views',
      label: 'Views',
      align: 'right',
      render: (row) => <span className="font-medium text-slate-700">{formatNumber(row.views)}</span>,
    },
    {
      key: 'favorites',
      label: 'Saves',
      align: 'right',
      hideOnMobile: true,
      render: (row) => <span className="font-medium text-slate-700">{formatNumber(row.favorites)}</span>,
    },
  ];

  function rowActions(row) {
    const canPause = row.status === 'approved' || row.status === 'suspended';
    return (
      <Dropdown
        ariaLabel={`Actions for ${row.title}`}
        trigger={
          <button
            type="button"
            aria-label={`Open actions for ${row.title}`}
            disabled={busyId === row.id}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
          >
            <Icon name="list" className="h-4 w-4" />
          </button>
        }
        items={[
          {
            label: 'View',
            icon: <Icon name="eye" className="h-4 w-4" />,
            onClick: () => navigate(`/owner/properties/${row.id}`),
          },
          {
            label: 'Edit',
            icon: <Icon name="edit" className="h-4 w-4" />,
            onClick: () => navigate(`/owner/properties/${row.id}/edit`),
          },
          ...(canPause
            ? [
                {
                  label: row.status === 'suspended' ? 'Activate listing' : 'Pause listing',
                  icon: <Icon name={row.status === 'suspended' ? 'play' : 'pause'} className="h-4 w-4" />,
                  onClick: () => handlePause(row),
                },
              ]
            : []),
          '-',
          {
            label: 'Delete',
            icon: <Icon name="trash" className="h-4 w-4" />,
            tone: 'danger',
            onClick: () => handleDelete(row),
          },
        ]}
      />
    );
  }

  const empty = (
    <div className="rounded-xl border border-line bg-white">
      <EmptyState
        icon="building"
        title={EMPTY_COPY[tab]?.title || 'Nothing here'}
        message={EMPTY_COPY[tab]?.message}
        actionLabel="List a property"
        onAction={() => navigate('/owner/properties/new')}
        secondaryLabel={tab !== 'all' ? 'View all listings' : undefined}
        onSecondary={tab !== 'all' ? () => setTab('all') : undefined}
      />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="My Properties"
        subtitle="Manage every listing you own: drafts, listings under review and live properties."
        actions={
          <Button as={Link} to="/owner/properties/new">
            <Icon name="plus" className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      {/* Review lifecycle notice */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3.5 text-xs leading-relaxed text-sky-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong className="font-semibold">How review works:</strong> Draft → Pending Review → Approved or
          Rejected/Changes Requested. Editing an approved listing sends it back through review, and pausing hides it
          from tenants without losing its views or reviews.
        </p>
      </div>

      <div className="mb-5">
        <Tabs
          ariaLabel="Filter listings by status"
          tabs={TABS.map((t) => ({
            ...t,
            count: loading && !data ? undefined : counts[t.value],
          }))}
          value={tab}
          onChange={setTab}
        />
      </div>

      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {(!error || data) && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading && !data}
          actions={rowActions}
          empty={empty}
          onRowClick={(row) => navigate(`/owner/properties/${row.id}`)}
        />
      )}

      <div className="mt-4" aria-live="polite">
        {error && !data ? null : loading && !data ? (
          <p className="text-center text-xs text-slate-500">Loading your listings…</p>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Showing {rows.length} of {properties.length} listing{properties.length === 1 ? '' : 's'}
            {tab !== 'all' ? ` · ${TABS.find((t) => t.value === tab)?.label || tab} tab` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
