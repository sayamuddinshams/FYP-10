import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import useFavorite from '../../hooks/useFavorite';
import propertyService from '../../services/propertyService';
import messageService from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AMENITY_MAP, propertyTypeLabel, USER_ROLES } from '../../utils/constants';
import { formatArea, formatDate, formatPrice } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge, { VerificationBadge } from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Icon, { HeartIcon } from '../../components/common/icons';
import { ErrorState } from '../../components/common/Feedback';
import EmptyState from '../../components/common/EmptyState';
import { PropertyCardSkeleton, LineSkeleton, Skeleton } from '../../components/common/Skeleton';
import PropertyGallery from '../../components/property/PropertyGallery';
import RequestVisitModal from '../../components/property/RequestVisitModal';
import ShareModal from '../../components/property/ShareModal';
import ReviewsSection from '../../components/property/ReviewsSection';
import PropertyCard from '../../components/property/PropertyCard';

function Spec({ icon, label, value }) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 shadow-2xs transition-transform duration-300 group-hover:scale-105">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="truncate text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();
  const { favorited, toggle } = useFavorite(id);

  const [visitOpen, setVisitOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const navigate = useNavigate();

  const { data: property, loading, error, reload } = useAsync(() => propertyService.getById(id), [id]);
  const { data: related, loading: relatedLoading, error: relatedError, reload: reloadRelated } = useAsync(
    () => propertyService.getRelated(id, 3),
    [id, property?.updatedAt]
  );

  useEffect(() => {
    if (id && isAuthenticated) propertyService.incrementView(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useDocumentTitle(property?.title || 'Property');

  async function onFavorite() {
    const res = await toggle();
    if (res?.requiresAuth) return;
    toast.success(
      res?.favorited ? 'Saved to your list.' : 'Removed from your saved properties.',
      res?.favorited ? 'Saved' : 'Removed'
    );
  }

  async function onMessageOwner() {
    if (!isAuthenticated) {
      openAuth('login', { type: 'message', propertyId: id });
      return;
    }
    if (!property?.owner) return;
    setMessaging(true);
    try {
      await messageService.openWith({
        propertyId: property.id,
        ownerId: property.owner.id,
        tenantId: user.id,
      });
      const inbox = user.role === 'owner' ? '/owner/messages' : '/tenant/messages';
      navigate(inbox);
    } catch (err) {
      toast.error(err?.message || 'Unable to open the conversation.');
      setMessaging(false);
    }
  }

  const amenityLabels = useMemo(
    () => (property?.amenities || []).map((a) => AMENITY_MAP[a] || a),
    [property]
  );

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="aspect-[16/9] w-full" />
            <LineSkeleton />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <ErrorState
          message={error || 'This property could not be found. It may have been removed by the owner.'}
          onRetry={reload}
        />
        <div className="mt-6 text-center">
          <Link to="/browse">
            <Button variant="outline">Back to browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const owner = property.owner || {};
  const specs = [
    property.bedrooms > 0 && { icon: 'home', label: 'Bedrooms', value: property.bedrooms },
    { icon: 'spark', label: 'Bathrooms', value: property.bathrooms },
    { icon: 'grid', label: 'Area', value: formatArea(property.size) },
    { icon: 'building', label: 'Type', value: propertyTypeLabel(property.type) },
  ].filter(Boolean);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 lg:px-8 lg:pb-8">
        {/* Breadcrumb + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="transition hover:text-amber-700">Home</Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <Link to="/browse" className="transition hover:text-amber-700">Browse</Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-slate-700">{property.title}</span>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => setShareOpen(true)}>
              <Icon name="share" className="h-4 w-4" />
              Share
            </Button>
            <Button variant={favorited ? 'primary' : 'outline'} size="md" onClick={onFavorite} aria-pressed={favorited}>
              <HeartIcon filled={favorited} className="h-4 w-4" />
              {favorited ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            <PropertyGallery images={property.images} title={property.title} />

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div
                aria-hidden="true"
                className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl"
              />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{propertyTypeLabel(property.type)}</Badge>
                  {property.ownerVerified && <VerificationBadge status="verified" />}
                  {property.status === 'pending' && <Badge tone="warning">Awaiting approval</Badge>}
                  {property.status === 'approved' && <Badge tone="success">Listed and verified</Badge>}
                </div>

                <h1 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight font-bold tracking-tight text-slate-950">
                  {property.title}
                </h1>

                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <Icon name="pin" className="h-4 w-4 shrink-0 text-amber-600" />
                  {property.area}, {property.city}, {property.district}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 tabular-nums">
                    {formatPrice(property.price)}
                    <span className="ml-2 font-sans text-sm font-semibold tracking-wide text-slate-500">/month</span>
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Security deposit equals one month rent · 5% platform fee applies on completed rentals
                  </p>
                </div>
              </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((spec) => (
                <Spec key={spec.label} {...spec} />
              ))}
            </div>

            {/* Description */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-950">About this property</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-600">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-ink">What this place offers</h2>
              {amenityLabels.length ? (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {amenityLabels.map((a) => (
                    <li
                      key={a}
                      className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-surface px-3.5 py-2.5 text-sm text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">The owner has not listed amenities for this property.</p>
              )}
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-ink">Location</h2>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${property.area}, ${property.city}, ${property.district}, Gilgit-Baltistan`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Open in Maps
                </a>
              </div>

              <div className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
                {/* Stylised static map panel (no external map SDK required) */}
                <div className="relative h-56 sm:h-64">
                  <svg viewBox="0 0 600 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <rect width="600" height="260" fill="#eef2f7" />
                    <path d="M0 190 C120 160 200 210 300 180 C400 150 480 200 600 170" stroke="#d7dee9" strokeWidth="18" fill="none" />
                    <path d="M-20 80 C140 110 260 40 420 70 C500 85 560 60 620 75" stroke="#dbe3ee" strokeWidth="26" fill="none" />
                    <path d="M60 0 L120 260" stroke="#e3e9f2" strokeWidth="12" fill="none" />
                    <path d="M340 0 L300 260" stroke="#e3e9f2" strokeWidth="12" fill="none" />
                    <path d="M500 0 L540 260" stroke="#e3e9f2" strokeWidth="12" fill="none" />
                    <circle cx="300" cy="130" r="60" fill="#dbeafe" opacity="0.7" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/95 px-5 py-3 text-center shadow-lift backdrop-blur-sm">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                        <Icon name="pin" className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-semibold text-slate-800">{property.area}</p>
                      <p className="text-xs text-slate-500">{property.city}, {property.district}</p>
                    </div>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <Fact label="District" value={property.district} />
                <Fact label="City / Town" value={property.city} />
                <Fact label="Locality" value={property.area} />
                <Fact label="Full address" value={property.address} />
                <Fact label="Furnishing" value={property.furnishing || '–'} />
                <Fact label="Available from" value={formatDate(property.availableFrom)} />
                <Fact label="Listed on" value={formatDate(property.createdAt)} />
              </dl>
            </section>

            {/* Reviews */}
            <ReviewsSection reviews={property.reviews} rating={property.rating} reviewCount={property.reviewCount} />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Listed by</p>
                  {owner.verification && <VerificationBadge status={owner.verification} />}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={owner.name || 'Owner'} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{owner.name || 'Property owner'}</p>
                    <p className="text-xs text-slate-500">{USER_ROLES[owner.role] || 'Owner / Agent'}</p>
                  </div>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  {owner.memberSince && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Member since</dt>
                      <dd className="font-medium text-slate-700">{formatDate(owner.memberSince)}</dd>
                    </div>
                  )}
                  {owner.phone && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="font-medium text-slate-700">{owner.phone}</dd>
                    </div>
                  )}
                  {!owner.memberSince && !owner.phone && (
                    <p className="text-sm text-slate-500">
                      The owner has not shared additional contact details.
                    </p>
                  )}
                </dl>

                <div className="mt-5 space-y-2.5">
                  <Button fullWidth size="lg" onClick={() => setVisitOpen(true)}>
                    <Icon name="calendar" className="h-4 w-4" />
                    Request Visit
                  </Button>
                  <Button fullWidth variant="outline" onClick={onMessageOwner} loading={messaging}>
                    <Icon name="chat" className="h-4 w-4" />
                    Message Owner
                  </Button>
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/70 p-3 text-center text-xs leading-relaxed text-amber-800 ring-1 ring-amber-100">
                  <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  Never send deposits before viewing. All payments on RentLink are tracked for your protection.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-[#0B1320] border border-slate-800 p-6 text-white shadow-xl">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_0%,rgba(217,119,6,.15),transparent_65%)]"
                />
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                      <Icon name="shield" className="h-4.5 w-4.5" />
                    </span>
                    <p className="font-serif text-base font-bold text-white">RentLink Alpine Guarantee</p>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <li className="flex gap-2.5">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Every listing and deed verified by local district liaisons.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>In-person visit scheduling tracked directly on platform.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Direct channel to Gilgit-Baltistan moderation desk.</span>
                    </li>
                  </ul>
                  <Link to="/about" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 transition-colors hover:text-amber-300">
                    Learn about verification & safety
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related listings — full-width row below the two-column layout */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-ink">Similar properties</h2>
            <Link to="/browse" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">
              View all →
            </Link>
          </div>
          {relatedLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : relatedError ? (
            <ErrorState message={relatedError} onRetry={reloadRelated} />
          ) : (related || []).length === 0 ? (
            <EmptyState
              icon="search"
              title="No similar properties yet"
              message="We could not find listings like this one at the moment."
              actionLabel="Browse all properties"
              onAction={() => navigate('/browse')}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(related || []).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sticky mobile action bar */}
      <div
        role="region"
        aria-label="Property actions"
        className="sticky bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg leading-tight font-bold text-brand-900 tabular-nums">{formatPrice(property.price)}</p>
            <p className="text-xs text-slate-500">per month</p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="md" onClick={onMessageOwner} loading={messaging} className="min-w-0 flex-1">
              <Icon name="chat" className="h-4 w-4 shrink-0" />
              Message
            </Button>
            <Button size="md" onClick={() => setVisitOpen(true)} className="min-w-0 flex-1">
              <Icon name="calendar" className="h-4 w-4 shrink-0" />
              Request Visit
            </Button>
          </div>
        </div>
      </div>

      <RequestVisitModal open={visitOpen} onClose={() => setVisitOpen(false)} property={property} />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`Check out "${property.title}" on RentLink`}
      />
    </div>
  );
}
