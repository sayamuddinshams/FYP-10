import Button from './Button';
import { cn } from '../../utils/format';

/** Generic inline error state with retry. */
export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry, className = '', compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 text-center animate-fade-up', compact ? 'py-8' : 'py-14', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="max-w-md text-sm font-medium text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SuccessState({ title = 'Done', message, actionLabel, onAction, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-14 text-center animate-fade-up', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {message && <p className="mt-1.5 max-w-md text-sm text-slate-600">{message}</p>}
      {actionLabel && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
