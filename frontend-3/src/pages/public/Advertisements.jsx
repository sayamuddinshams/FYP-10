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
import CompanyCardsHero from '../../components/public/CompanyCardsHero';

const FILTERS = [
  { value: 'all', label: 'All campaigns' },
  { value: 'active', label: 'Live now' },
  { value: 'location', label: 'By mountain district' },
  { value: 'property_type', label: 'By architectural category' },
];

function statusBadge(status) {
  if (status === 'active') return <Badge tone="success">Live</Badge>;
  if (status === 'scheduled') return <Badge tone="amber">Scheduled</Badge>;
  return <Badge tone="neutral">Paused</Badge>;
}

export default function Advertisements() {
  useDocumentTitle('Campaigns & Featured Sanctuaries — RentLink');

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
    <div className="bg-[#F8FAFC]">
      {/* Contextual Logo Mosaic Hero Section */}
      <CompanyCardsHero
        eyebrow="Marketplace Partner & Advertising Network"
        title="Amplify your mountain brand across Northern Pakistan."
        subtitle="Showcase your sanctuaries, resorts, adventure expeditions, and local services directly to thousands of verified tenants, hosts, and travelers across Gilgit-Baltistan."
        accentColor="#4779ff"
      />

      {/* Main Campaign Grid Section */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="sr-only">Advertising campaigns</h2>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 thin-scrollbar" role="group" aria-label="Filter campaigns">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${filter === f.value
                    ? 'border-[#0B1320] bg-[#0B1320] text-amber-400 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!loading && !error && (
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase" aria-live="polite">
              {ads.length} {ads.length === 1 ? 'active campaign' : 'active campaigns'}
            </p>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
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
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white">
            <EmptyState
              icon="megaphone"
              title="No campaigns in this category"
              message="Campaigns rotate through the seasons. Check back soon, or browse live listings across GB."
              actionLabel="Browse properties"
              onAction={() => navigate('/browse')}
            />
          </div>
        )}

        {!loading && !error && ads.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => {
              const expired = ad.end < new Date().toISOString().slice(0, 10);
              return (
                <article
                  key={ad.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={ad.image}
                      alt={ad.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                      {statusBadge(ad.status)}
                      {expired && ad.status === 'active' && <Badge tone="warning">Concluded</Badge>}
                    </div>
                    <span className="absolute right-3.5 bottom-3.5 rounded-full bg-[#0B1320]/80 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-white/10">
                      {ad.targetType === 'location'
                        ? `District: ${ad.target}`
                        : ad.targetType === 'property_type'
                          ? `Type: ${ad.target}`
                          : 'Regional GB'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-lg font-bold leading-snug text-slate-900 group-hover:text-amber-700 transition-colors">
                        {ad.title}
                      </h3>
                      <Icon name="megaphone" className="h-5 w-5 shrink-0 text-amber-600" />
                    </div>

                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{ad.description}</p>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Icon name="user" className="h-3.5 w-3.5 text-slate-400" />
                          {ad.owner}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(ad.start)} – {formatDate(ad.end)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Advertising Guarantees Protocol */}
        <section className="mt-16 grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 lg:grid-cols-3 shadow-sm">
          <div className="lg:col-span-3 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Standard of Integrity</span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Honest promotion without deceptive clickbait
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-2xl">
              RentLink enforces strict advertisement ethics. Promoted listings must be verified residences with accurate photography and transparent price rates.
            </p>
          </div>
          {[
            ['tag', 'Unambiguously Labeled', 'Every sponsored card displays prominent featured badges so renters always distinguish promoted sanctuaries from organic searches.'],
            ['filter', 'Hyper-Local Mountain Scoping', 'Campaigns only target relevant mountain valleys and property categories, preventing irrelevant noise.'],
            ['chart', 'Verified Dashboard Analytics', 'Homeowners and agents receive authentic impression, click, and visit request metrics in their personal management portal.'],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1320] text-amber-400">
                <Icon name={icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
