import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import Button from '../common/Button';
import LocationAutocomplete from '../property/LocationAutocomplete';
import { PROPERTY_TYPES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useUnreadNotifications } from '../../hooks';
import { cn } from '../../utils/format';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/browse', label: 'Browse Properties' },
  { to: '/about', label: 'About Us' },
  { to: '/story', label: 'Our Story' },
  { to: '/collaborations', label: 'Collaborations' },
  { to: '/team', label: 'Team' },
  { to: '/advertisements', label: 'Advertisements' },
];

function dashboardPath(role) {
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/tenant/dashboard';
}

export function LogoMark({ size = 'md' }) {
  const dims = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl';
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden text-white',
        'bg-[linear-gradient(140deg,#283f67_0%,#2e4a7d_45%,#4b74b4_100%)]',
        'shadow-[0_2px_6px_rgba(11,26,48,.3),0_10px_24px_-10px_rgba(11,26,48,.5)]',
        dims
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      <Icon name="home" className={size === 'sm' ? 'relative h-4.5 w-4.5' : 'relative h-5 w-5'} strokeWidth={2} />
    </span>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const unread = useUnreadNotifications();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState({ label: '', district: '', city: '', area: '', type: '' });

  const searchPanelRef = useRef(null);
  const drawerRef = useRef(null);
  const burgerRef = useRef(null);
  const searchToggleRef = useRef(null);
  const searchWasOpen = useRef(false);
  const drawerWasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Search panel: focus the field on open, hand focus back to the toggle on close.
  useEffect(() => {
    if (searchOpen) {
      searchWasOpen.current = true;
      searchPanelRef.current?.querySelector('input, select')?.focus();
    } else if (searchWasOpen.current) {
      searchWasOpen.current = false;
      searchToggleRef.current?.focus();
    }
  }, [searchOpen]);

  // Mobile drawer: Escape closes, focus moves in, Tab cycles, focus returns to the toggle.
  useEffect(() => {
    if (!mobileOpen) {
      if (drawerWasOpen.current) burgerRef.current?.focus();
      drawerWasOpen.current = false;
      return undefined;
    }
    drawerWasOpen.current = true;
    const panel = drawerRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll('a[href], button:not([disabled])') || []).filter(
        (el) => el.offsetParent !== null
      );
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Search closes on Escape without stealing focus from the drawer.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  function goSearch() {
    const params = new URLSearchParams();
    if (search.label) params.set('q', search.label);
    if (search.district) params.set('district', search.district);
    if (search.city) params.set('city', search.city);
    if (search.area) params.set('area', search.area);
    if (search.type) params.set('type', search.type);
    navigate(`/browse${params.toString() ? `?${params}` : ''}`);
    setSearchOpen(false);
  }

  function onGuarded(path, message) {
    if (!isAuthenticated) {
      openAuth('login');
      toast.info(message || 'Sign in to continue.');
      return;
    }
    navigate(path);
  }

  async function handleLogout() {
    await logout();
    toast.info('You have been signed out.', 'Logged out');
    navigate('/');
  }

  const avatarMenu = isAuthenticated ? (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            openAuth('login');
            return;
          }
          navigate(user.role === 'owner' ? '/owner/notifications' : user.role === 'admin' ? '/admin/notifications' : '/tenant/notifications');
        }}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative rounded-xl p-2 text-slate-500 transition-all duration-200 hover:-translate-y-px hover:bg-brand-50 hover:text-brand-700"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-red-500 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <ProfileDropdown user={user} onLogout={handleLogout} />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onGuarded('/tenant/notifications', 'Sign in to view notifications.')}
        aria-label="Notifications"
        className="hidden rounded-xl p-2 text-slate-500 transition-all duration-200 hover:-translate-y-px hover:bg-brand-50 hover:text-brand-700 sm:block"
      >
        <Icon name="bell" className="h-5 w-5" />
      </button>
      <Button size="sm" onClick={() => openAuth('login')}>
        Login / Sign Up
      </Button>
    </div>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'border-line/80 bg-white/92 shadow-[0_1px_2px_rgba(16,25,43,.04),0_10px_28px_-16px_rgba(16,25,43,.18)] backdrop-blur-xl'
          : 'border-transparent bg-white/95 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="RentLink home">
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <LogoMark />
          </span>
          <span className="leading-none">
            <span className="block text-[19px] font-extrabold tracking-tight text-brand-950">
              Rent<span className="text-primary">Link</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Gilgit-Baltistan
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-50/80 text-brand-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-800'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-[linear-gradient(90deg,#2e4a7d,#4b74b4)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            ref={searchToggleRef}
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search properties"
            aria-expanded={searchOpen}
            aria-controls="header-search"
            className={cn(
              'rounded-xl p-2 transition-all duration-200 hover:-translate-y-px',
              searchOpen ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-brand-50 hover:text-brand-700'
            )}
          >
            <Icon name="search" className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onGuarded('/tenant/saved', 'Sign in to view your saved properties.')}
            aria-label="Saved properties"
            className="hidden rounded-xl p-2 text-slate-500 transition-all duration-200 hover:-translate-y-px hover:bg-brand-50 hover:text-brand-700 sm:block"
          >
            <Icon name="heart" className="h-5 w-5" />
          </button>

          <span className="hidden xl:block">{avatarMenu}</span>

          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="rounded-xl border border-line bg-white p-2 text-slate-600 shadow-soft transition-all duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 xl:hidden"
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div
        id="header-search"
        ref={searchPanelRef}
        className={cn(
          // `invisible` keeps the collapsed panel out of the tab order and a11y tree.
          'overflow-hidden border-t border-line/70 bg-white/98 backdrop-blur-md transition-[max-height,opacity,visibility] duration-300',
          searchOpen ? 'visible max-h-64 opacity-100' : 'invisible max-h-0 opacity-0'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
            }}
            className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
          >
            <LocationAutocomplete
              ariaLabel="Search location"
              className="flex-1"
              inputClassName="h-12"
              value={search.label}
              placeholder="Search “Jutial”, “Karimabad”, “Sadpara”…"
              onSelect={(item) =>
                setSearch({
                  label: item.kind === 'text' ? item.label : item.area || item.city || item.district,
                  district: item.district || '',
                  city: item.city || '',
                  area: item.area || '',
                  type: search.type,
                })
              }
            />
            <select
              value={search.type}
              onChange={(e) => setSearch((p) => ({ ...p, type: e.target.value }))}
              aria-label="Property type"
              className="h-12 rounded-xl border border-line bg-white px-3.5 text-sm text-slate-700 shadow-soft focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            >
              <option value="">All property types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Button type="submit" size="lg" className="sm:w-auto">
              <Icon name="search" className="h-4.5 w-4.5" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 xl:hidden', mobileOpen ? '' : 'pointer-events-none')} aria-hidden={!mobileOpen}>
        <div onClick={() => setMobileOpen(false)} className={cn('absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} />
        <div
          id="mobile-nav"
          ref={drawerRef}
          role="dialog"
          aria-modal={mobileOpen || undefined}
          aria-label="Navigation menu"
          className={cn(
            // `invisible` removes the closed drawer from the tab order and a11y tree.
            'absolute inset-y-0 right-0 flex w-80 max-w-[88%] flex-col bg-white shadow-pop transition-[transform,visibility] duration-300',
            mobileOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <LogoMark size="sm" />
              <span className="text-base font-extrabold tracking-tight text-brand-950">RentLink</span>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-brand-50 text-brand-800 shadow-soft' : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="my-3 h-px bg-line" />

            {isAuthenticated ? (
              <>
                <NavLink to={dashboardPath(user.role)} className="block rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  My Dashboard
                </NavLink>
                <NavLink to="/tenant/saved" className="block rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Saved Properties
                </NavLink>
                <NavLink
                  to={user.role === 'owner' ? '/owner/notifications' : user.role === 'admin' ? '/admin/notifications' : '/tenant/notifications'}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Notifications
                  {unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>}
                </NavLink>
                <NavLink
                  to={user.role === 'owner' ? '/owner/profile' : user.role === 'admin' ? '/admin/profile' : '/tenant/profile'}
                  className="block rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Profile
                </NavLink>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth('login');
                }}
                className="w-full rounded-xl px-3.5 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Saved Properties
              </button>
            )}
          </nav>

          <div className="border-t border-line p-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <button type="button" onClick={handleLogout} aria-label="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                  <Icon name="logout" className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Button
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  openAuth('login');
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest?.('[data-menu-root]')) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" data-menu-root>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl p-1 transition-all duration-200 hover:bg-slate-100"
      >
        <Avatar name={user.name} size="sm" />
        <Icon name="chevronDown" className={cn('hidden h-4 w-4 text-slate-500 transition-transform duration-200 sm:block', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-pop animate-pop">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(dashboardPath(user.role));
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
          >
            <Icon name="grid" className="h-4 w-4 text-slate-500" />
            My Dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(user.role === 'owner' ? '/owner/profile' : user.role === 'admin' ? '/admin/profile' : '/tenant/profile');
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
          >
            <Icon name="user" className="h-4 w-4 text-slate-500" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(user.role === 'owner' ? '/owner/settings' : user.role === 'admin' ? '/admin/settings' : '/tenant/settings');
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
          >
            <Icon name="settings" className="h-4 w-4 text-slate-500" />
            Settings
          </button>
          <div className="my-1.5 h-px bg-line" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <Icon name="logout" className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
