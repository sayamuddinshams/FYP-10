import { Link } from 'react-router-dom';
import Icon from '../common/icons';
import Button from '../common/Button';
import { LogoMark } from './Header';
import { PROPERTY_TYPES } from '../../utils/constants';
import { POPULAR_LOCATIONS } from '../../data/locations';

const COMPANY = [
  { to: '/about', label: 'About Us' },
  { to: '/story', label: 'Our Story' },
  { to: '/collaborations', label: 'Collaborations' },
  { to: '/team', label: 'Team' },
  { to: '/advertisements', label: 'Advertisements' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-brand-950 text-white">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_0%,rgba(75,116,180,.25),transparent_60%),radial-gradient(ellipse_40%_35%_at_85%_100%,rgba(46,74,125,.3),transparent_65%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="RentLink home">
              <LogoMark />
              <span className="text-xl font-extrabold tracking-tight">
                Rent<span className="text-brand-300">Link</span>
              </span>
            </Link>
            <p className="mt-5 font-display text-2xl leading-snug text-white/95">
              Find a place. <span className="italic text-brand-300">Make it home.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              The rental marketplace for Gilgit-Baltistan — verified owners, reviewed listings and
              direct communication between tenants and property owners.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10">
                <Icon name="shield" className="h-3.5 w-3.5 text-emerald-400" />
                Verified owners
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10">
                <Icon name="file" className="h-3.5 w-3.5 text-brand-300" />
                Reviewed listings
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10">
                <Icon name="pin" className="h-3.5 w-3.5 text-amber-300" />
                Built for GB
              </span>
            </div>

            <div className="mt-6 space-y-2 text-sm text-white/60">
              <p className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-brand-300 ring-1 ring-white/10">
                  <Icon name="mail" className="h-4 w-4" />
                </span>
                support@rentlink.pk
              </p>
              <p className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-brand-300 ring-1 ring-white/10">
                  <Icon name="pin" className="h-4 w-4" />
                </span>
                Konodas, Gilgit, Gilgit-Baltistan
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-white/40 uppercase">Company</h3>
            <ul className="mt-5 space-y-3">
              {COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors duration-200 hover:text-white">
                    <span className="h-px w-0 bg-brand-300 transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-white/40 uppercase">Property types</h3>
            <ul className="mt-5 space-y-3">
              {PROPERTY_TYPES.map((type) => (
                <li key={type.value}>
                  <Link to={`/browse?type=${type.value}`} className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors duration-200 hover:text-white">
                    <span className="h-px w-0 bg-brand-300 transition-all duration-300 group-hover:w-3" />
                    {type.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-white/40 uppercase">Popular locations</h3>
            <ul className="mt-5 space-y-3">
              {POPULAR_LOCATIONS.slice(0, 6).map((loc) => (
                <li key={loc.name}>
                  <Link to={`/browse?district=${loc.district}`} className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors duration-200 hover:text-white">
                    <span className="h-px w-0 bg-brand-300 transition-all duration-300 group-hover:w-3" />
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-white/40 uppercase">Get started</h3>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Browse verified rentals or list your property and reach thousands of serious renters.
            </p>
            <div className="mt-5 space-y-2.5">
              <Button as={Link} to="/browse" fullWidth size="sm" className="justify-start">
                <Icon name="search" className="h-4 w-4" />
                Browse properties
              </Button>
              <Button as={Link} to="/about" fullWidth size="sm" variant="ghost" className="justify-start text-white/75 hover:bg-white/10 hover:text-white">
                <Icon name="info" className="h-4 w-4" />
                How it works
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} RentLink. Built for the Gilgit-Baltistan rental market.</p>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <span className="transition-colors hover:text-white/70">Privacy</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="transition-colors hover:text-white/70">Terms</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="transition-colors hover:text-white/70">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
