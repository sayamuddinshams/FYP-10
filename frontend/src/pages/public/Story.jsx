import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Flame,
  ShieldCheck,
  MountainSnow,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAsync, useDocumentTitle } from '../../hooks';
import propertyService from '../../services/propertyService';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import { ErrorState } from '../../components/common/Feedback';
import PublicPageHero from '../../components/public/PublicPageHero';

const TIMELINE = [
  {
    year: '2023',
    chapter: 'Chapter I · Grassroots Ledger',
    title: 'A handwritten ledger in Jutial',
    text: 'Zahid kept a physical diary of houses his relatives and peers were seeking in Gilgit, alongside owners who had vacant rooms. Within four weeks, hundreds of families asked to be added to that ledger.',
    badge: '100+ handwritten requests',
    location: 'Jutial, Gilgit',
    icon: BookOpen,
    tone: 'bg-amber-500',
    accentColor: '#f59e0b',
  },
  {
    year: '2024',
    chapter: 'Chapter II · The Cold Rush',
    title: 'The Karakoram Winter Rush',
    text: 'Seasonal workers and returning professionals overwhelmed traditional phone networks across Hunza and Skardu. We built an emergency shared digital catalog that successfully housed 120 families.',
    badge: '120 families winter-housed',
    location: 'Hunza & Skardu Valleys',
    icon: Flame,
    tone: 'bg-amber-600',
    accentColor: '#d97706',
  },
  {
    year: '2025',
    chapter: 'Chapter III · Trust Architecture',
    title: 'Architecting the RentLink Portal',
    text: 'Designed full 10-district location mappings, verified identity checks, and an on-platform visit booking system backed by human moderation liaisons in every valley.',
    badge: '10 Regional Hubs mapped',
    location: 'Gilgit-Baltistan Network',
    icon: ShieldCheck,
    tone: 'bg-emerald-600',
    accentColor: '#059669',
  },
  {
    year: '2026',
    chapter: 'Chapter IV · The Living Network',
    title: 'Ten Northern Districts, One Trusted Sanctuary',
    text: 'RentLink operates seamlessly across Gilgit, Hunza, Skardu, Nagar, Ghizer, Astore, Diamer, Shigar, Kharmang and Ghanche with transparent 5% platform leases and zero hidden commissions.',
    badge: 'Zero broker exploitation',
    location: 'Across all 10 Mountain Districts',
    icon: MountainSnow,
    tone: 'bg-[#0B1320]',
    accentColor: '#3b82f6',
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
  const [selectedYear, setSelectedYear] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const { data: stats, loading: statsLoading, error: statsError, reload: reloadStats } = useAsync(
    () => propertyService.stats(),
    []
  );
  const s = stats || MILESTONE_FALLBACK;

  const filteredTimeline = selectedYear === 'all'
    ? TIMELINE
    : TIMELINE.filter((item) => item.year === selectedYear);

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
      <section className="relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28 overflow-hidden">
        {/* Soft Background Ambient Lighting */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-amber-500/5 blur-3xl" />

        {/* Section Header with Motion Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Chronicle</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            How RentLink came to life
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            The defining chapters that transformed an urgent local notebook into Northern Pakistan’s verified mountain rental network.
          </p>

          {/* Era Filter Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                selectedYear === 'all'
                  ? 'bg-[#0B1320] text-white shadow-md scale-105'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-slate-900'
              }`}
            >
              All Chapters
            </button>
            {TIMELINE.map((t) => (
              <button
                key={t.year}
                type="button"
                onClick={() => setSelectedYear(t.year)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                  selectedYear === t.year
                    ? 'bg-amber-600 text-white shadow-md scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-slate-900'
                }`}
              >
                <span>{t.year}</span>
                {selectedYear === t.year && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Animated Vertical Chronicle Track */}
        <div className="relative">
          {/* Base Track Line */}
          <div
            aria-hidden="true"
            className="absolute top-4 bottom-8 left-[18px] sm:left-1/2 sm:-translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-400 via-emerald-500/60 to-slate-200"
          />

          <ol className="relative space-y-12 sm:space-y-16">
            <AnimatePresence mode="popLayout">
              {filteredTimeline.map((item, i) => {
                const flipped = i % 2 === 1;
                const IconComponent = item.icon;
                const isHovered = hoveredCard === item.year;

                return (
                  <motion.li
                    key={item.year}
                    layout
                    initial={{ opacity: 0, y: 35, x: flipped ? 35 : -35 }}
                    whileInView={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                    className={`relative flex flex-col gap-5 sm:gap-14 ${flipped ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
                    onMouseEnter={() => setHoveredCard(item.year)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Animated Pulsing Milestone Center Node */}
                    <div className="absolute top-5 left-[19px] sm:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: isHovered ? [1, 1.25, 1.1] : [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border-2 border-slate-100"
                      >
                        {/* Glowing Ring */}
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
                          style={{ backgroundColor: item.accentColor }}
                        />
                        {/* Core Dot */}
                        <span
                          className="relative inline-flex rounded-full h-3.5 w-3.5 shadow-xs"
                          style={{ backgroundColor: item.accentColor }}
                        />
                      </motion.div>
                    </div>

                    {/* Left/Right Milestone Year Side Pill */}
                    <div className={`flex-1 pl-12 sm:pl-0 sm:pt-4 ${flipped ? 'sm:text-left sm:pr-8' : 'sm:text-right sm:pl-8'}`}>
                      <div className="inline-flex flex-col items-start sm:items-inherit">
                        <span
                          className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
                        >
                          {item.chapter}
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wider text-white shadow-md transition-transform duration-300 ${
                            isHovered ? 'scale-105' : ''
                          }`}
                          style={{ backgroundColor: item.accentColor }}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Story Card */}
                    <div className="flex-1 pl-12 sm:pl-0">
                      <motion.div
                        whileHover={{ y: -5, scale: 1.015 }}
                        transition={{ duration: 0.3 }}
                        className={`group relative rounded-3xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 ${
                          isHovered
                            ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                            : 'border-slate-200/90 hover:border-amber-300 hover:shadow-md'
                        }`}
                      >
                        {/* Top Contextual Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{item.location}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.badge}</span>
                          </span>
                        </div>

                        {/* Title with Lucide Icon */}
                        <div className="flex items-center gap-3 mt-1">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                            style={{ backgroundColor: item.accentColor }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        {/* Narrative Paragraph */}
                        <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
                          {item.text}
                        </p>

                        {/* Bottom Accent Highlight Sheen */}
                        <div
                          className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold"
                          style={{ color: item.accentColor }}
                        >
                          <span className="tracking-wide uppercase text-[10px]">RentLink Archive · Verified</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </div>
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
                    <p className="text-4xl sm:text-5xl font-bold text-amber-600 tabular-nums">
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
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Three principles we refuse to compromise
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1320] text-amber-400">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{p.title}</h3>
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
            <blockquote className="text-2xl sm:text-3xl leading-relaxed font-normal text-slate-100">
              “A rental listing is a promise made across mountains. It must describe an authentic place,
              at an honest rate, that someone is genuinely prepared to welcome you into this week.”
            </blockquote>
            <figcaption className="mt-8 flex flex-col items-center gap-1">
              <span className="text-sm font-bold tracking-wider text-amber-400 uppercase">Sayam-ud-Din</span>
              <span className="text-xs text-slate-400">Co-Founder &amp; Engineering Lead, RentLink Northern Pakistan</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
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
