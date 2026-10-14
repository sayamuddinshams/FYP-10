import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input, { Select } from '../../components/common/Input';
import Icon from '../../components/common/icons';
import PropertyCard from '../../components/property/PropertyCard';
import PageHeader from '../../components/dashboard/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { PropertyGridSkeleton } from '../../components/common/Skeleton';
import { PageLoader } from '../../components/common/Spinner';
import { PROPERTY_TYPES } from '../../utils/constants';
import { useAsync, useDebounce, useDocumentTitle, useStoreVersion } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import propertyService from '../../services/propertyService';

export default function Saved() {
  useDocumentTitle('Saved Properties');
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.id;

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const version = useStoreVersion();
  const lastVersion = useRef(version);

  const { data, loading, error, reload } = useAsync(() => propertyService.getFavorites(uid), [uid], {
    immediate: Boolean(uid),
  });

  // Re-fetch whenever the store changes (e.g. a favourite was toggled elsewhere).
  useEffect(() => {
    if (lastVersion.current === version) return;
    lastVersion.current = version;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const favorites = data || [];

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let items = favorites;
    if (type) items = items.filter((p) => p.type === type);
    if (q) {
      items = items.filter((p) => `${[p.title, p.area, p.city, p.district].join(' ')}`.toLowerCase().includes(q));
    }
    return items;
  }, [favorites, debouncedQuery, type]);

  const hasFilters = Boolean(query.trim() || type);

  function clearFilters() {
    setQuery('');
    setType('');
  }

  if (!user) return <PageLoader label="Loading your saved properties…" />;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Saved Properties"
        subtitle={
          error
            ? 'Your shortlist of properties you want to revisit.'
            : loading && !data
              ? 'Loading your shortlist…'
              : `You have ${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}.`
        }
      />

      {error && <ErrorState message={error} onRetry={reload} />}

      {!error && favorites.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              aria-label="Search saved properties"
              placeholder="Search by title or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputClassName="pl-10"
            />
          </div>
          <Select
            aria-label="Filter by property type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="sm:w-56 sm:shrink-0"
            placeholder="All property types"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      )}

      {!error && hasFilters && favorites.length > 0 && (
        <p className="mb-4 text-xs text-slate-500" aria-live="polite">
          Showing {filtered.length} of {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}.
        </p>
      )}

      {!error &&
        (loading && !data ? (
          <PropertyGridSkeleton count={6} />
        ) : favorites.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon="bookmark"
            title="You haven't saved any properties yet."
            message="Tap the heart on any listing to keep it here and compare it later."
            actionLabel="Browse Properties"
            onAction={() => navigate('/browse')}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon="search"
            title="No properties match your search."
            message="Try a different title, location or property type."
            secondaryLabel="Clear filters"
            onSecondary={clearFilters}
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ))}
    </div>
  );
}