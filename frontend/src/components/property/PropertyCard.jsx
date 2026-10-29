import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';
import Avatar from '../common/Avatar';
import { MaterialIcon } from '../common/icons';
import useFavorite from '../../hooks/useFavorite';
import { formatPrice, cn } from '../../utils/format';
import { LISTING_STATUS_LABELS, USER_ROLES, propertyTypeLabel } from '../../utils/constants';

export default function PropertyCard({ property, className = '', compact = false }) {
  const { favorited, toggle } = useFavorite(property.id);
  const [popping, setPopping] = useState(false);

  if (!property) return null;

  const ownerName = property.owner?.name || 'Property Owner';
  const ownerRole = USER_ROLES[property.owner?.role] || 'Owner / Agent';
  const showStatus = Boolean(property.status) && property.status !== 'approved';
  const statusLabel =
    property.status === 'pending' ? 'Awaiting Approval' : LISTING_STATUS_LABELS[property.status] || property.status;

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
        'group rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-slate-900/5',
        className
      )}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/property/${property.id}`} className="block w-full h-full" aria-label={`View ${property.title}`}>
          <div className="w-full h-full overflow-hidden">
            <ImageWithFallback
              src={property.images?.[0]}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-[#0B1320]/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wide">
            {propertyTypeLabel(property.type)}
          </span>
          {property.ownerVerified && (
            <span className="px-2.5 py-1 rounded-md bg-[#85F8C4] text-[#002114] text-[11px] flex items-center gap-1 font-bold">
              <MaterialIcon className="text-[13px]">verified</MaterialIcon>
              Verified
            </span>
          )}
          {property.featured && (
            <span className="px-2.5 py-1 rounded-md bg-[#FFDCC3] text-[#2F1500] text-[11px] font-bold">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={onFavorite}
          aria-label={favorited ? 'Remove from saved' : 'Save to favorites'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-[#BA1A1A] transition-colors shadow-sm cursor-pointer z-10"
        >
          <MaterialIcon
            className={cn(
              'text-[20px] transition-transform duration-300',
              favorited && 'text-[#BA1A1A]',
              popping && 'scale-125'
            )}
            name={favorited ? 'favorite' : 'favorite_border'}
          >
          </MaterialIcon>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#1B1B1D]">
                {formatPrice(property.price)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/month</span>
            </div>
            {property.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                <MaterialIcon className="text-[14px] text-[#D97706] fill">star</MaterialIcon>
                {property.rating.toFixed(1)}
              </span>
            )}
          </div>

          <Link to={`/property/${property.id}`} className="block">
            <h3 className="font-bold text-base text-[#1B1B1D] group-hover:text-[#D97706] transition-colors line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MaterialIcon className="text-[15px] text-[#D97706] shrink-0">location_on</MaterialIcon>
            <span className="truncate">
              {property.area}, {property.city}, {property.district}
            </span>
          </p>

          {/* Specs Row */}
          <div className="flex items-center gap-2.5 py-2.5 mt-3 bg-slate-50 rounded-xl px-3 text-slate-600 text-xs font-semibold">
            {property.bedrooms > 0 && (
              <>
                <span className="flex items-center gap-1">
                  <MaterialIcon className="text-[16px] text-slate-400">bed</MaterialIcon>
                  {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                </span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <MaterialIcon className="text-[16px] text-slate-400">bathtub</MaterialIcon>
              {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <MaterialIcon className="text-[16px] text-slate-400">square_foot</MaterialIcon>
              {property.size ? `${property.size} sq ft` : '–'}
            </span>
          </div>

          {!compact && property.description && (
            <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
              {property.description}
            </p>
          )}
        </div>

        {/* Card Footer with Agent & CTA */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={ownerName} size="xs" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1B1B1D] truncate">{ownerName}</span>
              <span className="text-[11px] text-slate-400 truncate">{ownerRole}</span>
            </div>
          </div>

          <Link
            to={`/property/${property.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1320] hover:text-[#D97706] transition-colors group/link shrink-0"
          >
            <span>View Details</span>
            <MaterialIcon className="text-[15px] group-hover/link:translate-x-0.5 transition-transform">
              arrow_forward
            </MaterialIcon>
          </Link>
        </div>
      </div>

      {showStatus && (
        <span className="absolute inset-x-0 bottom-0 bg-[#0B1320]/90 py-1 text-center text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
          {statusLabel}
        </span>
      )}
    </article>
  );
}
