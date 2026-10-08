import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAsync, useDebounce, useDocumentTitle } from '../../hooks';
import propertyService from '../../services/propertyService';
import { SORT_OPTIONS, PROPERTY_TYPES } from '../../utils/constants';
import { DISTRICTS, LOCATIONS } from '../../data/locations';
import { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { PropertyCardSkeleton } from '../../components/common/Skeleton';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyFilters, { FilterChips } from '../../components/property/PropertyFilters';
import FilterDrawer from '../../components/property/FilterDrawer';

const EMPTY_FILTERS = {
  q: '',
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
  sort: 'recommended',
  page: 1,
};

/** Read URL search params into a filter object. */
function fromParams(params) {
  const list = (key) => (params.get(key) ? params.get(key).split(',').filter(Boolean) : []);
  const location = params.get('location') || '';
  const locationMatch = location
    ? DISTRICTS.find((d) => d.toLowerCase() === location.toLowerCase()) ||
      Object.keys(LOCATIONS).find((d) => d.toLowerCase() === location.toLowerCase())
    : '';
  return {
    ...EMPTY_FILTERS,
    q: params.get('q') || '',
    types: list('type'),
    districts: locationMatch ? [locationMatch] : list('districts'),
    cities: list('cities'),
    areas: list('areas'),
    minPrice: params.get('min') || '',
    maxPrice: params.get('max') || '',
    bedrooms: Number(params.get('bedrooms')) || 0,
    bathrooms: Number(params.get('bathrooms')) || 0,
    furnished: params.get('furnished') || '',
    availability: params.get('availability') || '',
    verifiedOnly: params.get('verified') === '1',
    sort: params.get('sort') || 'recommended',
    page: Number(params.get('page')) || 1,
  };
}

function toParams(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.types.length) params.set('type', filters.types.join(','));
  if (filters.districts.length) params.set('districts', filters.districts.join(','));
  if (filters.cities.length) params.set('cities', filters.cities.join(','));
  if (filters.areas.length) params.set('areas', filters.areas.join(','));
  if (filters.minPrice) params.set('min', filters.minPrice);
  if (filters.maxPrice) params.set('max', filters.maxPrice);
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
  if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
  if (filters.furnished) params.set('furnished', filters.furnished);
  if (filters.availability) params.set('availability', filters.availability);
  if (filters.verifiedOnly) params.set('verified', '1');
  if (filters.sort && filters.sort !== 'recommended') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', filters.page);
  return params;
}

export default function Browse() {
  useDocumentTitle('Browse Properties');

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => fromParams(searchParams));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [queryDraft, setQueryDraft] = useState(filters.q);
  const debouncedQuery = useDebounce(queryDraft, 400);

  // Keep local state in sync when the URL changes externally (back/forward, chip links).
  const paramsKey = searchParams.toString();
  useEffect(() => {
    const next = fromParams(new URLSearchParams(paramsKey));
    setFilters((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    setQueryDraft(next.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // Reflect filter changes back into the URL.
  const update = useCallback(
    (patch) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        setSearchParams(toParams(next), { replace: true });
        return next;
      });
    },
    [setSearchParams]
  );

  // Debounced free-text search.
  useEffect(() => {
    if (debouncedQuery === filters.q) return;
    update({ q: debouncedQuery, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const reset = useCallback(() => {
    setQueryDraft('');
    setSearchParams(new URLSearchParams(), { replace: true });
    setFilters({ ...EMPTY_FILTERS });
  }, [setSearchParams]);

  const query = useMemo(
    () => ({
      query: filters.q,
      types: filters.types,
      districts: filters.districts,
      cities: filters.cities,
      areas: filters.areas,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms || undefined,
      bathrooms: filters.bathrooms || undefined,
      furnished: filters.furnished || undefined,
      verifiedOnly: filters.verifiedOnly,
      sort: filters.sort,
      page: filters.page,
      limit: 12,
    }),
    [filters]
  );

  const { data, loading, error, reload } = useAsync(() => propertyService.list(query), [JSON.stringify(query)]);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;

  return (
    <div className="bg-surface">
      {/* Page head */}
      <div className="relative overflow-hidden border-b border-line bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_85%_0%,rgba(46,74,125,.07),transparent_65%),radial-gradient(ellipse_40%_70%_at_10%_100%,rgba(75,116,180,.05),transparent_60%)]"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
            <a href="/" className="transition hover:text-brand-700">Home</a>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-600">Browse Properties</span>
          </nav>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Browse properties</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {loading ? 'Searching listings…' : `${total} ${total === 1 ? 'listing' : 'listings'} available across Gilgit-Baltistan`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-brand-400" />
                <input
                  type="search"
                  value={queryDraft}
                  onChange={(e) => setQueryDraft(e.target.value)}
                  placeholder="Search title, area, description…"
                  aria-label="Search listings"
                  className="h-11 w-full rounded-xl border border-line bg-white pr-3.5 pl-10 text-sm text-slate-900 shadow-soft transition-all duration-200 placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100 focus:outline-none"
                />
              </div>

              <Button variant="outline" className="lg:hidden" onClick={() => setDrawerOpen(true)}>
                <Icon name="filter" className="h-4 w-4" />
                Filters
              </Button>

              <Select
                aria-label="Sort results"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value, page: 1 })}
                className="w-auto"
                selectClassName="w-44"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Active type quick tabs */}
          <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
            <button
              type="button"
              onClick={() => update({ types: [], page: 1 })}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                filters.types.length === 0
                  ? 'border-transparent bg-[linear-gradient(135deg,#283f67,#385c9a)] text-white shadow-soft'
                  : 'border-line bg-white text-slate-600 shadow-soft hover:-translate-y-px hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              All types
            </button>
            {PROPERTY_TYPES.map((t) => {
              const active = filters.types.includes(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    update({
                      types: active ? filters.types.filter((x) => x !== t.value) : [t.value],
                      page: 1,
                    })
                  }
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'border-transparent bg-[linear-gradient(135deg,#283f67,#385c9a)] text-white shadow-soft'
                      : 'border-line bg-white text-slate-600 shadow-soft hover:-translate-y-px hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <FilterChips filters={filters} onChange={update} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PropertyFilters filters={filters} onChange={update} onReset={reset} />
            </div>
          </aside>

          <div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-semibold text-red-700">Unable to load listings.</p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
                <Button variant="outline" className="mt-4" onClick={reload}>
                  Try again
                </Button>
              </div>
            )}

            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="rounded-xl border border-line bg-white">
                <EmptyState
                  icon="search"
                  title="No properties match your filters"
                  message="Try widening the price range, removing a location, or searching a different property type."
                  actionLabel="Reset filters"
                  onAction={reset}
                />
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((p, i) => (
                    <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}>
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>

                <Pagination
                  page={filters.page}
                  pages={pages}
                  onChange={(p) => {
                    update({ page: p });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-10"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={update}
        onReset={reset}
        resultCount={total}
      />
    </div>
  );
}
