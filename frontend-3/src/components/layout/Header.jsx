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
  { to: '/browse', label: 'Properties' },
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
  return (
    <Link to="/" className="flex items-center gap-2 group tracking-tight py-1 text-white">
      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FE932C] shadow-sm group-hover:scale-105 transition-transform">
        <span className="material-symbols-outlined text-[20px]">landscape</span>
      </div>
      <span className="text-[24px] lg:text-[26px] font-semibold text-white tracking-tight flex items-center">
        rent<span className="text-[#FE932C] font-normal">link</span>
      </span>
    </Link>
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
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.district) params.set('districts', search.district);
    if (search.city) params.set('cities', search.city);
    if (search.area) params.set('areas', search.area);
    if (search.label && !search.district && !search.city && !search.area) {
      params.set('q', search.label);
    }
    if (search.type) params.set('type', search.type);
    setSearchOpen(false);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isHome && !scrolled
          ? 'bg-transparent border-b border-white/10 text-white backdrop-blur-sm'
          : 'bg-[#0B1320]/95 backdrop-blur-xl border-b border-white/10 text-white shadow-lg'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
        {/* Left brand block */}
        <div className="flex items-center gap-3 shrink-0">
          <LogoMark />
        </div>

        {/* Center navigation dock */}
        <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right utility actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search listings"
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all',
                searchOpen && 'bg-white/20 text-white'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) navigate('/tenant/saved');
                else openAuth('login', { type: 'favorite' });
              }}
              aria-label="Saved favorites"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">favorite_border</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    user.role === 'owner'
                      ? '/owner/notifications'
                      : user.role === 'admin'
                        ? '/admin/notifications'
                        : '/tenant/notifications'
                  )
                }
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unread > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FE932C] ring-2 ring-[#0B1320]" />
                )}
              </button>
            )}
          </div>

          {/* List Property CTA */}
          <Link
            to={isAuthenticated && user?.role === 'owner' ? '/owner/properties/new' : '/owner/dashboard'}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                openAuth('signup');
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-[13px] transition-all shadow-sm active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[17px] text-[#FE932C]">add_business</span>
            <span>List Property</span>
          </Link>

          {/* Profile / Login */}
          {isAuthenticated ? (
            <ProfileDropdown user={user} onLogout={handleLogout} />
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openAuth('login')}
              className="hidden sm:inline-flex rounded-full text-xs font-semibold px-4"
            >
              Sign In
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Search Dropdown */}
      {searchOpen && (
        <div
          ref={searchPanelRef}
          className="animate-pop border-t border-white/10 bg-[#0B1320]/95 backdrop-blur-2xl px-6 py-4 shadow-2xl"
        >
          <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <LocationAutocomplete
                value={search.label}
                onSelect={(loc) => setSearch((p) => ({ ...p, ...loc }))}
                placeholder="Search by district, city, or area in Gilgit-Baltistan..."
                className="w-full text-slate-900"
              />
            </div>
            <select
              value={search.type}
              onChange={(e) => setSearch((p) => ({ ...p, type: e.target.value }))}
              className="h-11 px-3.5 rounded-xl border border-white/20 bg-white text-slate-900 text-sm font-medium w-full sm:w-48 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            >
              <option value="">Any property type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" size="md" className="w-full sm:w-auto shrink-0">
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find Homes</span>
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-[#0B1320]/95 backdrop-blur-2xl md:hidden overflow-y-auto border-t border-white/10 animate-fade-in p-6 flex flex-col justify-between">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="my-2 h-px bg-white/10" />

            <Link
              to="/browse"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px] text-[#FE932C]">search</span>
              <span>Browse All Listings</span>
            </Link>

            <Link
              to={isAuthenticated ? '/tenant/saved' : '#'}
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  openAuth('login');
                }
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px] text-[#FE932C]">favorite_border</span>
              <span>Saved Properties</span>
            </Link>

            <Link
              to="/owner/properties/new"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  openAuth('signup');
                }
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px] text-[#FE932C]">add_business</span>
              <span>List Your Property</span>
            </Link>
          </nav>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/60">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-red-400"
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button fullWidth variant="secondary" onClick={() => openAuth('login')}>
                  Sign In
                </Button>
                <Button fullWidth variant="glass" onClick={() => openAuth('signup')}>
                  Create Account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
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
        className="flex items-center gap-1.5 rounded-full p-0.5 border border-white/20 hover:border-white/50 transition-all cursor-pointer"
      >
        <Avatar name={user.name} size="sm" />
      </button>

      {open && (
        <div
          id="profile-menu"
          className="animate-pop absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-900/10 bg-white py-1.5 shadow-[0_20px_45px_-8px_rgba(11,19,32,0.25)] text-slate-900"
        >
          <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/70">
            <p className="truncate text-sm font-bold text-[#0B1320]">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <div className="mt-1.5">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                {user.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(dashboardPath(user.role));
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-amber-50/70 hover:text-[#904D00] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            My Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(
                user.role === 'owner'
                  ? '/owner/profile'
                  : user.role === 'admin'
                    ? '/admin/profile'
                    : '/tenant/profile'
              );
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-amber-50/70 hover:text-[#904D00] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Profile
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(
                user.role === 'owner'
                  ? '/owner/settings'
                  : user.role === 'admin'
                    ? '/admin/settings'
                    : '/tenant/settings'
              );
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-amber-50/70 hover:text-[#904D00] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>

          <div className="my-1.5 h-px bg-slate-100" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-[#BA1A1A] hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

