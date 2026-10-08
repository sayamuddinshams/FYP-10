import Button from './Button';
import Icon from './icons';
import { cn } from '../../utils/format';

const icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M6 4h12v17l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M3 13h5l2 3h4l2-3h5M3 13l2.5-7h13L21 13v6H3v-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M15 17H9m9-4V9a6 6 0 10-12 0v4l-1.5 3h15L18 13z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M4 21V6l7-3v18M11 21h9V10l-9-3M7.5 9v.01M7.5 13v.01M7.5 17v.01M15 12v.01M15 16v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function EmptyState({
  icon = 'search',
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        {icons[icon] || <Icon name={icon} className="h-6 w-6" strokeWidth={1.6} />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>}
      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {actionLabel && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryLabel && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
