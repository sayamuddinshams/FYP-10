import { cn } from '../../utils/format';

/** Card shell used to wrap charts on dashboards. */
export default function ChartCard({ title, subtitle, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={cn('rounded-xl border border-line bg-white p-5 sm:p-6', className)}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}
