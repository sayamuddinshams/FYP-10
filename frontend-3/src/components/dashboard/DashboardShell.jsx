import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import Dropdown from '../common/Dropdown';
import { cn } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useUnreadNotifications } from '../../hooks';

/**
 * Alpine Sanctuary Dashboard Shell
 * Unified portal shell for Tenant, Owner, and Admin workflows.
 * Visual language: Alpine Deep Slate (#0B1320) navigation structure,
 * warm Karakoram Amber (#D97706) active accents, Emerald Sage (#059669) verified beacons,
 * and Glacial Mist (#F8FAFC) canvas with elevated Crisp Snow cards.
 */
export default function DashboardShell({ navGroups, children, brandLabel }) {
  const { user, logout } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const drawerRef = useRef(null);
  const drawerWasOpen = useRef(false);
  const hamburgerRef = useRef(null);
  const unread = useUnreadNotifications();

  const baseRole = user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant';
  const goProfile = () => navigate(`/${baseRole}/profile`);
  const goSettings = () => navigate(`/${baseRole}/settings`);
  const goNotifications = () => navigate(`/${baseRole}/notifications`);

  const flatNav = useMemo(
    () => navGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title || '' }))),
    [navGroups]
  );
  const matches = query.trim()
    ? flatNav.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Drawer accessibility controls
  useEffect(() => {
    if (!drawerOpen) {
      if (drawerWasOpen.current) hamburgerRef.current?.focus?.();
      drawerWasOpen.current = false;
      return undefined;
    }
    drawerWasOpen.current = true;
    const panel = drawerRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []
      ).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerOpen(false);
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
  }, [drawerOpen]);

  async function handleLogout() {
    await logout();
    toast.info('You have been signed out from the portal.', 'Logged out');
  }

  function handleSearchKey(e) {
    if (e.key === 'Enter' && matches[0]) {
      e.preventDefault();
      navigate(matches[0].to);
      setQuery('');
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setQuery('');
      e.currentTarget.blur();
    }
  }

  const itemClass = ({ isActive }) =>
    cn(
      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
      isActive
        ? 'bg-amber-500/15 font-semibold text-amber-400 ring-1 ring-amber-500/30'
        : 'font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white'
    );

  const nav = (label) => (
    <nav aria-label={label} className="flex-1 space-y-6 overflow-y-auto px-4 py-5 thin-scrollbar">
      {navGroups.map((group, groupIndex) => (
        <div key={group.title || groupIndex}>
          {group.title && (
            <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">
              {group.title}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        name={item.icon}
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge > 0 && (
                        <span
                          className={cn(
                            'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold',
                            isActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brandLockup = (
    <div className="border-b border-slate-800/80 px-5 py-5">
      <Link to="/" className="flex items-center gap-3 group" aria-label="RentLink home">
        <span
          aria-hidden="true"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">landscape</span>
        </span>
        <div className="leading-tight">
          <p className="text-[16px] font-serif font-bold tracking-tight text-white">
            Rent<span className="text-amber-400">Link</span>
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              {brandLabel} Portal
            </p>
          </div>
        </div>
      </Link>
    </div>
  );

  const userCard = (
    <div className="border-t border-slate-800/80 p-3 bg-[#0B1320]/60">
      <Dropdown
        align="left"
        className="w-full"
        ariaLabel="Account menu"
        trigger={
          <div className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-800/70 cursor-pointer">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'Guest User'}</p>
              <p className="truncate text-xs text-amber-400/90 capitalize">{brandLabel} Desk</p>
            </div>
            <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
          </div>
        }
        items={[
          { label: 'Public Portal', icon: <span className="material-symbols-outlined text-sm">open_in_new</span>, onClick: () => navigate('/') },
          { label: 'Browse Properties', icon: <Icon name="home" className="h-4 w-4" />, onClick: () => navigate('/browse') },
          '-',
          { label: 'Profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: goProfile },
          { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: goSettings },
          '-',
          { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
        ]}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Primary Navigation Sidebar (desktop LG+) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-800/80 bg-[#0B1320] lg:flex">
        <div className="flex min-h-0 flex-1 flex-col">
          {brandLockup}
          {nav('Main')}
          {userCard}
        </div>
      </aside>

      {/* Mobile header bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0B1320] px-4 backdrop-blur-md lg:hidden">
        <Link to="/" className="flex items-center gap-2.5" aria-label="RentLink home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <span className="material-symbols-outlined text-lg">landscape</span>
          </span>
          <span className="font-serif text-lg font-bold tracking-tight text-white">
            Rent<span className="text-amber-400">Link</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (user ? goNotifications() : openAuth('login'))}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-200"
          >
            <Icon name="bell" className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-[#0B1320]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="dashboard-nav"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-200"
          >
            <Icon name="menu" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!drawerOpen}>
          <div
            className="animate-fade-in absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            id="dashboard-nav"
            ref={drawerRef}
            role="dialog"
            aria-modal={drawerOpen || undefined}
            aria-label="Navigation menu"
            className="animate-slide-right absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-hidden bg-[#0B1320] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-3 z-10 rounded-full p-2 text-slate-400 transition-all duration-150 active:scale-90 hover:bg-slate-800 hover:text-white"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            <div className="relative flex min-h-0 flex-1 flex-col">
              {brandLockup}
              {nav('Main menu')}
              {userCard}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar (desktop) */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-xl lg:flex xl:px-8">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="h-[18px] w-[18px]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onKeyDown={handleSearchKey}
              placeholder="Search portal workspaces and records…"
              aria-label="Search dashboard pages"
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pr-4 pl-11 text-sm text-slate-800 shadow-xs outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            {searchOpen && matches.length > 0 && (
              <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {matches.map((match) => (
                  <li key={match.to}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        navigate(match.to);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-amber-700"
                    >
                      <Icon name={match.icon} className="h-4 w-4 text-slate-400" />
                      <span className="flex-1 truncate">{match.label}</span>
                      {match.group && (
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          {match.group}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-amber-300 hover:text-amber-800 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-amber-600">travel_explore</span>
              <span>Browse GB Listings</span>
            </Link>

            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 capitalize xl:inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {brandLabel} Operational
            </span>

            <button
              type="button"
              onClick={() => {
                if (!user) openAuth('login');
                else goNotifications();
              }}
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all duration-150 active:scale-95 hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="bell" className="h-5 w-5" />
              {unread > 0 && (
                <span className="animate-pop absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <Dropdown
              ariaLabel="Profile menu"
              trigger={
                <div
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-2.5 pl-1 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer hover:border-slate-300"
                  aria-label="Open profile menu"
                >
                  <Avatar name={user?.name} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-800 sm:block">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
                </div>
              }
              items={[
                { label: 'Public Website', icon: <span className="material-symbols-outlined text-sm">home</span>, onClick: () => navigate('/') },
                { label: 'My profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: goProfile },
                { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: goSettings },
                '-',
                { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
              ]}
            />
          </div>
        </header>

        {/* Content Viewport */}
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1560px] px-4 pt-20 pb-16 focus:outline-none sm:px-6 lg:px-8 lg:pt-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
