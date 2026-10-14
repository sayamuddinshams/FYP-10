import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { formatDate, formatNumber, formatPrice } from '../../utils/format';
import { AMENITY_MAP, PROPERTY_TYPE_MAP, propertyTypeLabel } from '../../utils/constants';
import propertyService from '../../services/propertyService';
import PageHeader from '../../components/dashboard/PageHeader';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import Badge, { ListingStatusBadge, VerificationBadge } from '../../components/common/Badge';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { Textarea } from '../../components/common/Input';
import { LineSkeleton } from '../../components/common/Skeleton';
import ReviewsSection from '../../components/property/ReviewsSection';
import Icon from '../../components/common/icons';

const MODE_META = {
  reject: {
    title: 'Reject listing',
    description: 'Provide a clear reason: the owner will see this when they resubmit.',
    status: 'rejected',
    toastMessage: 'Property rejected.',
    toastKind: 'success',
    placeholder: 'e.g. The address does not match the owner documents on file.',
    label: 'Reason for rejection',
    submitLabel: 'Reject listing',
  },
  changes: {
    title: 'Request changes',
    description: 'Tell the owner what to fix before this listing can be approved.',
    status: 'changes',
    toastMessage: 'Changes requested from the owner.',
    toastKind: 'info',
    placeholder: 'e.g. Please add a photo of the kitchen and confirm the monthly rent.',
    label: 'Changes required',
    submitLabel: 'Request changes',
  },
  suspend: {
    title: 'Suspend listing',
    description: 'Remove this listing from public view. It can be reinstated later.',
    status: 'suspended',
    toastMessage: 'Property suspended.',
    toastKind: 'warning',
    placeholder: 'e.g. Suspended pending verification of ownership documents.',
    label: 'Reason for suspension',
    submitLabel: 'Suspend listing',
  },
};

/** Verification timeline shown in the decision panel (icon + text, never colour alone). */
const VERIFICATION_STEPS = [
  { key: 'pending', label: 'Pending review', icon: 'clock', tone: 'warning' },
  { key: 'approved', label: 'Verified', icon: 'check', tone: 'success' },
  { key: 'rejected', label: 'Rejected', icon: 'x', tone: 'danger' },
  { key: 'changes', label: 'Needs changes', icon: 'edit', tone: 'brand' },
];

function stepState(status, key) {
  if (status === key) return 'current';
  if (key === 'pending' && (status === 'approved' || status === 'rejected' || status === 'changes')) return 'done';
  return 'upcoming';
}

export default function PropertyReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useModals();
  useDocumentTitle('Property Review');

  const [mainImage, setMainImage] = useState(0);
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: property, loading, error, reload } = useAsync(() => propertyService.getById(id), [id]);

  useEffect(() => {
    setMainImage(0);
    setReason('');
    setActionError('');
  }, [id]);

  useEffect(() => {
    setReason('');
  }, [decision]);

  const images = property?.images?.length ? property.images : [];
  const amenities = property?.amenities || [];

  async function handleApprove() {
    const ok = await confirm({
      title: 'Approve this listing?',
      message: `"${property.title}" will become publicly visible and searchable by tenants.`,
      confirmLabel: 'Approve listing',
      tone: 'success',
    });
    if (!ok) return;
    setBusy(true);
    setActionError('');
    try {
      await propertyService.setListingStatus(property.id, 'approved');
      toast.success('Property approved.');
      await reload();
    } catch (err) {
      setActionError(err.message || 'Approval failed. Please try again.');
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  function openDecision(mode) {
    setActionError('');
    if (mode === 'suspend') {
      confirm({
        title: `Suspend "${property.title}"?`,
        message: 'The listing will be hidden from tenants and search results. This can be reversed later.',
        confirmLabel: 'Continue',
        tone: 'danger',
      }).then((ok) => {
        if (ok) setDecision({ mode });
      });
      return;
    }
    setDecision({ mode });
  }

  async function submitDecision(e) {
    e.preventDefault();
    const trimReason = reason.trim();
    if (!decision || !trimReason) return;
    const meta = MODE_META[decision.mode];
    setBusy(true);
    setActionError('');
    try {
      await propertyService.setListingStatus(property.id, meta.status, trimReason);
      toast[meta.toastKind]?.(meta.toastMessage);
      setDecision(null);
      await reload();
    } catch (err) {
      setActionError(err.message || 'The decision could not be saved. Please try again.');
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const decisionMeta = decision ? MODE_META[decision.mode] : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Property Review" subtitle="Loading listing details…" />
        <div className="space-y-4">
          <LineSkeleton />
          <LineSkeleton />
          <LineSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Property Review"
          subtitle="The listing could not be loaded."
          back="/admin/properties"
          backLabel="All properties"
        />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <PageHeader title="Property Review" subtitle="Listing not found." back="/admin/properties" backLabel="All properties" />
        <EmptyState icon="building" title="Listing not found" message="This listing may have been removed." actionLabel="Back to properties" onAction={() => navigate('/admin/properties')} />
      </div>
    );
  }

  const detailItems = [
    { label: 'Type', value: propertyTypeLabel(property.type) },
    { label: 'Bedrooms', value: property.bedrooms ? formatNumber(property.bedrooms) : '–' },
    { label: 'Bathrooms', value: property.bathrooms ? formatNumber(property.bathrooms) : '–' },
    { label: 'Size', value: property.size ? `${formatNumber(property.size)} sq ft` : '–' },
    { label: 'Furnishing', value: property.furnishing || '–' },
    { label: 'Available from', value: formatDate(property.availableFrom) },
    { label: 'Monthly rent', value: formatPrice(property.price) },
    { label: 'Listed', value: formatDate(property.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Review"
        subtitle="Verify the listing details before making a moderation decision."
        back="/admin/properties"
        backLabel="All properties"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main content */}
        <div className="min-w-0 space-y-6">
          {/* Gallery */}
          <section className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="relative aspect-[16/9] bg-slate-100">
              <ImageWithFallback src={images[mainImage]} alt={property.title} loading="eager" />
              <div className="absolute top-3 left-3">
                <ListingStatusBadge status={property.status} />
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-line p-3 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setMainImage(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === mainImage}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === mainImage ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback src={img} alt={`${property.title} photo ${i + 1}`} imgClassName="h-16 w-24" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Title */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{property.title}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>{property.area}, {property.city}, {property.district}</span>
                  <span className="text-slate-400">•</span>
                  <span>{PROPERTY_TYPE_MAP[property.type] || property.type}</span>
                  <span className="text-slate-400">•</span>
                  <span>{formatNumber(property.views)} views</span>
                </p>
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-900">{formatPrice(property.price)}<span className="text-xs font-medium text-slate-500"> /month</span></p>
            </div>
          </section>

          {/* Owner card */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Owner</h3>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Avatar name={property.owner?.name} size="lg" />
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                    {property.owner?.name || 'Unknown owner'}
                    {property.ownerVerified && (
                      <span className="text-emerald-600" title="Verified owner">
                        <Icon name="verified" className="h-4 w-4" />
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <VerificationBadge status={property.owner?.verification} />
                    <span className="text-xs text-slate-500">Owner since {property.owner?.memberSince || '–'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 sm:ml-4">
                <span className="inline-flex items-center gap-1.5"><Icon name="mail" className="h-4 w-4 text-slate-500" />{property.owner?.email || '–'}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="phone" className="h-4 w-4 text-slate-500" />{property.owner?.phone || '–'}</span>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Location</h3>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">District</dt><dd className="mt-0.5 text-slate-800">{property.district || '–'}</dd></div>
              <div><dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">City</dt><dd className="mt-0.5 text-slate-800">{property.city || '–'}</dd></div>
              <div><dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Area</dt><dd className="mt-0.5 text-slate-800">{property.area || '–'}</dd></div>
              <div><dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Address</dt><dd className="mt-0.5 text-slate-800">{property.address || '–'}</dd></div>
            </dl>
          </section>

          {/* Details */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Property details</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {detailItems.map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Amenities */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Amenities</h3>
            {amenities.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800">
                    <Icon name="check" className="h-3.5 w-3.5" />
                    {AMENITY_MAP[a] || a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No amenities listed.</p>
            )}
          </section>

          {/* Description */}
          <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Description</h3>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-700">{property.description || 'No description provided.'}</p>
            {property.adminNote && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-amber-800">
                  <Icon name="info" className="h-4 w-4" /> Admin note
                </p>
                <p className="mt-1 text-amber-800/90">{property.adminNote}</p>
              </div>
            )}
          </section>

          {/* Reviews */}
          <ReviewsSection reviews={property.reviews || []} rating={property.rating} reviewCount={property.reviewCount} />
        </div>

        {/* Decision panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-xl border border-line bg-white p-5">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Moderation decision</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Track where this submission sits, then approve or send it back with a reason.
              </p>
            </div>

            {/* Verification state timeline */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Verification status</p>
              <ol className="space-y-2">
                {VERIFICATION_STEPS.map((step) => {
                  const state = stepState(property.status, step.key);
                  return (
                    <li key={step.key} aria-current={state === 'current' ? 'step' : undefined}>
                      <Badge
                        tone={state === 'current' ? step.tone : state === 'done' ? 'success' : 'neutral'}
                        icon={<Icon name={state === 'done' ? 'check' : step.icon} className="h-3.5 w-3.5" />}
                        className={state === 'upcoming' ? 'opacity-70' : ''}
                      >
                        {step.label}
                        {state === 'current' && <span className="sr-only"> (current status)</span>}
                        {state === 'done' && <span className="sr-only"> (completed)</span>}
                      </Badge>
                    </li>
                  );
                })}
              </ol>
              {!VERIFICATION_STEPS.some((s) => s.key === property.status) && (
                <p className="mt-2">
                  <ListingStatusBadge status={property.status} />
                </p>
              )}
            </div>

            {actionError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {actionError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <Button
                variant="success"
                fullWidth
                loading={busy}
                disabled={property.status === 'approved'}
                onClick={handleApprove}
              >
                <Icon name="check" className="h-4 w-4" />
                {property.status === 'approved' ? 'Approved' : 'Approve'}
              </Button>
              <Button variant="danger" fullWidth loading={busy} onClick={() => openDecision('reject')}>
                <Icon name="x" className="h-4 w-4" />
                Reject
              </Button>
              <Button variant="outline" fullWidth loading={busy} onClick={() => openDecision('changes')}>
                <Icon name="edit" className="h-4 w-4" />
                Request changes
              </Button>
              <Button variant="outline" fullWidth loading={busy} onClick={() => openDecision('suspend')}>
                <Icon name="pause" className="h-4 w-4" />
                Suspend
              </Button>
            </div>

            <div className="rounded-lg bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-600">Submission summary</p>
              <p className="mt-1">
                Listed {formatDate(property.createdAt)} · Last updated {formatDate(property.updatedAt)} · {formatNumber(property.reviewCount || 0)} reviews
              </p>
            </div>
          </div>

          {/* Mobile bottom bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              <Button variant="success" size="sm" className="flex-1" loading={busy} onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="danger" size="sm" className="flex-1" loading={busy} onClick={() => openDecision('reject')}>
                Reject
              </Button>
              <Dropdown
                ariaLabel="More moderation actions"
                align="right"
                trigger={
                  <Button variant="outline" size="sm" className="border-line">
                    <Icon name="chevronDown" className="h-4 w-4" />
                  </Button>
                }
                items={[
                  { label: 'Request changes', icon: <Icon name="edit" className="h-4 w-4" />, onClick: () => openDecision('changes') },
                  { label: 'Suspend', icon: <Icon name="pause" className="h-4 w-4" />, tone: 'danger', onClick: () => openDecision('suspend') },
                ]}
              />
            </div>
          </div>
        </aside>
      </div>

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
              variant={decision?.mode === 'changes' ? 'primary' : 'danger'}
              type="submit"
              form="review-decision-form"
              loading={busy}
              disabled={!reason.trim()}
            >
              {decisionMeta?.submitLabel}
            </Button>
          </div>
        }
      >
        {decisionMeta && (
          <form id="review-decision-form" onSubmit={submitDecision}>
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