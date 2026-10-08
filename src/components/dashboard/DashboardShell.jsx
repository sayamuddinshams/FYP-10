import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import Dropdown from '../common/Dropdown';
import { cn } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useUnreadNotifications } from '../../hooks';

/**
 * Shared shell for tenant / owner / admin dashboards.
 * navGroups: [{ title, items: [{ to, label, icon, badge }] }]
 */
export default function DashboardShell({ navGroups, children, brandLabel }) {
  const { user, logout } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unread = useUnreadNotifications();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  async function handleLogout() {
    await logout();
    toast.info('You have been signed out.', 'Logged out');
  }

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 thin-scrollbar">
      {navGroups.map((group) => (
        <div key={group.title}>
          {group.title && (
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">{group.title}</p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_4px_12px_-6px_rgba(0,0,0,.4)]'
                        : 'text-white/60 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full bg-[linear-gradient(180deg,#9db8de,#4b74b4)] shadow-[0_0_10px_rgba(157,184,222,.6)]"
                        />
                      )}
                      <Icon
                        name={item.icon}
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          isActive ? 'text-brand-200' : 'opacity-70 group-hover:opacity-100'
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white ring-2 ring-brand-950/40">
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

  const brand = (
    <div className="relative flex items-center gap-3 px-5 py-5">
      <span
        aria-hidden="true"
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(140deg,#ffffff,#dbe6f5)] text-brand-900 shadow-[0_4px_14px_-4px_rgba(0,0,0,.5)]">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent" />
        <Icon name="home" className="relative h-5 w-5" strokeWidth={2} />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight text-white">
          Rent<span className="text-brand-300">Link</span>
        </p>
        <p className="text-[11px] font-medium tracking-wide text-white/45 capitalize">{brandLabel} portal</p>
      </div>
    </div>
  );

  const userCard = (
    <div className="border-t border-white/10 p-3">
      <Dropdown
        align="left"
        className="w-full"
        panelClassName="bottom-full mb-2 left-0 right-auto"
        ariaLabel="Account menu"
        trigger={
          <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5">
            <Avatar name={user?.name} size="sm" className="bg-white/15 text-white ring-1 ring-white/20" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-white/45 capitalize">{brandLabel}</p>
            </div>
            <Icon name="chevronDown" className="h-4 w-4 text-white/45" />
          </div>
        }
        items={[
          { label: 'Profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: () => window.location.assign(`/${user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant'}/profile`) },
          { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: () => window.location.assign(`/${user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant'}/settings`) },
          '-',
          { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
        ]}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden bg-brand-950 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(75,116,180,.22),transparent_65%)]"
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          {brand}
          {nav}
          {userCard}
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', drawerOpen ? '' : 'pointer-events-none')}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn('absolute inset-0 bg-slate-950/50 transition-opacity duration-300', drawerOpen ? 'opacity-100' : 'opacity-0')}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-hidden bg-brand-950 shadow-2xl transition-transform duration-300',
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(75,116,180,.22),transparent_65%)]"
          />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute top-4 right-3 z-10 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
          <div className="relative flex min-h-0 flex-1 flex-col">
            {brand}
            {nav}
            {userCard}
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-17 items-center justify-between gap-3 border-b border-line/80 bg-white/85 px-4 shadow-[0_1px_2px_rgba(16,25,43,.03)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-line bg-white p-2 text-slate-600 shadow-soft transition-all duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex lg:hidden">
              <span className="font-semibold text-slate-900">RentLink</span>
            </div>
            <div className="hidden items-center gap-2.5 lg:flex">
              <span className="rounded-lg bg-[linear-gradient(135deg,#f1f5fb,#e2eaf6)] px-2.5 py-1 text-xs font-bold tracking-wide text-brand-700 ring-1 ring-brand-100">
                {brandLabel} portal
              </span>
              <span className="text-sm text-slate-400">Manage your rentals in one place</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                if (!user) openAuth('login');
                else window.location.assign(`/${user.role === 'owner' ? 'owner' : user.role === 'admin' ? 'admin' : 'tenant'}/notifications`);
              }}
              aria-label="Notifications"
              className="relative rounded-xl p-2 text-slate-500 transition-all duration-200 hover:-translate-y-px hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon name="bell" className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-red-500 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <Dropdown
              ariaLabel="Profile menu"
              trigger={
                <button type="button" className="flex items-center gap-2 rounded-xl p-1 transition-all duration-200 hover:bg-slate-100" aria-label="Open profile menu">
                  <Avatar name={user?.name} size="sm" />
                  <Icon name="chevronDown" className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
              }
              items={[
                { label: 'My profile', icon: <Icon name="user" className="h-4 w-4" />, onClick: () => window.location.assign(`/${user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant'}/profile`) },
                { label: 'Settings', icon: <Icon name="settings" className="h-4 w-4" />, onClick: () => window.location.assign(`/${user?.role === 'owner' ? 'owner' : user?.role === 'admin' ? 'admin' : 'tenant'}/settings`) },
                '-',
                { label: 'Log out', icon: <Icon name="logout" className="h-4 w-4" />, onClick: handleLogout, tone: 'danger' },
              ]}
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
