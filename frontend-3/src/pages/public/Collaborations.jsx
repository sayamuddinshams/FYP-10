import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import contentService from '../../services/contentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import PublicPageHero from '../../components/public/PublicPageHero';

const PROGRAMS = [
  {
    icon: 'users',
    title: 'Community & Student Alliances',
    text: 'Student unions, educational fellowships, and local welfare bodies help us connect with young professionals and families. In exchange, we provide verified campus listings, rent caps, and fee waivers for community housing.',
    points: ['Free verified listings for regional student collectives', 'Campus housing safety and deed workshops', 'Standardized sublease agreements for students'],
  },
  {
    icon: 'briefcase',
    title: 'Licensed Himalayan Broker Network',
    text: 'Local agencies operating across Gilgit-Baltistan get streamlined multi-unit management tools, unified verification credentials, and consolidated regional reach.',
    points: ['Portfolio management and bulk availability controls', 'Common deed-check certification recognized across 10 districts', 'Discounted 3.5% transaction rate for high-volume managers'],
  },
  {
    icon: 'building',
    title: 'Institutional & Healthcare Housing',
    text: 'Universities, regional hospitals, NGOs, and infrastructure teams use RentLink to place incoming doctors, educators, and engineers. We provide dedicated inventory reservations and consolidated organizational billing.',
    points: ['Private staff housing registry for corporate HR teams', 'Unified monthly billing and tax reconciliation', 'Priority 24-hour verification turnaround from local liaisons'],
  },
];

const TONE_MAP = {
  Community: 'amber',
  Organization: 'neutral',
  Partners: 'success',
};

export default function Collaborations() {
  useDocumentTitle('Institutional Collaborations — RentLink Northern Pakistan');
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => contentService.partners(), []);
  const partners = data || [];

  return (
    <div className="bg-[#F8FAFC]">
      {/* High-Altitude Alpine Hero */}
      <PublicPageHero
        eyebrow="Regional Alliances"
        title="Building resilient housing ecosystems across Gilgit-Baltistan."
        description="We partner with educational institutions, community councils, hospitals, and licensed agencies to expand verified rental housing for the northern regions."
        image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80"
        aside={
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Direct Liaison Desk</span>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Reach our regional partnership team with details of your institution and coverage districts.
            </p>
            <a
              href="mailto:partners@rentlink.pk"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Icon name="mail" className="h-4 w-4" />
              partners@rentlink.pk
            </a>
          </div>
        }
      />

      {/* Structured Programs */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Engagement Tracks</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Structured partnership frameworks
          </h2>
          <p className="mt-3 text-slate-600">
            Three defined programs designed for measurable community impact and transparent accountability.
          </p>
        </div>

        <div className="space-y-8">
          {PROGRAMS.map((p) => (
            <article
              key={p.title}
              className="grid gap-8 rounded-3xl border border-slate-200/80 bg-white p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12 shadow-sm hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1320] text-amber-400 shadow-sm">
                  <Icon name={p.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">{p.title}</h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">{p.text}</p>
              </div>
              <ul className="space-y-3.5 self-center rounded-2xl bg-[#F8FAFC] border border-slate-100 p-6">
                {p.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Verified Partner Entities */}
      <section className="border-y border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Affiliations</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                Recognized institutional partners
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-500">
              Every participating partner undergoes annual review by our regional board. Listings affiliated with these entities bear our verified seal.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
              ))}

            {!loading && error && (
              <div className="sm:col-span-2 lg:col-span-3">
                <ErrorState message={error} onRetry={reload} />
              </div>
            )}

            {!loading && !error && partners.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState
                  icon="users"
                  title="No partners listed yet"
                  message="Partnerships are published as they are confirmed. Check back soon."
                  actionLabel="Meet the team"
                  onAction={() => navigate('/team')}
                />
              </div>
            )}

            {!loading &&
              !error &&
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-7 transition hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
                      <Icon name="users" className="h-5 w-5" />
                    </span>
                    <Badge tone={TONE_MAP[partner.type] || 'neutral'}>{partner.type}</Badge>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{partner.name}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{partner.detail}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Getting Started</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              A collaborative, light-touch protocol
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We eliminate complex red tape. We schedule an introductory alignment call, configure customized tenancy criteria,
              and test with a pilot in your designated district before expanding.
            </p>
            <div className="mt-8">
              <Button as={Link} to="/team" variant="outline" className="rounded-full">
                Meet our Liaison Team
              </Button>
            </div>
          </div>

          <ol className="space-y-4">
            {[
              ['Introduction & Needs Assessment', 'Discuss your regional student or staff housing requirements with our local district representative.'],
              ['Tailored Pilot Framework', 'Define structured safety, verification, and price caps for an initial 60-day trial cohort.'],
              ['Inventory Activation', 'Onboard properties into your private view with dedicated support for residents.'],
              ['Regional Scale & Review', 'Review feedback, tenant satisfaction ratings, and formally inaugurate regional collaboration.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1320] text-sm font-bold text-amber-400">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1320] px-8 py-14 text-center text-white sm:px-16 shadow-xl">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(217,119,6,.2),transparent_70%)]"
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to collaborate on mountain housing?
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
              Send us your organizational profile and the challenges you encounter in northern accommodation.
              Our leadership desk reviews every submission.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                as="a"
                href="mailto:partners@rentlink.pk"
                size="lg"
                className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                Inquire with Regional Desk
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
