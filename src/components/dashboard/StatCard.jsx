import { useEffect, useRef, useState } from 'react';
import { cn, formatNumber } from '../../utils/format';

/** Animated count-up for dashboard statistics. */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const from = previous.current;
    const to = Number(target) || 0;
    if (from === to) {
      setValue(to);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
      else previous.current = to;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const tones = {
  brand: 'bg-[linear-gradient(140deg,#f1f5fb,#e2eaf6)] text-primary-700 ring-1 ring-brand-100',
  success: 'bg-[linear-gradient(140deg,#ecfdf5,#d1fae5)] text-emerald-600 ring-1 ring-emerald-100',
  warning: 'bg-[linear-gradient(140deg,#fffbeb,#fef3c7)] text-amber-600 ring-1 ring-amber-100',
  danger: 'bg-[linear-gradient(140deg,#fef2f2,#fee2e2)] text-red-600 ring-1 ring-red-100',
  info: 'bg-[linear-gradient(140deg,#f0f9ff,#e0f2fe)] text-sky-600 ring-1 ring-sky-100',
  neutral: 'bg-[linear-gradient(140deg,#f8fafc,#f1f5f9)] text-slate-500 ring-1 ring-slate-200',
};

export default function StatCard({ label, value, suffix = '', prefix = '', hint, icon, tone = 'brand', trend, numeric = true, className = '' }) {
  const animated = useCountUp(numeric ? value : 0);
  const display = numeric ? formatNumber(animated) : value;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition-all duration-300',
        'hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-brand-100/40 blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
          <p className="mt-2 text-2xl leading-none font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-[1.7rem]">
            {prefix}
            {display}
            {suffix}
          </p>
        </div>
        {icon && (
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-soft transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105', tones[tone])}>
            {icon}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
              trend.direction === 'down'
                ? 'bg-red-50 text-red-600'
                : trend.direction === 'flat'
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-emerald-50 text-emerald-600'
            )}
          >
            {trend.direction === 'up' && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M6 10L2 5h2V2h4v3h2l-4 5z" />
              </svg>
            )}
            {trend.label}
          </span>
        )}
        {hint && <span className="truncate text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}
