import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from '../common/icons';
import { searchLocations } from '../../data/locations';
import { cn } from '../../utils/format';

/**
 * Partial-match location search over the District → City → Area hierarchy.
 * "Jut" → Jutial, Gilgit · "Kari" → Karimabad, Hunza
 *
 * Implements the ARIA combobox pattern: the input keeps focus, arrow keys move an
 * active option, Enter selects it, and `aria-activedescendant` exposes it to AT.
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
  ariaLabel = 'Location',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const openRef = useRef(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const listId = `${inputId}-listbox`;

  openRef.current = open;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => searchLocations(query, 8), [query]);
  const hasQuery = query.trim().length > 0;
  const showList = open && hasQuery;
  const activeId = showList && active >= 0 ? `${listId}-${active}` : undefined;

  useEffect(() => {
    if (!showList || active < 0) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [showList, active, listId]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // First Escape dismisses the suggestions only; a second one bubbles up to
      // whatever opened us (e.g. the header search panel).
      if (openRef.current) {
        e.stopImmediatePropagation();
        openRef.current = false;
        setOpen(false);
      }
    };
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
    setActive(-1);
    onSelect?.(item);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!hasQuery) return;
      e.preventDefault();
      if (!showList) {
        setOpen(true);
        setActive(0);
        return;
      }
      if (!results.length) return;
      setActive((i) =>
        e.key === 'ArrowDown'
          ? i >= results.length - 1
            ? 0
            : i + 1
          : i <= 0
            ? results.length - 1
            : i - 1
      );
      return;
    }
    if (e.key === 'Escape' && showList) {
      e.stopPropagation();
      setOpen(false);
      setActive(-1);
      return;
    }
    if (e.key === 'Enter' && showList && active >= 0 && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div className="relative">
        {icon && (
          <Icon
            name="pin"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-500"
          />
        )}
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
            onSelect?.({ district: '', city: '', area: '', label: e.target.value, kind: 'text' });
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'h-12 w-full rounded-lg border border-line bg-white pr-3.5 text-sm text-slate-900 placeholder:text-slate-500',
            'focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none',
            icon ? 'pl-11' : 'pl-3.5',
            inputClassName
          )}
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          // Keep keyboard focus in the input while the pointer interacts with options.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-pop"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">No locations match “{query}”.</li>
          )}
          {results.map((item, i) => (
            <li
              key={`${item.kind}-${item.label}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(item)}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors',
                i === active && 'bg-brand-50'
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name="pin" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800">
                  {item.kind === 'area' ? item.area : item.kind === 'city' ? item.city : item.district}
                  {item.kind !== 'district' && (
                    <span className="font-normal text-slate-500">
                      , {item.kind === 'area' ? `${item.city}, ` : ''}
                      {item.district}
                    </span>
                  )}
                </span>
                <span className="block text-[11px] font-medium tracking-wide text-slate-500 uppercase">{item.kind}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
