import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';

const VALUES = [
  {
    icon: 'shield',
    title: 'Trust before scale',
    text: 'We would rather approve 40 honest listings than 400 questionable ones. Every submission is read by a human on our moderation team.',
  },
  {
    icon: 'pin',
    title: 'Local by default',
    text: 'Districts, cities and localities are modelled the way people in Gilgit-Baltistan actually talk about them — not as generic map pins.',
  },
  {
    icon: 'chat',
    title: 'No hidden conversations',
    text: 'Messages, visit requests and status changes stay on the platform so both sides always have a clear record.',
  },
  {
    icon: 'wallet',
    title: 'Transparent money',
    text: 'One clear 5% platform fee on completed rentals. No commission games, no surprise charges for tenants.',
  },
];

const NUMBERS = [
  { value: '10', label: 'Districts covered' },
  { value: '6', label: 'Property categories' },
  { value: '5%', label: 'Flat platform fee' },
  { value: '24h', label: 'Typical review time' },
];

const AUDIENCES = [
  {
    icon: 'user',
    title: 'For tenants',
    text: 'Search by the locality you actually want to live in, compare verified listings side by side, and schedule visits without a single phone tag.',
    cta: 'Start browsing',
    to: '/browse',
  },
  {
    icon: 'building',
    title: 'For owners and agents',
    text: 'Publish with a guided six-step form, respond to visit requests from one dashboard and track earnings with a clear fee breakdown.',
    cta: 'See how listing works',
    to: '/story',
  },
  {
    icon: 'flag',
    title: 'For the community',
    text: 'Report suspicious listings, review places you have visited and help keep rental information accurate for the next family searching.',
    cta: 'Read our story',
    to: '/story',
  },
];

export default function About() {
  useDocumentTitle('About Us');

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">About RentLink</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Rental housing in Gilgit-Baltistan, finally in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            RentLink is a property marketplace built for the ten districts of Gilgit-Baltistan. We connect
            people looking for a home with owners who have one — and we verify both sides before anything
            goes live.
          </p>
        </div>
      </section>

      {/* Problem → solution */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">Why we exist</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">The old way was a phone tree</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Finding a place to rent in Gilgit meant calling a cousin who knew an agent, who knew a
              landlord, who may or may not still be accepting tenants. Photos arrived on WhatsApp days
              later. Prices changed between calls. Families travelled from Skardu to Gilgit only to find
              the listing had been rented weeks ago.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              We built RentLink to end that. Structured listings, verified owners, real visit scheduling
              and a public record of reviews — so the search takes minutes instead of weeks, and both
              sides know what to expect before they meet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 self-start sm:gap-5">
            {NUMBERS.map((n) => (
              <div key={n.label} className="rounded-2xl border border-line bg-white p-6 text-center transition hover:shadow-lift">
                <p className="font-display text-4xl font-semibold text-primary">{n.value}</p>
                <p className="mt-2 text-sm text-slate-500">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink">What we hold to</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Four principles shape every decision we make, from how a listing is reviewed to how a dispute
            is handled.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-line bg-surface p-6 transition hover:border-brand-200 hover:shadow-lift">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-white">
                  <Icon name={v.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-ink">One platform, three jobs</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="flex flex-col rounded-2xl border border-line bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
                <Icon name={a.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{a.text}</p>
              <Link to={a.to} className="mt-5">
                <Button variant="outline" fullWidth>{a.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p className="text-sm font-semibold tracking-widest text-primary uppercase">Safety</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                How we keep the marketplace clean
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Fraud in rental markets follows a pattern: urgency, off-platform payments and photos that
                do not match reality. We design against all three.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                ['Human review', 'Every listing is checked for accurate location, real photos and a fair price range before publication.'],
                ['Owner verification', 'Identity-verified owners carry a visible badge; unverified accounts are clearly labelled.'],
                ['On-platform records', 'Visits, messages and transactions stay in your account so nothing depends on a lost chat thread.'],
                ['Community reports', 'Anyone can report a listing or a user. Our trust team resolves reports with a written resolution.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-950 px-6 py-12 text-center text-white sm:px-14">
          <h2 className="font-display text-3xl font-semibold">Meet the people behind RentLink</h2>
          <p className="max-w-xl text-white/70">
            A small team spread across Gilgit, Hunza, Skardu and Ghizer, building for the region we all
            call home.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/team">
              <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50">Our team</Button>
            </Link>
            <Link to="/collaborations">
              <Button size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
                Collaborations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
