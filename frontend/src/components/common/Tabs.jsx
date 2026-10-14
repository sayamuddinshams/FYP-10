import { cn } from '../../utils/format';

/**
 * tabs: [{ value, label, count? }]
 * variant: 'underline' (default) | 'pill'
 */
export default function Tabs({ tabs, value, onChange, variant = 'underline', className = '', ariaLabel }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex gap-1 overflow-x-auto no-scrollbar',
        variant === 'underline' && 'border-b border-line',
        variant === 'pill' && 'rounded-xl bg-slate-100 p-1',
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-150',
              variant === 'underline' && [
                'px-3.5 py-3',
                active ? 'text-brand-800' : 'text-slate-500 hover:text-slate-800',
                active && 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-700',
              ],
              variant === 'pill' && [
                'rounded-lg px-3.5 py-2',
                active ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              ]
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold',
                  active ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
