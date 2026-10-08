import { useId, useState } from 'react';
import Icon from '../common/icons';
import MultiSelect from './MultiSelect';
import { PROPERTY_TYPES, PRICE_RANGES } from '../../utils/constants';
import { LOCATIONS, DISTRICTS, getCities, getAreas } from '../../data/locations';
import { cn, formatPrice } from '../../utils/format';

/**
 * Number of active filter dimensions (mirrors the FilterChips row).
 * Used for the mobile filter trigger badge.
 */
export function countActiveFilters(filters) {
  if (!filters) return 0;
  return (
    (filters.types || []).length +
    (filters.districts || []).length +
    (filters.cities || []).length +
    (filters.areas || []).length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    (filters.furnished ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0)
  );
}

/** Collapsible filter group — exposes aria-expanded / aria-controls on the toggle. */
function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();
  return (
    <section className="border-b border-line py-5 first:pt-0 last:border-0 last:pb-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left transition hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <span className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">{title}</span>
          <Icon
            name="chevronDown"
            aria-hidden="true"
            className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200', open ? '' : '-rotate-90')}
          />
        </button>
      </h3>
      <div id={contentId} hidden={!open} className="mt-3">
        {children}
      </div>
    </section>
  );
}

function Segment({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'min-h-10 min-w-11 rounded-full border px-3 py-1.5 text-sm font-medium transition',
            value === opt.value
              ? 'border-brand-800 bg-brand-800 text-white'
              : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PropertyFilters({ filters, onChange, onReset }) {
  const districtOptions = DISTRICTS.map((d) => ({ value: d, label: LOCATIONS[d].label }));

  const cityOptions = (() => {
    const districts = filters.districts?.length ? filters.districts : DISTRICTS;
    const seen = new Map();
    districts.forEach((d) => getCities(d).forEach((c) => seen.set(`${c}-${d}`, { value: c, label: c, hint: d })));
    return [...seen.values()];
  })();

  const areaOptions = (() => {
    const districts = filters.districts?.length ? filters.districts : DISTRICTS;
    const cities = filters.cities?.length ? filters.cities : null;
    const seen = new Map();
    districts.forEach((d) => {
      Object.entries(LOCATIONS[d].cities).forEach(([city, areas]) => {
        if (cities && !cities.includes(city)) return;
        areas.forEach((a) => seen.set(a, { value: a, label: a, hint: city }));
      });
    });
    return [...seen.values()];
  })();

  const set = (patch) => onChange({ ...patch, page: 1 });

  return (
    <div className="rounded-2xl border border-line bg-white p-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:thin-scrollbar">
      {/* Sticky on desktop so "Reset all" stays reachable while the panel scrolls. */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-line bg-white pb-4 lg:sticky lg:top-0 lg:z-10 lg:-mx-5 lg:-mt-5 lg:px-5 lg:pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Icon name="filter" className="h-4.5 w-4.5 text-brand-700" />
          Filters
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-red-600"
        >
          <Icon name="refresh" className="h-3.5 w-3.5" />
          Reset all
        </button>
      </div>

      <Section title="Property type">
        <ul className="space-y-2">
          {PROPERTY_TYPES.map((type) => {
            const active = filters.types?.includes(type.value);
            return (
              <li key={type.value}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      set({ types: active ? filters.types.filter((t) => t !== type.value) : [...(filters.types || []), type.value] })
                    }
                    className="h-4 w-4 rounded border-line accent-brand-700"
                  />
                  <span className={active ? 'font-medium text-brand-800' : ''}>{type.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Location">
        <div className="space-y-2.5">
          <MultiSelect label="District" options={districtOptions} selected={filters.districts || []} onChange={(v) => set({ districts: v, cities: [], areas: [] })} />
          <MultiSelect label="City / Town" options={cityOptions} selected={filters.cities || []} onChange={(v) => set({ cities: v, areas: [] })} searchable />
          <MultiSelect label="Area / Locality" options={areaOptions} selected={filters.areas || []} onChange={(v) => set({ areas: v })} searchable />
        </div>
      </Section>

      <Section title="Price range (per month)">
        <div className="grid grid-cols-2 gap-2.5">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Min</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={filters.minPrice ?? ''}
              onChange={(e) => set({ minPrice: e.target.value })}
              placeholder="0"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Max</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={filters.maxPrice ?? ''}
              onChange={(e) => set({ maxPrice: e.target.value })}
              placeholder="Any"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRICE_RANGES.slice(1).map((range) => {
            const active = String(filters.minPrice) === String(range.min) && String(filters.maxPrice) === (range.max === Infinity ? '' : String(range.max));
            return (
              <button
                key={range.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  set({
                    minPrice: range.min || '',
                    maxPrice: range.max === Infinity ? '' : range.max,
                  })
                }
                className={cn(
                  'min-h-10 rounded-full border px-3 py-1 text-xs font-medium transition',
                  active ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-line text-slate-500 hover:border-brand-300'
                )}
              >
                {range.label.replace('Rs ', '')}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Bedrooms">
        <Segment
          options={[
            { value: 0, label: 'Any' },
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' },
          ]}
          value={filters.bedrooms || 0}
          onChange={(v) => set({ bedrooms: v })}
        />
      </Section>

      <Section title="Bathrooms">
        <Segment
          options={[
            { value: 0, label: 'Any' },
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
          ]}
          value={filters.bathrooms || 0}
          onChange={(v) => set({ bathrooms: v })}
        />
      </Section>

      <Section title="Furnishing">
        <Segment
          options={[
            { value: '', label: 'Any' },
            { value: 'furnished', label: 'Furnished' },
            { value: 'unfurnished', label: 'Unfurnished' },
          ]}
          value={filters.furnished || ''}
          onChange={(v) => set({ furnished: v })}
        />
      </Section>

      <Section title="Availability">
        <label className="block">
          <span className="mb-1.5 block text-xs text-slate-500">Available on or before</span>
          <input
            type="date"
            value={filters.availability || ''}
            onChange={(e) => set({ availability: e.target.value })}
            className="h-10 w-full rounded-xl border border-line px-3 text-sm text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </label>
      </Section>

      <Section title="Trust">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(e) => set({ verifiedOnly: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-line accent-brand-700"
          />
          <span className="text-sm text-slate-600">
            <span className="block font-medium text-slate-800">Verified owners only</span>
            <span className="block text-xs text-slate-500">Listings from identity-verified owners</span>
          </span>
        </label>
      </Section>

      <div className="mt-5 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-600">Need something specific?</p>
        <p className="mt-1">Refine by district, city and locality — for example Jutial, Karimabad or Sadpara.</p>
      </div>
    </div>
  );
}

/** Chips summarising active filters. */
export function FilterChips({ filters, onChange }) {
  const chips = [];
  const push = (label, patch) => chips.push({ label, patch });

  (filters.types || []).forEach((t) => push(PROPERTY_TYPES.find((p) => p.value === t)?.label || t, { types: filters.types.filter((x) => x !== t) }));
  (filters.districts || []).forEach((d) => push(d, { districts: filters.districts.filter((x) => x !== d) }));
  (filters.cities || []).forEach((c) => push(c, { cities: filters.cities.filter((x) => x !== c) }));
  (filters.areas || []).forEach((a) => push(a, { areas: filters.areas.filter((x) => x !== a) }));
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? formatPrice(filters.minPrice) : 'Any';
    const max = filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any';
    push(`${min} – ${max}`, { minPrice: '', maxPrice: '' });
  }
  if (filters.bedrooms) push(`${filters.bedrooms}+ beds`, { bedrooms: 0 });
  if (filters.bathrooms) push(`${filters.bathrooms}+ baths`, { bathrooms: 0 });
  if (filters.furnished) push(filters.furnished === 'furnished' ? 'Furnished' : 'Unfurnished', { furnished: '' });
  if (filters.availability) push(`Available by ${filters.availability}`, { availability: '' });
  if (filters.verifiedOnly) push('Verified owner', { verifiedOnly: false });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          aria-label={`Remove filter: ${chip.label}`}
          onClick={() => onChange({ ...chip.patch, page: 1 })}
          className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 py-1.5 pr-2.5 pl-3 text-xs font-medium text-brand-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          {chip.label}
          <Icon name="x" className="h-3.5 w-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({
            types: [],
            districts: [],
            cities: [],
            areas: [],
            minPrice: '',
            maxPrice: '',
            bedrooms: 0,
            bathrooms: 0,
            furnished: '',
            availability: '',
            verifiedOnly: false,
            page: 1,
          })
        }
        className="inline-flex min-h-10 items-center text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-red-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
