import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/format';

/**
 * Menu dropdown. items: [{ label, onClick, tone, icon }]
 */
export default function Dropdown({ trigger, items = [], align = 'right', className = '', panelClassName = '', ariaLabel = 'Menu' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-pop',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName
          )}
        >
          {items.map((item, i) =>
            item === '-' ? (
              <div key={`sep-${i}`} className="my-1.5 h-px bg-line" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors',
                  item.tone === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
