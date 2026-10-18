import { Link } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import contentService from '../../services/contentService';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/icons';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { LineSkeleton } from '../../components/common/Skeleton';
import PublicPageHero from '../../components/public/PublicPageHero';

const VALUES = [
  { icon: 'shield', label: 'Verified Integrity', text: 'If a single room or deed detail is questionable, our regional liaisons resolve it before it ever reaches the public.' },
  { icon: 'pin', label: 'Northern Roots', text: 'Every engineer, operator, and designer lives in the mountainous districts we actively serve.' },
  { icon: 'spark', label: 'Radical Transparency', text: 'No hidden real estate jargon, zero unexpected commissions, and clear 5% platform rates.' },
];

export default function Team() {
  useDocumentTitle('Our Custodians — RentLink Team');
  const { data: members, loading, error, reload } = useAsync(() => contentService.team(), []);

  return (
    <div className="bg-[#F8FAFC]">
      {/* High-Altitude Alpine Hero */}
      <PublicPageHero
        eyebrow="Custodians & Builders"
        title="Six local stewards, ten mountain districts, one unified sanctuary."
        description="We are engineers, community liaisons, and designers born and raised in Gilgit-Baltistan, determined to bring dignity and trust to regional rental housing."
        image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80"
      />

      {/* Team Profiles Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">The People</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Meet our regional operations team
            </h2>
          </div>
          <Link
            to="/collaborations"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            Institutional Collaborations
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <LineSkeleton />
                    <LineSkeleton />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <LineSkeleton />
                  <LineSkeleton />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorState message={error} onRetry={reload} />
            </div>
          )}

          {!loading && !error && (members || []).length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                icon="users"
                title="No team members to show yet"
                message="Profiles are published as they are confirmed. Check back soon."
              />
            </div>
          )}

          {!loading &&
            !error &&
            (members || []).map((m) => (
              <article
                key={m.id}
                className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={m.name} size="lg" />
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg font-bold text-slate-950">{m.name}</h3>
                    <p className="truncate text-xs font-semibold tracking-wide text-amber-700 uppercase">{m.role}</p>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{m.bio}</p>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                    <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span className="truncate font-medium">{m.location}</span>
                  </span>
                  <Badge tone="brand">Verified Steward</Badge>
                </div>
              </article>
            ))}
        </div>
      </section>

      {/* Operational Culture */}
      <section className="border-y border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Our Culture</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Shared principles in mountain software
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.label}
                className="rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-8 hover:bg-white hover:border-amber-300 hover:shadow-md transition-all"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1320] text-amber-400">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-bold text-slate-900">{v.label}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-14 lg:grid-cols-[1.4fr_1fr] shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Join our team</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Build high-altitude technology
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-xl">
              We operate deliberately and hire locally. If you care deeply about Northern Pakistan, believe in housing transparency,
              and want to build systems that thousands rely on across mountain passes, we want to hear from you.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Full-stack Engineer: Gilgit or Skardu (hybrid)',
                'District Liaison Coordinator: Hunza & Nagar',
                'Trust & Deed Verification Analyst: Gilgit Office',
              ].map((role) => (
                <li key={role} className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {role}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 p-6">
            <Button as="a" href="mailto:careers@rentlink.pk" fullWidth size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
              Email Your Resume
            </Button>
            <Button as={Link} to="/story" fullWidth variant="outline" size="lg" className="rounded-full">
              Read Our Full Origin Story
            </Button>
            <p className="text-center text-xs text-slate-400 mt-2">Direct inbox: careers@rentlink.pk</p>
          </div>
        </div>
      </section>
    </div>
  );
}
