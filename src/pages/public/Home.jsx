import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import propertyService from '../../services/propertyService';
import { PROPERTY_TYPES } from '../../utils/constants';
import { POPULAR_LOCATIONS, searchLocations } from '../../data/locations';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Reveal from '../../components/common/Reveal';
import PropertyCard from '../../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../../components/common/Skeleton';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80';
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80';

const TYPE_ICONS = {
  house: 'home',
  apartment: 'building',
  room: 'key',
  hostel: 'users',
  office: 'briefcase',
  commercial: 'tag',
};

const POPULAR_SEARCHES = ['Gilgit', 'Hunza', 'Skardu', 'Karimabad', 'Jutial'];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: 'search',
    title: 'Search smartly',
    text: 'Filter by district, city, property type and budget to shortlist places that actually fit your life.',
  },
  {
    step: '02',
    icon: 'shield',
    title: 'Verify the details',
    text: 'Every listing shows verified badges, real photos, amenities and reviews from previous tenants.',
  },
  {
    step: '03',
    icon: 'calendar',
    title: 'Request a visit',
    text: 'Pick a date and time that suits you. The owner confirms and you get reminders before you go.',
  },
  {
    step: '04',
    icon: 'key',
    title: 'Move in with confidence',
    text: 'Agree terms directly with the owner, pay the security deposit and sign a clear rental agreement.',
  },
];

const TRUST_POINTS = [
  {
    icon: 'shield',
    title: 'Verified listings only',
    text: 'Our moderation team reviews every property before it goes live, so what you see is what exists.',
  },
  {
    icon: 'users',
    title: 'Real people, real profiles',
    text: 'Tenants, owners and agencies have traceable profiles with history you can check before you commit.',
  },
  {
    icon: 'pin',
    title: 'Built for Gilgit-Baltistan',
    text: 'From Hunza winters to Skardu summers, our data understands local rent ranges and neighbourhoods.',
  },
  {
    icon: 'chat',
    title: 'Direct communication',
    text: 'Message owners, schedule visits and keep every conversation in one organised inbox.',
  },
];

function LocationSearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => (query.trim() ? searchLocations(query, 6) : []), [query]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (type) params.set('type', type);
    if (budget) params.set('price', budget);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-white/60 bg-white/97 p-3 shadow-pop backdrop-blur-xl sm:p-4">
      <form onSubmit={submit}>
        <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-brand-400" />
              <input
                type="search"
                aria-label="Location"
                placeholder="Search location — try Jut, Kari, Sad, Gulm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 180)}
                className="h-11 w-full rounded-xl border border-line bg-slate-50/70 pr-3.5 pl-10 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </div>
            {focused && matches.length > 0 && (
              <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-white shadow-pop">
                {matches.map((m) => (
                  <li key={`${m.kind}-${m.label}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-ink transition hover:bg-brand-50 hover:text-brand-800"
                      onMouseDown={() => {
                        setQuery(m.area || m.city || m.district);
                        setFocused(false);
                      }}
                    >
                      <span className="flex items-center gap-2 truncate font-medium">
                        <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                        {m.label}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{m.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <select
            aria-label="Property type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-line bg-slate-50/70 px-3.5 text-sm text-slate-700 transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">Any property type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            aria-label="Monthly budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-line bg-slate-50/70 px-3.5 text-sm text-slate-700 transition-all duration-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">Any budget</option>
            <option value="0-20000">Under Rs 20,000</option>
            <option value="20000-40000">Rs 20,000 – 40,000</option>
            <option value="40000-70000">Rs 40,000 – 70,000</option>
            <option value="70000-9999999">Rs 70,000+</option>
          </select>
          <Button type="submit" size="lg" className="sm:px-8">
            <Icon name="search" className="h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 pb-1">
        <span className="text-xs font-medium text-slate-400">Popular:</span>
        {POPULAR_SEARCHES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => navigate(`/browse?q=${encodeURIComponent(name)}`)}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-all duration-200 hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ kicker, title, description, action, align = 'left' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-5 ${align === 'center' ? 'text-center' : ''}`}>
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {kicker && (
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-primary uppercase">
            <span className="h-px w-8 bg-gradient-to-r from-primary-600 to-primary-300" />
            {kicker}
          </span>
        )}
        <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-base leading-relaxed text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  useDocumentTitle('Find a place that feels like home');

  const { data: featured, loading } = useAsync(() => propertyService.getFeatured(6), []);
  const { data: stats } = useAsync(() => propertyService.stats(), []);

  const s = stats || { total: 0, districts: 0, verifiedOwners: 0, visits: 0, byType: {} };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        {/* Background image with slow ken-burns motion */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full animate-ken-burns object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,26,48,.96)_0%,rgba(11,26,48,.82)_40%,rgba(18,41,74,.55)_75%,rgba(46,74,125,.45)_100%)]" />
        <div aria-hidden="true" className="bg-hero-pattern absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="bg-grid-lines absolute inset-0" />
        {/* Ambient glow orbs */}
        <div aria-hidden="true" className="absolute -top-32 -left-24 h-96 w-96 animate-float-slow rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute right-0 bottom-0 h-80 w-80 animate-float rounded-full bg-primary-400/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/85 shadow-soft backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Icon name="pin" className="h-3.5 w-3.5" />
              Gilgit-Baltistan, Pakistan
            </span>
            <h1 className="mt-7 font-display text-[2.75rem] leading-[1.06] font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem]">
              Find a place that{' '}
              <span className="relative inline-block">
                <span className="text-gradient-light italic">feels like home</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand-400/70"
                >
                  <path
                    d="M2 9 C 60 2, 150 2, 218 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Discover houses, apartments, rooms, hostels, offices and commercial spaces across
              Gilgit-Baltistan.
            </p>
          </div>

          <div className="mt-10 animate-fade-up [animation-delay:120ms]">
            <LocationSearchBox />
          </div>

          {/* Stats strip */}
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 sm:grid-cols-4">
            {[
              { label: 'Live listings', value: s.total, icon: 'building' },
              { label: 'Districts covered', value: s.districts, icon: 'pin' },
              { label: 'Verified owners', value: s.verifiedOwners, icon: 'shield' },
              { label: 'Visits scheduled', value: s.visits, icon: 'calendar' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-200 ring-1 ring-white/15">
                  <Icon name={stat.icon} className="h-4 w-4" />
                </span>
                <div>
                  <dd className="text-3xl leading-none font-bold tracking-tight text-white tabular-nums">
                    {stat.value}
                  </dd>
                  <dt className="mt-1.5 text-[11px] font-semibold tracking-wider text-white/55 uppercase">
                    {stat.label}
                  </dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Soft fade into next section */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Featured properties */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-10 lg:pb-20">
        <Reveal>
          <SectionHeading
            kicker="Handpicked for you"
            title="Featured properties"
            description="Recently verified listings from trusted owners across the region."
            action={
              <Button as={Link} to="/browse" variant="outline" size="md">
                Browse all properties
                <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <PropertyGridSkeleton count={6} />}
          {!loading &&
            (featured || []).map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
        </div>
      </section>

      {/* Property types */}
      <section className="relative border-y border-line bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_0%,rgba(46,74,125,.06),transparent_70%)]"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              align="center"
              kicker="Browse by type"
              title="Whatever you are looking for, it starts here"
              description="Six property categories, one trusted marketplace."
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PROPERTY_TYPES.map((t, i) => (
              <Reveal key={t.value} delay={i * 60}>
                <Link
                  to={`/browse?type=${t.value}`}
                  className="group relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,transparent)] transition-all duration-300 group-hover:bg-[linear-gradient(90deg,#2e4a7d,#4b74b4)]"
                  />
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#f1f5fb,#e2eaf6)] text-primary shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[linear-gradient(140deg,#2e4a7d,#4b74b4)] group-hover:text-white group-hover:shadow-lift">
                    <Icon name={TYPE_ICONS[t.value]} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-ink transition-colors group-hover:text-brand-800">
                    {t.label}
                  </span>
                  <span className="text-xs text-slate-500">{s.byType[t.value] || 0} listings</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular locations */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Explore the region"
            title="Popular locations"
            description="The places people search for most, from Gilgit to Ghanche."
            action={
              <Button as={Link} to="/browse" variant="link">
                View all locations
                <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {POPULAR_LOCATIONS.map((loc, i) => (
            <Reveal key={loc.name} delay={i * 50}>
              <Link
                to={`/browse?location=${encodeURIComponent(loc.name)}`}
                className="group relative flex h-44 items-end overflow-hidden rounded-2xl border border-line shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:h-48"
              >
                <img
                  src={loc.image}
                  alt={`${loc.name}, ${loc.district}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,48,.05)_20%,rgba(11,26,48,.82)_100%)]" />
                <div className="absolute inset-x-0 top-0 flex justify-end p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-soft">
                    <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="relative w-full p-4">
                  <p className="font-display text-lg font-semibold text-white">{loc.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
                    <Icon name="pin" className="h-3 w-3" />
                    {loc.district} · {loc.listings} listings
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_20%_20%,rgba(75,116,180,.3),transparent_65%),radial-gradient(ellipse_45%_50%_at_85%_85%,rgba(46,74,125,.35),transparent_70%)]"
        />
        <div aria-hidden="true" className="bg-grid-lines absolute inset-0 opacity-60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-brand-300 uppercase">
                <span className="h-px w-8 bg-gradient-to-r from-brand-300 to-transparent" />
                Simple and transparent
              </span>
              <h2 className="mt-3 font-display text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
                How <span className="italic text-brand-300">RentLink</span> works
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65">
                Four steps between you and the right place — no brokers, no guesswork.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-14">
            {/* Connecting line on large screens */}
            <div
              aria-hidden="true"
              className="absolute top-10 right-[12%] left-[12%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(157,184,222,.4)_15%,rgba(157,184,222,.4)_85%,transparent)] lg:block"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step, i) => (
                <Reveal key={step.step} delay={i * 90}>
                  <div className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.07] hover:shadow-pop">
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#2e4a7d,#4b74b4)] text-white shadow-[0_8px_20px_-8px_rgba(46,74,125,.8)] transition-transform duration-300 group-hover:-translate-y-0.5">
                        <Icon name={step.icon} className="h-5 w-5" />
                      </span>
                      <span className="font-display text-4xl font-semibold text-white/10 transition-colors duration-300 group-hover:text-brand-300/30">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-primary uppercase">
                <span className="h-px w-8 bg-gradient-to-r from-primary-600 to-primary-300" />
                Why RentLink
              </span>
              <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-ink sm:text-4xl lg:text-5xl">
                A marketplace built on <span className="text-gradient-dark italic">trust</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
                Renting should not feel like a gamble. We built RentLink so every listing, owner and
                visit carries a history you can rely on.
              </p>
              <div className="mt-7">
                <Button as={Link} to="/about" size="lg">
                  Learn more about us
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {TRUST_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 70}>
                <div className="group h-full rounded-2xl border border-line bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#f1f5fb,#e2eaf6)] text-primary shadow-soft transition-all duration-300 group-hover:bg-[linear-gradient(140deg,#2e4a7d,#4b74b4)] group-hover:text-white group-hover:shadow-lift">
                    <Icon name={point.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold text-ink">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{point.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl shadow-pop">
            <img
              src={CTA_IMAGE}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,26,48,.94)_0%,rgba(18,41,74,.85)_45%,rgba(46,74,125,.6)_100%)]" />
            <div aria-hidden="true" className="bg-grid-lines absolute inset-0 opacity-50" />
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 h-64 w-64 animate-float-slow rounded-full bg-brand-400/20 blur-3xl"
            />

            <div className="relative px-6 py-16 text-center sm:px-14 lg:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/85 backdrop-blur-md">
                <Icon name="spark" className="h-3.5 w-3.5 text-amber-300" />
                Hundreds of verified properties
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
                Ready to find your <span className="italic text-brand-200">next home?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75">
                Browse hundreds of verified properties across Gilgit-Baltistan, or list your own and
                reach thousands of serious renters.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button as={Link} to="/browse" size="lg" className="min-w-48">
                  <Icon name="search" className="h-4 w-4" />
                  Browse properties
                </Button>
                <Button
                  as={Link}
                  to="/about"
                  size="lg"
                  variant="ghost"
                  className="min-w-48 border border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                >
                  Learn how it works
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
