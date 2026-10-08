import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';
import Avatar from '../common/Avatar';
import Icon, { HeartIcon } from '../common/icons';
import useFavorite from '../../hooks/useFavorite';
import { formatPrice, cn } from '../../utils/format';
import { propertyTypeLabel } from '../../utils/constants';

export default function PropertyCard({ property, className = '', compact = false }) {
  const { favorited, toggle } = useFavorite(property.id);
  const [popping, setPopping] = useState(false);

  if (!property) return null;

  const ownerName = property.owner?.name || 'Property owner';

  async function onFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle();
    if (res?.requiresAuth) return;
    if (res?.favorited) {
      setPopping(true);
      setTimeout(() => setPopping(false), 450);
    }
  }

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift',
        className
      )}
    >
      <Link to={`/property/${property.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100" aria-label={`View ${property.title}`}>
        <ImageWithFallback
          src={property.images?.[0]}
          alt={property.title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
        {/* Scrims */}
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(11,26,48,.45),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(11,26,48,.35))]" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-900 uppercase shadow-soft backdrop-blur-sm">
            {propertyTypeLabel(property.type)}
          </span>
          {property.ownerVerified && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[linear-gradient(135deg,#059669,#047857)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-soft">
              <Icon name="check" className="h-3 w-3" strokeWidth={3} />
              Verified
            </span>
          )}
        </div>

        {property.featured && (
          <span className="absolute top-3 right-14 inline-flex items-center gap-1 rounded-lg bg-[linear-gradient(135deg,#f59e0b,#d97706)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-soft">
            <Icon name="spark" className="h-3 w-3" />
            Featured
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from saved properties' : 'Save property'}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-card backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500"
      >
        <HeartIcon
          filled={favorited}
          className={cn('h-5 w-5 transition-colors', favorited ? 'text-red-500' : 'text-slate-500', popping && 'animate-heart')}
        />
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[1.4rem] leading-none font-extrabold tracking-tight text-brand-950 tabular-nums">
            {formatPrice(property.price)}
            <span className="ml-1 text-xs font-semibold tracking-wide text-slate-400">/month</span>
          </p>
          {property.rating > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60">
              <Icon name="star" className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
              {property.rating.toFixed(1)}
              <span className="font-medium text-amber-600/70">({property.reviewCount})</span>
            </span>
          )}
        </div>

        <Link to={`/property/${property.id}`} className="mt-2 block">
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary">
            {property.title}
          </h3>
        </Link>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <Icon name="pin" className="h-4 w-4 shrink-0 text-primary-300" />
          <span className="truncate">
            {property.area}, {property.city}, {property.district}
          </span>
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          {property.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="home" className="h-4 w-4 text-slate-400" />
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Icon name="spark" className="h-4 w-4 text-slate-400" />
            {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="grid" className="h-4 w-4 text-slate-400" />
            {formatPrice(property.size).replace('Rs ', '')} sq ft
          </span>
        </div>

        {!compact && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{property.description}</p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar name={ownerName} size="xs" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-700">{ownerName}</p>
                <p className="text-[11px] text-slate-400">Owner / Agent</p>
              </div>
            </div>
            <Link
              to={`/property/${property.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-800 transition-all duration-200 group-hover:bg-[linear-gradient(135deg,#2e4a7d,#385c9a)] group-hover:text-white group-hover:shadow-soft"
            >
              View Details
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {property.status && property.status !== 'approved' && (
        <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
          {property.status === 'pending' ? 'Awaiting approval' : property.status}
        </span>
      )}
    </article>
  );
}
