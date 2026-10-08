import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

/**
 * Multi-select dropdown used for location and type filters.
 * options: [{ value, label, hint? }]
 */
export default function MultiSelect({ label, options = [], selected = [], onChange, searchable = false, placeholder = 'Any' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 text-left text-sm transition',
          selected.length ? 'border-brand-300 text-brand-800' : 'border-line text-slate-500 hover:border-slate-300'
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <span className="truncate">{selected.length ? `${label} (${selected.length})` : label}</span>
        </span>
        <Icon name="chevronDown" className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-56 overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-slate-900/10 animate-pop">
          {searchable && (
            <div className="border-b border-line p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-9 w-full rounded-lg border border-line px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto p-1.5 thin-scrollbar">
            {filtered.length === 0 && <li className="px-3 py-2.5 text-sm text-slate-400">No matches.</li>}
            {filtered.map((option) => {
              const active = selected.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition',
                      active ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
                        active ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white'
                      )}
                    >
                      {active && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.hint && <span className="text-xs text-slate-400">{option.hint}</span>}
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
                className="w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
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
