import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell';
import { useUnreadNotifications } from '../hooks';

export default function TenantLayout() {
  const unread = useUnreadNotifications();

  return (
    <DashboardShell
      brandLabel="Tenant"
      navGroups={[
        { title: 'Overview', items: [{ to: '/tenant/dashboard', label: 'Overview', icon: 'gauge' }] },
        {
          title: 'Property hunting',
          items: [
            { to: '/tenant/saved', label: 'Saved Properties', icon: 'heart' },
            { to: '/tenant/visits', label: 'Visit Requests', icon: 'calendar' },
            { to: '/tenant/messages', label: 'Messages', icon: 'chat' },
          ],
        },
        {
          title: 'Account',
          items: [
            { to: '/tenant/notifications', label: 'Notifications', icon: 'bell', badge: unread },
            { to: '/tenant/profile', label: 'Profile', icon: 'user' },
            { to: '/tenant/settings', label: 'Settings', icon: 'settings' },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
