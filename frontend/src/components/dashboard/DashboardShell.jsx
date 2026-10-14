import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import Dropdown from '../common/Dropdown';
import { cn } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useUnreadNotifications } from '../../hooks';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { variants } from '../../utils/motion';

/**
 * Shared shell for tenant / owner / admin dashboards.
 * navGroups: [{ title, items: [{ to, label, icon, badge, end? }] }]
 *
 * Visual language: "Obsidian & Rose Modern Portal" — porcelain canvas, floating
 * white cards, obsidian typography and vibrant rose accents. The `.dash-theme`
 * wrapper remaps the design tokens for every dashboard utility underneath.
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
  const prefersReducedMotion = useReducedMotion();

  const baseRole = user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant';
  const goProfile = () => navigate(`/${baseRole}/profile`);
  const goSettings = () => navigate(`/${baseRole}/settings`);
  const goNotifications = () => navigate(`/${baseRole}/notifications`);

  // One icon per nav group for the slim utility rail.
  const railItems = useMemo(
    () => navGroups.map((group) => ({ group, item: group.items[0] })).filter((entry) => entry.item),
    [navGroups]
  );
  const flatNav = useMemo(
    () => navGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title || '' }))),
    [navGroups]
  );
  const matches = query.trim()
    ? flatNav.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  const isGroupActive = (group) =>
    group.items.some((item) => {
      const path = String(item.to || '').split(/[?#]/)[0];
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    });

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Drawer: Escape to close, move focus in on open, restore on close, Tab cycles inside.
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
    toast.info('You have been signed out.', 'Logged out');
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
      'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200',
      isActive
        ? 'bg-white font-semibold text-rose-600 shadow-[0_1px_2px_rgba(0,0,0,.05)] ring-1 ring-black/[0.04]'
        : 'font-medium text-zinc-500 hover:bg-black/[0.03] hover:text-zinc-900'
    );

  const nav = (label) => (
    <nav aria-label={label} className="flex-1 space-y-6 overflow-y-auto px-3 py-5 thin-scrollbar">
      {navGroups.map((group, groupIndex) => (
        <motion.div
          key={group.title || groupIndex}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: groupIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {group.title && (
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              {group.title}
            </p>
          )}
          <ul className="ml-2 space-y-1 border-l border-black/[0.06] pl-2">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={itemClass}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        name={item.icon}
                        className={cn(
                          'h-[18px] w-[18px] transition-colors duration-200',
                          isActive ? 'text-rose-600' : 'text-zinc-400 group-hover:text-zinc-600'
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge > 0 && (
                        <span
                          className={cn(
                            'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold',
                            isActive ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-500'
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
        </motion.div>
      ))}
    </nav>
  );

  const brandLockup = (
    <Link to="/" className="flex items-center gap-3 px-5 py-5" aria-label="RentLink home">
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-white shadow-md"
      >
        <Icon name="home" className="relative h-5 w-5" strokeWidth={2} />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight text-zinc-900">
          Rent<span className="text-rose-600">Link</span>
        </p>
        <p className="text-[11px] font-medium tracking-wide text-zinc-500 capitalize">{brandLabel} portal</p>
      </div>
    </Link>
  );

  const userCard = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-black/[0.06] p-3"
    >
      <Dropdown
        align="left"
        className="w-full"
        ariaLabel="Account menu"
        trigger={
          <div className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-black/[0.03]">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-zinc-900">{user?.name}</p>
              <p className="truncate text-xs text-zinc-500 capitalize">{brandLabel}</p>
            </div>
            <Icon name="chevronDown" className="h-4 w-4 text-zinc-400" />
          </div>
        }
        items={[
          { label: 'Profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: goProfile },
          { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: goSettings },
          '-',
          { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
        ]}
      />
    </motion.div>
  );

  const sidebarVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1, x: 0 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 1, x: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 300, delay: 0.1 } },
        exit: { opacity: 0, x: -40, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      };

  const drawerVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1, x: 0 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 1, x: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { opacity: 0, x: -320 },
        animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, x: -320, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      };

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0.01 } }
    : variants.fadeIn;

  return (
    <div className="dash-theme min-h-screen bg-[#f4f4f7] text-zinc-900">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Slim utility rail (desktop XL+) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[68px] flex-col items-center justify-between border-r border-black/[0.06] bg-[#f4f4f7]/80 py-6 xl:flex">
        <div className="flex flex-col items-center gap-6">
          <Link
            to="/"
            aria-label="RentLink home"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-transform hover:scale-105"
          >
            <Icon name="home" className="h-5 w-5" strokeWidth={2} />
          </Link>
          <nav aria-label="Section shortcuts" className="mt-1 flex flex-col items-center gap-1.5">
            {railItems.map(({ group, item }) => {
              const active = isGroupActive(group);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200',
                    active
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                      : 'text-zinc-400 hover:bg-white hover:text-zinc-900'
                  )}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={goSettings}
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900"
          >
            <Icon name="settings" className="h-[18px] w-[18px]" />
          </button>
          <Link to={`/${baseRole}/profile`} aria-label="Your profile" className="rounded-full ring-1 ring-black/10">
            <Avatar name={user?.name} size="sm" />
          </Link>
        </div>
      </aside>

      {/* Navigation tree (desktop LG+) */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial="initial"
          animate="animate"
          exit="exit"
          variants={sidebarVariants}
          className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-black/[0.06] bg-[#f8f8fa]/80 backdrop-blur-sm lg:flex xl:left-[68px]"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            {brandLockup}
            {nav('Main')}
            {userCard}
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Mobile header bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-black/[0.06] bg-white/90 px-5 backdrop-blur-md lg:hidden">
        <Link to="/" className="flex items-center gap-3" aria-label="RentLink home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Icon name="home" className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <span className="text-base font-extrabold tracking-tight text-zinc-900">RentLink</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (user ? goNotifications() : openAuth('login'))}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f7] text-zinc-700"
          >
            <Icon name="bell" className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white">
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f7] text-zinc-700"
          >
            <Icon name="menu" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!drawerOpen}>
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={overlayVariants}
              className="absolute inset-0 bg-zinc-950/50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              id="dashboard-nav"
              ref={drawerRef}
              role="dialog"
              aria-modal={drawerOpen || undefined}
              aria-label="Navigation menu"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={drawerVariants}
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-hidden bg-white shadow-2xl"
            >
              <motion.button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute top-4 right-3 z-10 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <Icon name="x" className="h-5 w-5" />
              </motion.button>
              <div className="relative flex min-h-0 flex-1 flex-col">
                {brandLockup}
                {nav('Main menu')}
                {userCard}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-60 xl:pl-[308px]">
        {/* Top bar (desktop) */}
        <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-black/[0.06] bg-[#f4f4f7]/85 px-6 backdrop-blur-xl lg:flex xl:px-8">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400">
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
              placeholder="Jump to a page or section…"
              aria-label="Search dashboard pages"
              className="w-full rounded-full border border-black/[0.06] bg-white py-2.5 pr-4 pl-11 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-500/20"
            />
            {searchOpen && matches.length > 0 && (
              <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-1.5 shadow-lift">
                {matches.map((match) => (
                  <li key={match.to}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        navigate(match.to);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                    >
                      <Icon name={match.icon} className="h-4 w-4 text-zinc-400" />
                      <span className="flex-1 truncate">{match.label}</span>
                      {match.group && (
                        <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                          {match.group}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-500 capitalize ring-1 ring-black/[0.02] xl:inline-flex">
              {brandLabel} portal
            </span>
            <motion.button
              type="button"
              onClick={() => {
                if (!user) openAuth('login');
                else goNotifications();
              }}
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
            >
              <Icon name="bell" className="h-5 w-5" />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white"
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </motion.button>
            <Dropdown
              ariaLabel="Profile menu"
              trigger={
                <motion.div
                  className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white py-1 pr-2 pl-1 shadow-sm"
                  aria-label="Open profile menu"
                  whileTap={{ scale: 0.96 }}
                >
                  <Avatar name={user?.name} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-semibold text-zinc-800 sm:block">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <Icon name="chevronDown" className="h-4 w-4 text-zinc-400" />
                </motion.div>
              }
              items={[
                { label: 'My profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: goProfile },
                { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: goSettings },
                '-',
                { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
              ]}
            />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1560px] px-4 pt-20 pb-16 focus:outline-none sm:px-6 lg:px-8 lg:pt-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
