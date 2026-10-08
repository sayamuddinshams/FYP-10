import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { ErrorState } from '../../components/common/Feedback';
import { PageLoader } from '../../components/common/Spinner';
import { ListingStatusBadge, VisitStatusBadge } from '../../components/common/Badge';
import ReviewsSection from '../../components/property/ReviewsSection';

import propertyService from '../../services/propertyService';
import visitService from '../../services/visitService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { AMENITY_MAP, propertyTypeLabel } from '../../utils/constants';
import { cn, formatDate, formatNumber, formatPrice, timeAgo } from '../../utils/format';

const STATUS_BANNER = {
  approved: {
    tone: 'emerald',
    icon: 'check',
    title: 'Your listing is live',
    message: 'Tenants can find this property in search and request visits right now.',
  },
  pending: {
    tone: 'amber',
    icon: 'clock',
    title: 'Awaiting admin review',
    message: 'Our review team is checking this listing. You will be notified as soon as a decision is made.',
  },
  changes: {
    tone: 'amber',
    icon: 'edit',
    title: 'Changes requested',
    message: 'The review team needs a few edits before this listing can go live.',
  },
  rejected: {
    tone: 'red',
    icon: 'flag',
    title: 'Listing rejected',
    message: 'This listing did not pass review. Update it and submit again.',
  },
  draft: {
    tone: 'slate',
    icon: 'file',
    title: 'Draft — not submitted',
    message: 'This listing is only visible to you. Submit it for review when the details are complete.',
  },
  suspended: {
    tone: 'slate',
    icon: 'pause',
    title: 'Listing paused',
    message: 'This listing is hidden from tenants. Activate it to bring it back.',
  },
};

const BANNER_STYLES = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-800',
  slate: 'border-line bg-slate-50 text-slate-600',
};

const BANNER_ICON = {
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  slate: 'bg-slate-200 text-slate-500',
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();

  const [section, setSection] = useState('overview');
  const [photo, setPhoto] = useState(0);
  const [busy, setBusy] = useState('');

  const { data, loading, error, reload } = useAsync(
    async () => {
      const [property, visits] = await Promise.all([
        propertyService.getById(id),
        visitService.listByOwner(user.id),
      ]);
      return { property, visits };
    },
    [id, user?.id],
    { immediate: Boolean(user && id) }
  );

  const property = data?.property;
  const visits = useMemo(
    () => (data?.visits || []).filter((v) => v.propertyId === id),
    [data?.visits, id]
  );

  useDocumentTitle(property ? property.title : 'Property');

  if (loading && !data) return <PageLoader label="Loading listing…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!property) return <ErrorState message="Property not found." onRetry={() => navigate('/owner/properties')} />;

  const banner = STATUS_BANNER[property.status] || STATUS_BANNER.draft;
  const canSubmit = property.status === 'draft' || property.status === 'changes';
  const canPause = property.status === 'approved' || property.status === 'suspended';

  async function submitForReview() {
    const ok = await confirm({
      title: 'Submit this listing for review?',
      message: 'An admin will check the details and photos. You will be notified once it is approved.',
      confirmLabel: 'Submit for review',
      tone: 'brand',
    });
    if (!ok) return;
    setBusy('submit');
    try {
      await propertyService.submitForReview(property.id);
      toast.success('Property submitted for review.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to submit property.');
    } finally {
      setBusy('');
    }
  }

  async function togglePause() {
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
    setBusy('pause');
    try {
      await propertyService.pause(property.id);
      toast.success(pausing ? 'Listing paused.' : 'Listing activated.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to update the listing.');
    } finally {
      setBusy('');
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this listing?',
      message: `"${property.title}" and its reviews will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy('delete');
    try {
      await propertyService.remove(property.id);
      toast.success('Listing deleted.');
      navigate('/owner/properties');
    } catch (err) {
      toast.error(err?.message || 'Unable to delete the listing.');
      setBusy('');
    }
  }

  const images = property.images?.length ? property.images : [];
  const activePhoto = images[Math.min(photo, images.length - 1)];

  const details = [
    { label: 'Bedrooms', value: formatNumber(property.bedrooms), icon: 'home' },
    { label: 'Bathrooms', value: formatNumber(property.bathrooms), icon: 'refresh' },
    { label: 'Covered area', value: `${formatNumber(property.size)} sq ft`, icon: 'grid' },
    { label: 'Furnishing', value: property.furnishing, icon: 'tag' },
    { label: 'Available from', value: formatDate(property.availableFrom), icon: 'calendar' },
    { label: 'Property type', value: propertyTypeLabel(property.type), icon: 'building' },
  ];

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'description', label: 'Description' },
    { value: 'reviews', label: 'Reviews', count: property.reviews?.length || 0 },
    { value: 'activity', label: 'Activity', count: visits.length },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={property.title}
        subtitle={`${property.area}, ${property.city}, ${property.district}`}
        back="/owner/properties"
        backLabel="My properties"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button as={Link} to={`/owner/properties/${property.id}/edit`} variant="outline" size="sm">
              <Icon name="edit" className="h-4 w-4" />
              Edit
            </Button>
            {canSubmit && (
              <Button size="sm" loading={busy === 'submit'} disabled={Boolean(busy)} onClick={submitForReview}>
                Submit for Review
              </Button>
            )}
            {canPause && (
              <Button
                size="sm"
                variant={property.status === 'suspended' ? 'success' : 'secondary'}
                loading={busy === 'pause'}
                disabled={Boolean(busy)}
                onClick={togglePause}
              >
                <Icon name={property.status === 'suspended' ? 'play' : 'pause'} className="h-4 w-4" />
                {property.status === 'suspended' ? 'Activate' : 'Pause'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              loading={busy === 'delete'}
              disabled={Boolean(busy) && busy !== 'delete'}
              onClick={handleDelete}
            >
              <Icon name="trash" className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Status banner */}
      <div
        className={cn(
          'mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 animate-fade-up',
          BANNER_STYLES[banner.tone]
        )}
        role="status"
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', BANNER_ICON[banner.tone])}>
          <Icon name={banner.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">{banner.message}</p>
          {property.adminNote && (
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-relaxed">
              <span className="font-semibold">Reviewer note:</span> {property.adminNote}
            </p>
          )}
        </div>
        <span className="ml-auto hidden shrink-0 sm:block">
          <ListingStatusBadge status={property.status} />
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Gallery + content */}
        <div className="min-w-0 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="relative aspect-[16/10] bg-slate-100">
              {activePhoto ? (
                <ImageWithFallback src={activePhoto} alt={property.title} loading="eager" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                  <Icon name="image" className="h-9 w-9" />
                  <span className="text-sm">No photos uploaded yet</span>
                </div>
              )}
              <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-800 shadow-sm">
                {formatPrice(property.price)}
                <span className="font-medium text-slate-500"> / month</span>
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
                {images.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setPhoto(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={index === photo}
                    className={cn(
                      'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                      index === photo
                        ? 'border-brand-600 ring-2 ring-brand-100'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <ImageWithFallback src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-line bg-white p-5 sm:p-6">
            <Tabs tabs={tabs} value={section} onChange={setSection} />

            <div key={section} className="pt-5 animate-fade-up">
              {section === 'overview' && (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {details.map((d) => (
                      <div key={d.label} className="rounded-xl border border-line bg-slate-50/70 px-4 py-3.5">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                          <Icon name={d.icon} className="h-3.5 w-3.5" />
                          {d.label}
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Address</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {property.address}, {property.area}, {property.city} District, {property.district}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Amenities</h3>
                    {property.amenities?.length ? (
                      <ul className="mt-2.5 flex flex-wrap gap-2">
                        {property.amenities.map((a) => (
                          <li
                            key={a}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                          >
                            <Icon name="check" className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.4} />
                            {AMENITY_MAP[a] || a}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1.5 text-sm text-slate-500">No amenities listed yet.</p>
                    )}
                  </div>
                </div>
              )}

              {section === 'description' && (
                <div>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">
                    {property.description || 'No description has been written yet.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-4 text-xs text-slate-500">
                    <span>
                      Created <strong className="text-slate-800">{formatDate(property.createdAt)}</strong>
                    </span>
                    <span>
                      Last updated <strong className="text-slate-800">{formatDate(property.updatedAt)}</strong>
                    </span>
                    <span>
                      Listing ID <strong className="text-slate-800">{property.id}</strong>
                    </span>
                  </div>
                </div>
              )}

              {section === 'reviews' && (
                <ReviewsSection
                  reviews={property.reviews || []}
                  rating={property.rating || 0}
                  reviewCount={property.reviewCount || property.reviews?.length || 0}
                />
              )}

              {section === 'activity' &&
                (visits.length === 0 ? (
                  <EmptyState
                    icon="calendar"
                    title="No visit activity yet"
                    message="When tenants request a visit to this property, the history will appear here."
                    actionLabel="Back to overview"
                    onAction={() => setSection('overview')}
                  />
                ) : (
                  <ul className="divide-y divide-line">
                    {visits.map((visit) => (
                      <li key={visit.id} className="flex flex-wrap items-center gap-3 py-3.5">
                        <Avatar name={visit.tenant?.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{visit.tenant?.name}</p>
                          <p className="text-xs text-slate-500">
                            Requested {formatDate(visit.date)} at {visit.time} · {timeAgo(visit.createdAt)}
                          </p>
                          {visit.ownerNote && (
                            <p className="mt-1 text-xs text-slate-500">Your note: {visit.ownerNote}</p>
                          )}
                        </div>
                        <VisitStatusBadge status={visit.status} />
                      </li>
                    ))}
                  </ul>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-4">
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Listing performance</p>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Views', value: property.views, icon: 'eye', tone: 'text-brand-700 bg-brand-50' },
                { label: 'Saves', value: property.favorites, icon: 'heart', tone: 'text-red-500 bg-red-50' },
                { label: 'Reviews', value: property.reviews?.length || 0, icon: 'star', tone: 'text-amber-500 bg-amber-50' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', item.tone)}>
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-lg leading-none font-bold text-slate-900">{formatNumber(item.value)}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2.5">
              <Button as={Link} to={`/owner/properties/${property.id}/edit`} variant="outline" size="sm" fullWidth>
                <Icon name="edit" className="h-4 w-4" />
                Edit listing
              </Button>
              <Button as={Link} to="/owner/visits" variant="outline" size="sm" fullWidth>
                <Icon name="calendar" className="h-4 w-4" />
                Manage visit requests
              </Button>
              <Button as={Link} to="/owner/messages" variant="outline" size="sm" fullWidth>
                <Icon name="chat" className="h-4 w-4" />
                Message tenants
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Owner</p>
              {property.ownerVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Icon name="verified" className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={property.owner?.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{property.owner?.name}</p>
                <p className="text-xs text-slate-500">Member since {property.owner?.memberSince}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
