import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import advertisementService from '../../services/advertisementService';
import { formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const FILTERS = [
  { value: 'all', label: 'All campaigns' },
  { value: 'active', label: 'Live now' },
  { value: 'location', label: 'By location' },
  { value: 'property_type', label: 'By property type' },
];

function statusBadge(status) {
  if (status === 'active') return <Badge tone="success">Live</Badge>;
  if (status === 'scheduled') return <Badge tone="info">Scheduled</Badge>;
  return <Badge tone="neutral">Paused</Badge>;
}

export default function Advertisements() {
  useDocumentTitle('Advertisements');

  const { data, loading, error, reload } = useAsync(() => advertisementService.listAll(), []);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const ads = useMemo(() => {
    const items = data || [];
    if (filter === 'all') return items;
    if (filter === 'active') return items.filter((a) => a.status === 'active');
    return items.filter((a) => a.targetType === filter);
  }, [data, filter]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Advertisements</p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                Campaigns running across RentLink
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/70">
                Promotions from owners, agencies and our own platform team. Every campaign targets a real
                district or property type — never generic banner noise.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold">Want to promote a listing?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Approved owners can promote a property to the top of its district results. Placement fees
                are shown before you confirm anything.
              </p>
              <Link to="/owner/dashboard" className="mt-4 inline-block">
                <Button className="bg-white text-brand-900 hover:bg-brand-50">Promote a property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="sr-only">Advertising campaigns</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar" role="group" aria-label="Filter campaigns">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filter === f.value
                    ? 'border-brand-800 bg-brand-800 text-white'
                    : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!loading && !error && (
            <p className="text-sm text-slate-500" aria-live="polite">
              {ads.length} {ads.length === 1 ? 'campaign' : 'campaigns'}
            </p>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="h-44 animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}

        {!loading && !error && ads.length === 0 && (
          <div className="mt-8 rounded-2xl border border-line bg-white">
            <EmptyState
              icon="megaphone"
              title="No campaigns in this category"
              message="Campaigns rotate through the year — check back soon, or browse live listings instead."
              actionLabel="Browse properties"
              onAction={() => navigate('/browse')}
            />
          </div>
        )}

        {!loading && !error && ads.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad, i) => {
              const expired = ad.end < new Date().toISOString().slice(0, 10);
              return (
                <article
                  key={ad.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={ad.image}
                      alt={ad.title}
                      className="transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {statusBadge(ad.status)}
                      {expired && ad.status === 'active' && <Badge tone="warning">Ended</Badge>}
                    </div>
                    <span className="absolute right-3 bottom-3 rounded-md bg-slate-950/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {ad.targetType === 'location'
                        ? `Targeting ${ad.target}`
                        : ad.targetType === 'property_type'
                          ? `${ad.target} listings`
                          : 'All of Gilgit-Baltistan'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base leading-snug font-semibold text-ink">{ad.title}</h3>
                      <Icon name="megaphone" className="h-5 w-5 shrink-0 text-slate-400" />
                    </div>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{ad.description}</p>

                    <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5">
                          <Icon name="user" className="h-3.5 w-3.5" />
                          {ad.owner}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="calendar" className="h-3.5 w-3.5" />
                          {formatDate(ad.start)} – {formatDate(ad.end)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Icon name="eye" className="h-3.5 w-3.5" />
                          {ad.impressions.toLocaleString()} impressions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="chart" className="h-3.5 w-3.5" />
                          {ad.clicks.toLocaleString()} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Advertising info */}
        <section className="mt-14 grid gap-6 rounded-3xl border border-line bg-surface p-8 sm:p-10 lg:grid-cols-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              How advertising works here
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We keep promotion honest: campaigns are labelled, budgets are visible and no advertisement
              can impersonate an organic listing.
            </p>
          </div>
          {[
            ['tag', 'Always labelled', 'Promoted content carries a clear badge so renters know what they are looking at.'],
            ['filter', 'Precise targeting', 'Campaigns are scoped to a district or a property type — never sprayed everywhere.'],
            ['chart', 'Reported numbers', 'Impressions and clicks are shown to advertisers directly inside their dashboard.'],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-primary">
                <Icon name={icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
