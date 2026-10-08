import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import ImageWithFallback from '../common/ImageWithFallback';
import { VisitStatusBadge } from '../common/Badge';
import { formatDate, timeAgo } from '../../utils/format';

/**
 * Shared card for visit requests (used by tenant, owner and admin views).
 * actions: node rendered in the footer.
 */
export default function VisitRequestCard({ visit, role = 'tenant', actions, className = '' }) {
  if (!visit) return null;
  const other = role === 'owner' ? visit.tenant : visit.owner;
  const otherLabel = role === 'owner' ? 'Tenant' : 'Owner / Agent';

  return (
    <article className={`rounded-xl border border-line bg-white p-4 transition hover:border-brand-200 sm:p-5 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link to={`/property/${visit.propertyId}`} className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-28">
          <ImageWithFallback src={visit.property?.image} alt={visit.property?.title} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link to={`/property/${visit.propertyId}`} className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition hover:text-brand-700">{visit.property?.title}</h3>
            </Link>
            <VisitStatusBadge status={visit.status} />
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="pin" className="h-3.5 w-3.5" />
            {visit.property?.location}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-slate-700">
              <Avatar name={other?.name} size="xs" />
              <span>
                <span className="block text-[11px] leading-none text-slate-400">{otherLabel}</span>
                <span className="text-xs font-medium">{other?.name}</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Icon name="calendar" className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium">{formatDate(visit.date)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Icon name="clock" className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium">{visit.time}</span>
            </span>
            <span className="text-[11px] text-slate-400">Requested {timeAgo(visit.createdAt)}</span>
          </div>

          {visit.message && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600">“{visit.message}”</p>
          )}

          {visit.ownerNote && (
            <p className="mt-2 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2.5 text-[13px] leading-relaxed text-brand-800">
              <span className="font-semibold">Owner note:</span> {visit.ownerNote}
            </p>
          )}
        </div>
      </div>

      {(actions || true) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
          <Link
            to={`/property/${visit.propertyId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
          >
            View property
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </article>
  );
}
