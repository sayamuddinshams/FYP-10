import { Link } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import propertyService from '../../services/propertyService';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import { ErrorState } from '../../components/common/Feedback';
import PublicPageHero from '../../components/public/PublicPageHero';

const TIMELINE = [
  {
    year: '2023',
    title: 'A handwritten ledger in Jutial',
    text: 'Zahid kept a physical diary of houses his relatives and peers were seeking in Gilgit, alongside owners who had vacant rooms. Within four weeks, hundreds of families asked to be added to that ledger.',
    tone: 'bg-amber-500',
  },
  {
    year: '2024',
    title: 'The Karakoram Winter Rush',
    text: 'Seasonal workers and returning professionals overwhelmed traditional phone networks across Hunza and Skardu. We built an emergency shared digital catalog that successfully housed 120 families.',
    tone: 'bg-amber-600',
  },
  {
    year: '2025',
    title: 'Architecting the RentLink Portal',
    text: 'Designed full 10-district location mappings, verified identity checks, and an on-platform visit booking system backed by human moderation liaisons in every valley.',
    tone: 'bg-emerald-600',
  },
  {
    year: '2026',
    title: 'Ten Northern Districts, One Trusted Sanctuary',
    text: 'RentLink operates seamlessly across Gilgit, Hunza, Skardu, Nagar, Ghizer, Astore, Diamer, Shigar, Kharmang and Ghanche with transparent 5% platform leases and zero hidden commissions.',
    tone: 'bg-[#0B1320]',
  },
];

const PRINCIPLES = [
  {
    icon: 'list',
    title: 'Deliberate review, instantaneous search',
    text: 'We invest human time screening deed records and landlord credentials so your search in the mountains is instant, reliable, and verified.',
  },
  {
    icon: 'users',
    title: 'Crafted for independent homeowners',
    text: 'Most properties in Gilgit-Baltistan belong to multigenerational families. Our tools are built for them, not corporate real estate conglomerates.',
  },
  {
    icon: 'flag',
    title: 'Transparent collaborative corrections',
    text: 'If a listing detail needs refinement, our liaisons work with the owner directly. We provide clear constructive guidance rather than silent rejections.',
  },
];

const MILESTONE_FALLBACK = { total: 0, districts: 0, types: 0 };

export default function Story() {
  useDocumentTitle('Our Story — From a Jutial Ledger to 10 Districts');
  const { data: stats, loading: statsLoading, error: statsError, reload: reloadStats } = useAsync(
    () => propertyService.stats(),
    []
  );
  const s = stats || MILESTONE_FALLBACK;

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <PublicPageHero
        eyebrow="The RentLink Journey"
        title="Built from a notebook, a phone, and freezing winter evenings in Jutial."
        description="RentLink did not begin in a corporate incubator. It grew out of mutual aid between families in Gilgit-Baltistan facing housing shortages."
        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80"
      />

      {/* Timeline Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Chronicle</span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            How RentLink came to life
          </h2>
        </div>

        <ol className="relative space-y-10">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-slate-200 sm:left-1/2 sm:-translate-x-1/2" />
          {TIMELINE.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
              <li
                key={item.year}
                className={`relative flex flex-col gap-4 sm:gap-12 ${flipped ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-6 left-2.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow-md ring-4 ring-amber-100 sm:left-1/2 sm:-translate-x-1/2"
                />
                <div className={`flex-1 pl-10 sm:pl-0 ${flipped ? 'sm:text-left' : 'sm:text-right'}`}>
                  <span className={`inline-block rounded-full ${item.tone} px-4 py-1 text-xs font-bold tracking-wider text-white shadow-xs`}>
                    {item.year}
                  </span>
                </div>
                <div className="flex-1 pl-10 sm:pl-0">
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
                    <h3 className="font-serif text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Live Marketplace Milestones */}
      <section className="border-y border-slate-200/80 bg-white py-16" aria-live="polite">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {statsError ? (
            <ErrorState
              compact
              message="Marketplace stats could not be loaded right now."
              onRetry={reloadStats}
            />
          ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {[
                { value: s.total, label: 'Live verified sanctuaries' },
                { value: s.districts, label: 'Districts actively hosted' },
                { value: s.types, label: 'Architectural categories' },
              ].map((m) => (
                <div key={m.label} className="text-center p-6 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  {statsLoading ? (
                    <span
                      aria-hidden="true"
                      className="mx-auto block h-9 w-24 animate-pulse rounded-lg bg-slate-200"
                    />
                  ) : (
                    <p className="font-serif text-4xl sm:text-5xl font-bold text-amber-600 tabular-nums">
                      {m.value}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-bold tracking-wide uppercase text-slate-500">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guiding Principles */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Convictions</span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Three principles we refuse to compromise
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1320] text-amber-400">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-lg font-bold text-slate-900">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Quote */}
      <section className="border-y border-slate-800 bg-[#0B1320] text-white py-20">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <figure>
            <span className="material-symbols-outlined text-4xl text-amber-400 mb-4 inline-block">format_quote</span>
            <blockquote className="font-serif text-2xl sm:text-3xl leading-relaxed font-normal text-slate-100">
              “A rental listing is a promise made across mountains. It must describe an authentic place,
              at an honest rate, that someone is genuinely prepared to welcome you into this week.”
            </blockquote>
            <figcaption className="mt-8 flex flex-col items-center gap-1">
              <span className="text-sm font-bold tracking-wider text-amber-400 uppercase">Zahid Karim</span>
              <span className="text-xs text-slate-400">Founder &amp; Regional Steward, RentLink Northern Pakistan</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center max-w-xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Be part of the next chapter
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            Whether you are relocating to Gilgit for medical or educational assignments, or opening your family home in Skardu,
            we invite you to experience rental living designed with mountain dignity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button as={Link} to="/browse" size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
              Explore Available Sanctuaries
            </Button>
            <Button as={Link} to="/collaborations" size="lg" variant="outline" className="rounded-full">
              Institutional Partnerships
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
