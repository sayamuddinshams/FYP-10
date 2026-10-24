import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import Icon from '../../components/common/icons';

const LAST_UPDATED = '10 October 2026';

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    paragraphs: [
      'We collect the information you give us when you create an account, publish a listing, contact an owner or ask for support. This includes your name, phone number, email address, district, city or area, and any profile details you choose to add.',
      'When you list a property we also store the details of that listing: address, rent, size, amenities, availability, photos and the documents you submit for verification.',
      'We record limited technical information automatically, such as your device type, browser and pages viewed, so we can keep the marketplace working and understand which listings are useful.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: 'How we use your information',
    bullets: [
      'To create and secure your account and to sign you in.',
      'To publish your listings and show them to people searching for a place.',
      'To pass visit requests and messages between tenants and owners.',
      'To review listings and verify owner identity before content goes live.',
      'To respond to reports, disputes and support requests.',
      'To send you notifications you have asked for, such as visit updates.',
    ],
  },
  {
    id: 'sharing',
    title: 'When information is shared',
    paragraphs: [
      'Some information is public by design. A published listing shows the property details, photos, locality and the owner name you provide. Reviews you publish are shown with your name.',
      'When you request a visit or start a conversation, the other party can see your name and the messages you send so the two of you can arrange the rental.',
      'We do not sell your personal information. We share it with service providers only where needed to run RentLink, for example hosting and file storage, and with authorities where the law requires it.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and local storage',
    paragraphs: [
      'RentLink uses your browser storage to keep you signed in and to remember preferences such as your saved properties. We do not use this storage to build advertising profiles.',
      'You can clear this data at any time from your browser settings. Doing so will sign you out and reset your saved preferences.',
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep data',
    paragraphs: [
      'We keep your account and listing information for as long as your account is open. If you close your account we remove your profile and unpublished drafts, and we keep only the records we are required to retain, such as completed transaction records, for as long as the law requires.',
    ],
  },
  {
    id: 'your-choices',
    title: 'Your choices',
    bullets: [
      'You can view and edit most of your profile and listing information at any time from your dashboard.',
      'You can turn notification categories on or off in your settings.',
      'You can request a copy or the deletion of your account data by contacting us. We may need to confirm your identity first.',
    ],
  },
  {
    id: 'security',
    title: 'Security',
    paragraphs: [
      'We limit access to personal information to the people who need it to operate and moderate the marketplace. No online service can promise perfect security, so please use a strong, unique password and keep your contact details up to date.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'RentLink is intended for people who are legally able to enter a rental agreement. It is not directed at children, and we do not knowingly collect information from them.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      'If we change how we handle personal information we will update this page and revise the date above. Material changes will also be announced in the app so you have time to review them.',
    ],
  },
];

export default function Privacy() {
  useDocumentTitle('Privacy Policy');

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-brand-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold tracking-widest text-primary-300 uppercase">Legal</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            This policy explains what RentLink collects, why we collect it and the choices you
            have. It applies to the RentLink marketplace for Gilgit-Baltistan.
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
                <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
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
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Contact us
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Questions about this policy or your data? Email{' '}
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
                <Link to="/terms" className="font-medium text-brand-700 underline-offset-4 hover:underline">
                  Terms and Conditions
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
