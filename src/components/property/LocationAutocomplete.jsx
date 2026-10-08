import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../common/icons';
import { searchLocations } from '../../data/locations';
import { cn } from '../../utils/format';

/**
 * Partial-match location search over the District → City → Area hierarchy.
 * "Jut" → Jutial, Gilgit · "Kari" → Karimabad, Hunza
 */
export default function LocationAutocomplete({
  value = '',
  onSelect,
  placeholder = 'Search city, area or district',
  id,
  autoFocus = false,
  className = '',
  inputClassName = '',
  icon = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => searchLocations(query, 8), [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function choose(item) {
    setQuery(item.kind === 'area' ? item.area : item.kind === 'city' ? item.city : item.district);
    setOpen(false);
    onSelect?.(item);
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div className="relative">
        {icon && <Icon name="pin" className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onSelect?.({ district: '', city: '', area: '', label: e.target.value, kind: 'text' });
          }}
          onFocus={() => setOpen(true)}
          className={cn(
            'h-12 w-full rounded-lg border border-line bg-white pr-3.5 text-sm text-slate-900 placeholder:text-slate-400',
            'focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none',
            icon ? 'pl-11' : 'pl-3.5',
            inputClassName
          )}
        />
      </div>

      {open && query.trim().length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-pop"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-400">No locations match “{query}”.</li>
          )}
          {results.map((item) => (
            <li key={`${item.kind}-${item.label}`} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => choose(item)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name="pin" className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {item.kind === 'area' ? item.area : item.kind === 'city' ? item.city : item.district}
                    {item.kind !== 'district' && (
                      <span className="font-normal text-slate-400">
                        , {item.kind === 'area' ? `${item.city}, ` : ''}
                        {item.district}
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] font-medium tracking-wide text-slate-400 uppercase">{item.kind}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
