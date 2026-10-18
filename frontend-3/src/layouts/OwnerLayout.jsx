import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell';
import { useUnreadNotifications } from '../hooks';

export default function OwnerLayout() {
  const unread = useUnreadNotifications();

  return (
    <DashboardShell
      brandLabel="Owner / Agent"
      navGroups={[
        { title: 'Overview', items: [{ to: '/owner/dashboard', label: 'Overview', icon: 'gauge' }] },
        {
          title: 'Listings',
          items: [
            { to: '/owner/properties', label: 'My Properties', icon: 'building' },
            { to: '/owner/properties/new', label: 'Add Property', icon: 'plus' },
            { to: '/owner/visits', label: 'Visit Requests', icon: 'calendar' },
          ],
        },
        {
          title: 'Business',
          items: [
            { to: '/owner/messages', label: 'Messages', icon: 'chat' },
            { to: '/owner/earnings', label: 'Earnings', icon: 'wallet' },
          ],
        },
        {
          title: 'Account',
          items: [
            { to: '/owner/notifications', label: 'Notifications', icon: 'bell', badge: unread },
            { to: '/owner/profile', label: 'Profile', icon: 'user' },
            { to: '/owner/settings', label: 'Settings', icon: 'settings' },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
