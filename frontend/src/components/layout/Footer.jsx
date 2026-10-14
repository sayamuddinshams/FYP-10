import { Link } from 'react-router-dom';
import Icon from '../common/icons';
import { LogoMark } from './Header';
import { PROPERTY_TYPES } from '../../utils/constants';
import { POPULAR_LOCATIONS } from '../../data/locations';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const COMPANY = [
  { to: '/about', label: 'About Us' },
  { to: '/story', label: 'Our Story' },
  { to: '/collaborations', label: 'Collaborations' },
  { to: '/team', label: 'Team' },
  { to: '/advertisements', label: 'Advertisements' },
];

const CONTACT = [
  { icon: 'mail', label: 'support@rentlink.pk', href: 'mailto:support@rentlink.pk' },
  { icon: 'phone', label: '+92 5811 456789', href: 'tel:+925811456789' },
  { icon: 'pin', label: 'Konodas, Gilgit — Gilgit-Baltistan' },
];

// Shared row: 44px tall so links keep a comfortable touch/click target.
const linkClass =
  'flex min-h-10 items-center text-sm text-white/60 transition-colors duration-200 hover:text-white';

function LinkList({ title, children, className = '' }) {
  return (
    <nav aria-label={title} className={className}>
      <h3 className="text-xs font-semibold tracking-[0.14em] text-white/50 uppercase">{title}</h3>
      {children}
    </nav>
  );
}

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  return (
    <footer
      aria-label="Site footer"
      className="relative mt-20 border-t border-white/10 bg-brand-950 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Site footer</h2>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-12 lg:gap-x-8 lg:py-16">
          {/* Brand + contact */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 lg:pr-8">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="RentLink home">
              <LogoMark />
              <span className="text-xl font-extrabold tracking-tight">
                Rent<span className="text-brand-300">Link</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              The rental marketplace for Gilgit-Baltistan — verified owners, reviewed listings and
              direct contact between tenants and property owners.
            </p>

            <ul className="mt-7 space-y-2.5">
              {CONTACT.map((item) => {
                const body = (
                  <>
                    <Icon
                      name={item.icon}
                      className="mr-3 h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-brand-300"
                    />
                    <span>{item.label}</span>
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="group inline-flex items-start text-sm text-white/60 transition-colors duration-200 hover:text-white"
                      >
                        {body}
                      </a>
                    ) : (
                      <span className="inline-flex items-start text-sm text-white/60">{body}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <LinkList title="Company" className="lg:col-span-2">
            <ul className="mt-4 space-y-1">
              {COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </LinkList>

          {/* Property types */}
          <LinkList title="Property types" className="lg:col-span-2">
            <ul className="mt-4 space-y-1">
              {PROPERTY_TYPES.map((type) => (
                <li key={type.value}>
                  <Link to={`/browse?type=${type.value}`} className={linkClass}>
                    {type.label}
                  </Link>
                </li>
              ))}
            </ul>
          </LinkList>

          {/* Locations */}
          <LinkList title="Locations" className="lg:col-span-4">
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
              {POPULAR_LOCATIONS.slice(0, 10).map((loc) => (
                <li key={loc.name}>
                  <Link
                    to={`/browse?districts=${encodeURIComponent(loc.district)}`}
                    className={linkClass}
                  >
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </LinkList>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} RentLink. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <nav aria-label="Legal" className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                Terms
              </Link>
              <a
                href="mailto:support@rentlink.pk"
                className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
              >
                Support
              </a>
            </nav>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors duration-200 hover:border-white/30 hover:text-white"
            >
              <Icon name="chevronDown" className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
