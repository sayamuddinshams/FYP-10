import { cn } from '../../utils/format';

const styles = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-500', title: 'Success' },
  error: { bar: 'bg-red-500', icon: 'text-red-500', title: 'Error' },
  info: { bar: 'bg-brand-600', icon: 'text-brand-600', title: 'Info' },
  warning: { bar: 'bg-amber-500', icon: 'text-amber-500', title: 'Heads up' },
};

const paths = {
  success: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
};

export default function Toast({ toast, onClose }) {
  const style = styles[toast.type] || styles.info;
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-slate-900/10 animate-slide-right"
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className={cn('mt-0.5 shrink-0', style.icon)}>
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d={paths[toast.type] || paths.info} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{toast.title || style.title}</p>
          <p className="mt-0.5 text-sm leading-snug text-slate-600">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="-m-1 shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.22 5.22z" />
          </svg>
        </button>
      </div>
      <div className={cn('h-0.5 w-full', style.bar)} />
    </div>
  );
}
