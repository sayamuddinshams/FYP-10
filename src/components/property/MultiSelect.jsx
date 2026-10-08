import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

/**
 * Multi-select dropdown used for location and type filters.
 * options: [{ value, label, hint? }]
 *
 * Keyboard: trigger and options are real buttons (Tab / Enter / Space),
 * Escape closes the popover and returns focus to the trigger without
 * closing an enclosing dialog (e.g. the mobile filter drawer).
 * The popover is only mounted while open, so it never sits in the tab order.
 */
export default function MultiSelect({ label, options = [], selected = [], onChange, searchable = false, placeholder = 'Any' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const listId = useId();

  // Close when clicking outside.
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // While open: Escape closes (without dismissing an enclosing dialog),
  // tabbing away closes, and the list flips above the trigger when there
  // is not enough room below it.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const root = ref.current;

    const flip = () => {
      if (!root) return;
      const r = root.getBoundingClientRect();
      setDropUp(window.innerHeight - r.bottom < 320 && r.top >= 320);
    };
    flip();

    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onFocusIn = (e) => {
      if (root && !root.contains(e.target)) setOpen(false);
    };

    root?.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('resize', flip);
    window.addEventListener('scroll', flip, true);
    return () => {
      root?.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('resize', flip);
      window.removeEventListener('scroll', flip, true);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(value) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm transition',
          selected.length ? 'border-brand-300 text-brand-800' : 'border-line text-slate-500 hover:border-slate-300'
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <span className="truncate">{selected.length ? `${label} (${selected.length})` : label}</span>
        </span>
        <Icon name="chevronDown" aria-hidden="true" className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id={listId}
          role="group"
          aria-label={`${label} options`}
          className={cn(
            'absolute z-50 w-full min-w-56 overflow-hidden rounded-xl border border-line bg-white shadow-pop animate-pop',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {searchable && (
            <div className="border-b border-line p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                aria-label={`Search ${label}`}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto p-1.5 thin-scrollbar">
            {filtered.length === 0 && <li className="px-3 py-2.5 text-sm text-slate-500">No matches.</li>}
            {filtered.map((option) => {
              const active = selected.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition',
                      active ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
                        active ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white'
                      )}
                    >
                      {active && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.hint && <span className="text-xs text-slate-500">{option.hint}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {selected.length > 0 && (
            <div className="border-t border-line p-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="min-h-10 w-full rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
