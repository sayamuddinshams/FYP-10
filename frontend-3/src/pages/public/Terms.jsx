import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import Icon from '../../components/common/icons';

const LAST_UPDATED = '10 October 2026';

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    paragraphs: [
      'By using RentLink you agree to these Terms and Conditions. If you do not agree with them, please do not use the marketplace.',
      'You must be legally able to enter a rental agreement to create an account, publish a listing or request a visit.',
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts',
    paragraphs: [
      'You are responsible for the accuracy of the information on your account and for keeping your password secure. Notify us promptly if you believe your account has been used without your permission.',
      'You may not create an account to impersonate another person or to publish listings you are not authorised to advertise.',
    ],
  },
  {
    id: 'listings',
    title: 'Listings and responsibilities',
    bullets: [
      'Owners and agents must have the right to advertise the property they publish.',
      'Listing details, photos, rent and availability must be accurate and kept up to date.',
      'A listing must describe a real property that is genuinely available, not a lead or a placeholder.',
      'You may not publish discriminatory, illegal or misleading content, or advertise a property you do not control.',
    ],
  },
  {
    id: 'review',
    title: 'Review and verification',
    paragraphs: [
      'Every listing is reviewed by our moderation team before it appears in search results. A listing may be rejected or requested for changes, with a reason, if it does not meet these terms.',
      'A verified badge means we have checked the owner identity and the submitted documents. It is not a guarantee of the condition of a property, and you should still inspect a place before you commit to it.',
    ],
  },
  {
    id: 'fees',
    title: 'Rent, fees and payments',
    paragraphs: [
      'Rent is agreed directly between the tenant and the owner. RentLink does not set or collect rent.',
      'RentLink charges a 5% platform fee on completed rentals. Any fee is shown before you confirm a transaction. Charges for promoting a listing are shown in your dashboard before you approve them.',
    ],
  },
  {
    id: 'visits',
    title: 'Visits and communication',
    paragraphs: [
      'Visit requests, messages and status changes stay on the platform so both sides have a record. Keep communication on RentLink where possible, and never send money to someone you have not met or verified.',
    ],
  },
  {
    id: 'conduct',
    title: 'Prohibited conduct',
    bullets: [
      'Posting false, fraudulent or duplicate listings.',
      'Harassing, threatening or discriminating against other users.',
      'Attempting to bypass moderation, fees or platform security.',
      'Scraping, reselling or misusing content that belongs to RentLink or its users.',
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews and content',
    paragraphs: [
      'Reviews must describe your genuine experience of a property you have dealt with. Reviews that are fabricated, defamatory or unrelated to a rental may be removed.',
      'By posting content you grant RentLink a licence to display it on the marketplace. You keep ownership of the content you create.',
    ],
  },
  {
    id: 'advertising',
    title: 'Advertising',
    paragraphs: [
      'Promoted listings are labelled so renters can tell them apart from organic results. Advertisers are responsible for the accuracy of their campaigns and must not impersonate an organic listing.',
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    paragraphs: [
      'RentLink is a marketplace that connects tenants and owners. We do not own the properties listed and we are not a party to the rental agreement you make. You are responsible for inspecting a property, checking documents and agreeing terms that suit you.',
      'The marketplace is provided on an as-is basis. We work to keep it available and accurate but we cannot promise that every listing or message is free of error.',
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    paragraphs: [
      'To the extent the law allows, RentLink is not liable for indirect or consequential losses arising from a rental, a listing or your use of the marketplace. Nothing in these terms limits rights that cannot be limited by law.',
    ],
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    paragraphs: [
      'We may suspend or close an account, or remove a listing, if these terms are broken or if we are required to do so by law. You may close your account at any time from your settings.',
    ],
  },
  {
    id: 'law',
    title: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of Pakistan as they apply in Gilgit-Baltistan. Disputes will be handled by the courts with jurisdiction over Gilgit.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    paragraphs: [
      'We may update these terms as the marketplace changes. We will revise the date above and, for material changes, announce them in the app before they take effect.',
    ],
  },
];

export default function Terms() {
  useDocumentTitle('Terms and Conditions');

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Legal</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            These terms set out the rules for using RentLink, for tenants, owners, agents and
            advertisers alike.
          </p>
          <p className="mt-4 text-sm text-white/55">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Contents */}
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">On this page</p>
              <ul className="mt-4 space-y-2.5 border-l border-line">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-0.5 pl-4 text-sm text-slate-600 transition hover:border-brand-300 hover:text-brand-800"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Body */}
          <div className="max-w-3xl space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {section.title}
                </h2>
                {section.paragraphs?.map((text) => (
                  <p key={text} className="mt-3 leading-relaxed text-slate-600">
                    {text}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((text) => (
                      <li key={text} className="flex gap-3 text-slate-600">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Contact */}
            <section
              id="contact"
              className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6 sm:p-8"
            >
              <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Contact us
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Questions about these terms? Email{' '}
                <a
                  href="mailto:support@rentlink.pk"
                  className="font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  support@rentlink.pk
                </a>{' '}
                or write to us at Konodas, Gilgit, Gilgit-Baltistan.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                See also our{' '}
                <Link to="/privacy" className="font-medium text-brand-700 underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
