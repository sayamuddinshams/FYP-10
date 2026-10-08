import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';

const TIMELINE = [
  {
    year: '2023',
    title: 'A notebook in Jutial',
    text: 'Zahid kept a handwritten list of houses his relatives were looking for and owners who had space. Within a month, neighbours were asking to be added to the same notebook.',
    tone: 'from-brand-900 to-brand-700',
  },
  {
    year: '2024',
    title: 'The first winter rush',
    text: 'Seasonal workers returning to Hunza and Skardu overwhelmed the phone network. We built a simple listing sheet shared over WhatsApp and matched 60 families in six weeks.',
    tone: 'from-brand-800 to-brand-600',
  },
  {
    year: '2025',
    title: 'RentLink takes shape',
    text: 'Structured listings, district-level search and a review pipeline. Our moderation team reads every submission — a rule we have never broken.',
    tone: 'from-brand-700 to-primary',
  },
  {
    year: '2026',
    title: 'Ten districts, one marketplace',
    text: 'Today RentLink covers Gilgit, Hunza, Skardu, Nagar, Ghizer, Astore, Diamer, Shigar, Kharmang and Ghanche — with visit scheduling, messaging and transparent fees.',
    tone: 'from-primary to-emerald-700',
  },
];

const PRINCIPLES = [
  {
    icon: 'list',
    title: 'Slow review, fast search',
    text: 'We take our time approving listings so that your search can be quick. Nothing appears on RentLink without a human signing off on it.',
  },
  {
    icon: 'users',
    title: 'Small owners welcome',
    text: 'Most landlords in GB own one or two properties. The listing flow is written for them, not for agencies with dedicated marketing teams.',
  },
  {
    icon: 'flag',
    title: 'Corrections are normal',
    text: 'If a price or detail is wrong, owners can edit and resubmit. Requests for changes come with a clear reason, never a silent rejection.',
  },
];

const MILESTONES = [
  { value: '1,370+', label: 'Registered tenants' },
  { value: '289', label: 'Properties listed' },
  { value: '171', label: 'Visits scheduled this month' },
  { value: '10', label: 'Districts served' },
];

export default function Story() {
  useDocumentTitle('Our Story');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-brand-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-900/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Our Story</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Built from a notebook, a phone and a lot of winter evenings.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            RentLink did not start as a startup idea. It started as a favour between families — and grew
            because the problem it solves never went away.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Timeline</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">How we got here</h2>
        </div>

        <ol className="relative mt-12 space-y-8">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-px bg-line sm:left-1/2 sm:-translate-x-1/2" />
          {TIMELINE.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
            <li
              key={item.year}
              className={`relative flex flex-col gap-4 sm:gap-10 ${flipped ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
            >
              <span
                aria-hidden="true"
                className="absolute top-6 left-0 h-4 w-4 rounded-full border-4 border-white bg-primary shadow sm:left-1/2 sm:-translate-x-1/2"
              />
              <div className={`flex-1 pl-8 sm:pl-0 ${flipped ? 'sm:text-left' : 'sm:text-right'}`}>
                <span className={`inline-block rounded-full bg-gradient-to-r ${item.tone} px-3 py-1 text-xs font-bold tracking-wider text-white`}>
                  {item.year}
                </span>
              </div>
              <div className="flex-1 pl-8 sm:pl-0">
                <div className="rounded-2xl border border-line bg-white p-6">
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </div>
            </li>
            );
          })}
        </ol>
      </section>

      {/* Milestones */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {MILESTONES.map((m) => (
              <div key={m.label} className="text-center">
                <p className="font-display text-4xl font-semibold text-primary">{m.value}</p>
                <p className="mt-2 text-sm text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">What we learned</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Three rules we refuse to bend</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-white">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="border-y border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Icon name="chat" className="mx-auto h-8 w-8 text-primary-300" />
          <blockquote className="mt-6 font-display text-2xl leading-relaxed font-medium sm:text-3xl">
            “A rental listing is a promise. It should describe a real place, at a real price, that someone
            is genuinely willing to show you this week.”
          </blockquote>
          <figcaption className="mt-6 text-sm text-white/60">
            Zahid Karim · Founder &amp; CEO, RentLink
          </figcaption>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">Be part of the next chapter</h2>
          <p className="max-w-xl text-slate-600">
            Whether you are looking for your first room in Gilgit or managing forty apartments in Hunza,
            there is a place for you on RentLink.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/browse">
              <Button size="lg">Browse properties</Button>
            </Link>
            <Link to="/collaborations">
              <Button size="lg" variant="outline">Partner with us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
