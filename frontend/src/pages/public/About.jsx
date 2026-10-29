import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import { PROPERTY_TYPES } from '../../utils/constants';
import { DISTRICTS } from '../../data/locations';
import Button from '../../components/common/Button';
import Icon, { MaterialIcon } from '../../components/common/icons';
import AboutCubesHero from '../../components/about/AboutCubesHero';

const VALUES = [
  {
    icon: 'shield',
    title: 'Trust before scale',
    text: 'We would rather approve 40 honest listings than 400 questionable ones. Every submission is personally checked by a local liaison on our Gilgit-Baltistan moderation desk.',
  },
  {
    icon: 'pin',
    title: 'Local by default',
    text: 'Districts, valleys, towns and localities are modelled the way people in Gilgit-Baltistan actually live and converse, not as arbitrary coordinate pins.',
  },
  {
    icon: 'chat',
    title: 'No hidden conversations',
    text: 'Messages, visit bookings and verification statuses remain transparently tracked on-platform so tenants and owners retain an undeniable audit trail.',
  },
  {
    icon: 'wallet',
    title: 'Transparent fee structure',
    text: 'A flat, transparent 5% platform fee on completed rentals. Zero commissions, zero unexpected fees, and completely free browsing for tenants.',
  },
];

const NUMBERS = [
  { value: String(DISTRICTS.length), label: 'Districts covered', hint: 'From Hunza to Skardu' },
  { value: String(PROPERTY_TYPES.length), label: 'Property categories', hint: 'Villas, chalets, apartments' },
  { value: '5%', label: 'Flat platform fee', hint: 'Only on verified leases' },
  { value: '100%', label: 'Deed inspected', hint: 'Human verified moderation' },
];

const AUDIENCES = [
  {
    icon: 'user',
    title: 'For Tenants & Settlers',
    text: 'Search by the exact mountain valley or district you want to reside in. Compare authentic properties side by side and schedule verified in-person visits seamlessly.',
    cta: 'Browse Sanctuaries',
    to: '/browse',
  },
  {
    icon: 'building',
    title: 'For Property Owners',
    text: 'Publish listings through an intuitive step-by-step verification pipeline. Manage tenant visit requests directly and receive verified payouts with full reporting.',
    cta: 'List a Property',
    to: '/owner/properties/new',
  },
  {
    icon: 'flag',
    title: 'For Regional Communities',
    text: 'Help protect local housing culture. Report irregular listings, leave authentic reviews, and ensure rental data remains honest for families and arriving professionals.',
    cta: 'Read Our Story',
    to: '/story',
  },
];

export default function About() {
  useDocumentTitle('About RentLink — Mountain Rental Sanctuary');

  return (
    <div className="bg-[#F8FAFC]">
      {/* High-Altitude BackgroundCubesGrid Alpine Hero with Animated Community Pills */}
      <AboutCubesHero tone="dark" />

      {/* Origin Story Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">The Problem We Solved</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              The old way was an unreliable phone tree
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
              Finding a home in Gilgit, Skardu or Hunza historically meant calling distant relatives, waiting
              days for blurry WhatsApp photos, and dealing with arbitrary prices that changed overnight.
              Families travelled entire days over Karakoram passes only to find a home had already been leased weeks ago.
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
              We engineered RentLink to end the guesswork. Structured property profiles, human-verified land records,
              integrated visit bookings, and transparent reviews mean families and individuals can secure their ideal sanctuary
              in minutes with total peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {NUMBERS.map((n) => (
              <div
                key={n.label}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all"
              >
                <p className="text-3xl sm:text-4xl font-bold text-amber-600">{n.value}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{n.label}</p>
                <p className="mt-1 text-xs text-slate-400">{n.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-y border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Guiding Pillars</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Four principles that shape RentLink
            </h2>
            <p className="mt-3 text-slate-600">
              Every feature, policy, and moderation decision is guided by our core commitment to Northern Pakistan&apos;s communities.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-8 transition-all hover:bg-white hover:border-amber-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1320] text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{v.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Ecosystem</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            One platform built for three core stakeholders
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.title}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
                <Icon name={a.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{a.title}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{a.text}</p>
              <Button as={Link} to={a.to} variant="outline" fullWidth className="mt-6 rounded-full">
                {a.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Moderation Protocol */}
      <section className="border-y border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Trust Protocol</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                How we protect the Northern rental market
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Fraud in decentralized rental markets follows predictable patterns: pressure tactics, off-platform cash requests,
                and outdated photography. We intentionally built structural countermeasures into every corner of the platform.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                  <MaterialIcon className="text-2xl">verified_user</MaterialIcon>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Zero Unverified Listings</p>
                  <p className="text-xs text-slate-500">Every single home is screened prior to appearing on the public search index.</p>
                </div>
              </div>
            </div>

            <ul className="space-y-4">
              {[
                ['Manual Liaison Verification', 'Every listing is reviewed for authentic locality metadata, real photography, and justifiable rent rates.'],
                ['Deed & Owner Verification', 'Owners submit identity documents to earn our official mountain emerald badge.'],
                ['Tamper-Proof Audit Trail', 'Visit requests, direct messages, and agreement terms are archived in your account dashboard.'],
                ['Regional Community Safeguard', 'Tenants and neighbors can report suspicious behavior directly to our local liaison teams.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mountain Banner CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1320] px-8 py-14 text-center text-white sm:px-16 shadow-xl">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(217,119,6,.2),transparent_70%)]"
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              Meet the Custodians
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The team behind RentLink Northern Pakistan
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
              Our multidisciplinary team is spread across Gilgit, Skardu, Hunza, and Ghizer, united by a passion
              to modernize rental living while honoring our regional heritage.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button as={Link} to="/team" size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                Meet the Team
              </Button>
              <Button
                as={Link}
                to="/collaborations"
                size="lg"
                variant="ghost"
                className="rounded-full border border-white/20 text-white hover:bg-white/10"
              >
                Institutional Partners
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
