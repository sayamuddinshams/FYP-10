import { useId, useState } from 'react';
import Icon, { MaterialIcon } from '../common/icons';
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
    <section className="border-b border-slate-100 py-5 first:pt-0 last:border-0 last:pb-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left transition hover:text-[#0B1320] cursor-pointer"
        >
          <span className="text-xs font-bold tracking-wider text-slate-800 uppercase">{title}</span>
          <MaterialIcon
            className={cn('text-[18px] text-slate-400 transition-transform duration-200', open ? '' : '-rotate-90')}
          >
            expand_more
          </MaterialIcon>
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
            'min-h-9 min-w-10 rounded-xl border px-3 py-1 text-xs font-bold transition-all cursor-pointer',
            value === opt.value
              ? 'border-[#0B1320] bg-[#0B1320] text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 hover:border-[#D97706] hover:text-[#0B1320]'
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
    <div className="w-full">
      <Section title="Property Type">
        <MultiSelect
          options={PROPERTY_TYPES}
          value={filters.types || []}
          onChange={(types) => set({ types })}
          placeholder="Filter by property types"
        />
      </Section>

      <Section title="Districts in Gilgit-Baltistan">
        <MultiSelect
          options={districtOptions}
          value={filters.districts || []}
          onChange={(districts) => set({ districts, cities: [], areas: [] })}
          placeholder="Select districts"
        />
      </Section>

      <Section title="City / Town">
        <MultiSelect
          options={cityOptions}
          value={filters.cities || []}
          onChange={(cities) => set({ cities, areas: [] })}
          placeholder="Select cities or towns"
        />
      </Section>

      <Section title="Area / Locality">
        <MultiSelect
          options={areaOptions}
          value={filters.areas || []}
          onChange={(areas) => set({ areas })}
          placeholder="Select areas or bazaars"
        />
      </Section>

      <Section title="Monthly Budget (PKR)">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const active =
              (filters.minPrice || 0) === range.min &&
              (filters.maxPrice ? Number(filters.maxPrice) : Infinity) === range.max;
            return (
              <label key={range.label} className="flex cursor-pointer items-center justify-between py-1 text-sm">
                <span className={cn('text-xs font-semibold', active ? 'text-[#D97706]' : 'text-slate-700')}>{range.label}</span>
                <input
                  type="radio"
                  name="priceRange"
                  checked={active}
                  onChange={() =>
                    set({
                      minPrice: range.min === 0 ? '' : String(range.min),
                      maxPrice: range.max === Infinity ? '' : String(range.max),
                    })
                  }
                  className="h-4 w-4 border-slate-300 text-[#D97706] accent-[#D97706] focus:ring-[#D97706]/20"
                />
              </label>
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
          onChange={(bedrooms) => set({ bedrooms })}
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
          onChange={(bathrooms) => set({ bathrooms })}
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
          onChange={(furnished) => set({ furnished })}
        />
      </Section>

      <Section title="Available by Date">
        <label className="block">
          <input
            type="date"
            value={filters.availability || ''}
            onChange={(e) => set({ availability: e.target.value })}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none"
          />
        </label>
      </Section>

      <Section title="Trust & Moderation">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(e) => set({ verifiedOnly: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#D97706] text-[#D97706]"
          />
          <span className="text-xs text-slate-600">
            <span className="block font-bold text-slate-800">Verified owners only</span>
            <span className="block text-[11px] text-slate-500">Listings from identity-verified owners</span>
          </span>
        </label>
      </Section>

      <div className="mt-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4 text-xs leading-relaxed text-[#904D00]">
        <p className="font-bold">Need something specific?</p>
        <p className="mt-1 text-[11px]">Filter by district, city, and locality across Gilgit, Hunza, Skardu, and beyond.</p>
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
          className="group inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/70 py-1 pr-2.5 pl-3 text-xs font-bold text-[#904D00] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          {chip.label}
          <MaterialIcon className="text-[14px]">close</MaterialIcon>
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
        className="inline-flex min-h-8 items-center text-xs font-bold text-slate-500 underline-offset-4 transition hover:text-red-600 hover:underline cursor-pointer"
      >
        Clear all filters
      </button>
    </div>
  );
}
