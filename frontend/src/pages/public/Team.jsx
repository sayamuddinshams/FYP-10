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

const VALUES = [
  { icon: 'shield', label: 'Honest listings', text: 'If a detail is wrong, we fix it before we publish it.' },
  { icon: 'pin', label: 'Rooted locally', text: 'Every one of us lives in the region we are building for.' },
  { icon: 'spark', label: 'Plain language', text: 'No jargon in the product, no fine print in the fees.' },
];

export default function Team() {
  useDocumentTitle('Our Team');
  const { data: members, loading, error, reload } = useAsync(() => contentService.team(), []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Our Team</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Six people, ten districts, one marketplace.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            We are engineers, operators and designers who grew up in Gilgit-Baltistan and have spent time
            on both sides of a rental search.
          </p>
        </div>
      </section>

      {/* Members */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">Who we are</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              The people building RentLink
            </h2>
          </div>
          <Link
            to="/collaborations"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Work with us
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
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
            (members || []).map((m, i) => (
            <article
              key={m.id}
              className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-center gap-4">
                <Avatar name={m.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-ink">{m.name}</h3>
                  <p className="truncate text-sm font-medium text-primary">{m.role}</p>
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{m.bio}</p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span className="truncate">{m.location}</span>
                </span>
                <Badge tone="brand">Team</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">How we work</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Shared habits, not a poster on the wall
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.label} className="rounded-2xl border border-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-white">
                  <Icon name={v.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{v.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join us */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-3xl border border-line bg-white p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">Open roles</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Come build with us
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-slate-600">
              We hire slowly and deliberately. If you care about housing, care about Gilgit-Baltistan and
              want to ship software people actually use, we would like to hear from you.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Full-stack Engineer: Gilgit or remote (GB time zone)',
                'District Operations Lead: Skardu',
                'Trust and Safety Analyst: Gilgit',
              ].map((role) => (
                <li key={role} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {role}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Button as="a" href="mailto:careers@rentlink.pk" fullWidth size="lg">
              Email your application
            </Button>
            <Button as={Link} to="/story" fullWidth variant="outline" size="lg">
              Read our story
            </Button>
            <p className="text-center text-xs text-slate-500">careers@rentlink.pk</p>
          </div>
        </div>
      </section>
    </div>
  );
}
