import { Link } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import contentService from '../../services/contentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/icons';

const PROGRAMS = [
  {
    icon: 'users',
    title: 'Community partnerships',
    text: 'Student unions, welfare groups and local organisations help us reach tenants who would never find a marketplace on their own. In return we provide verified accommodation data and free listings for community housing.',
    points: ['Free listings for verified community housing', 'Campus and district outreach events', 'Shared safety guidance for new renters'],
  },
  {
    icon: 'briefcase',
    title: 'Agency and broker network',
    text: 'Estate agents operating across Gilgit-Baltistan get bulk listing tools, a shared verification standard and a single dashboard for every property they manage.',
    points: ['Bulk listing import and management', 'Common verification standards across GB', 'Reduced platform fee on volume listings'],
  },
  {
    icon: 'building',
    title: 'Institutional housing',
    text: 'Universities, hospitals and development programmes use RentLink to place staff and trainees. We give them a private view of available inventory and one invoice instead of a hundred conversations.',
    points: ['Private inventory view for HR teams', 'Consolidated monthly billing', 'Dedicated onboarding support'],
  },
];

const TONE_MAP = {
  Community: 'brand',
  Organization: 'info',
  Partners: 'success',
};

export default function Collaborations() {
  useDocumentTitle('Collaborations');
  const { data } = useAsync(() => contentService.partners(), []);
  const partners = data || [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Collaborations</p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-semibold sm:text-5xl">
                We build better housing markets together.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/70">
                RentLink works with community groups, estate agencies and institutions across
                Gilgit-Baltistan. If your organisation helps people find a place to live, we should talk.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Partnership enquiries</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Write to us with your organisation, the districts you cover and what you would like to
                build together. We reply within two working days.
              </p>
              <a href="mailto:partners@rentlink.pk" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 hover:underline">
                <Icon name="mail" className="h-4 w-4" />
                partners@rentlink.pk
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-ink">Ways to work with us</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Three structured programmes, each with clear expectations on both sides.
        </p>

        <div className="mt-8 space-y-6">
          {PROGRAMS.map((p) => (
            <article key={p.title} className="grid gap-6 rounded-2xl border border-line bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-white">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
              <ul className="space-y-3 self-center rounded-xl bg-surface p-5">
                {p.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary uppercase">Our partners</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Organisations we work with</h2>
            </div>
            <p className="max-w-sm text-sm text-slate-500">
              Each partner is reviewed annually. Their listings and events carry a partner badge on
              RentLink.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {!data &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl border border-line bg-white" />
              ))}
            {partners.map((partner) => (
              <div key={partner.id} className="flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
                    <Icon name="users" className="h-5 w-5" />
                  </span>
                  <Badge tone={TONE_MAP[partner.type] || 'neutral'}>{partner.type}</Badge>
                </div>
                <h3 className="mt-4 font-semibold text-ink">{partner.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{partner.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">Getting started</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">How a collaboration begins</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              No long procurement process. We start with a short call, agree what success looks like and
              run a pilot in one district before scaling.
            </p>
            <Link to="/team" className="mt-6 inline-block">
              <Button variant="outline">Meet the team</Button>
            </Link>
          </div>

          <ol className="space-y-5">
            {[
              ['Introduction', 'Tell us who you are and which districts or communities you serve.'],
              ['Pilot design', 'Together we define a small, measurable pilot — usually one district or one campus.'],
              ['Launch', 'We onboard your listings or inventory, train your team and go live.'],
              ['Review', 'After 60 days we review results and decide whether to expand the partnership.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4 rounded-xl border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-14">
          <h2 className="font-display text-3xl font-semibold">Have a partnership in mind?</h2>
          <p className="max-w-xl text-white/75">
            Tell us about your organisation and the problem you are trying to solve. We read every
            message that comes in.
          </p>
          <a href="mailto:partners@rentlink.pk">
            <Button size="lg" className="bg-white text-primary hover:bg-brand-50">
              Start a conversation
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
