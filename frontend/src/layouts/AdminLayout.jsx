import { Outlet } from 'react-router-dom';
import DashboardShell from '../components/dashboard/DashboardShell';
import { useUnreadNotifications } from '../hooks';

export default function AdminLayout() {
  const unread = useUnreadNotifications();

  return (
    <DashboardShell
      brandLabel="Admin"
      navGroups={[
        { title: 'Overview', items: [{ to: '/admin/dashboard', label: 'Overview', icon: 'gauge' }] },
        {
          title: 'Management',
          items: [
            { to: '/admin/users', label: 'Users', icon: 'users' },
            { to: '/admin/owners', label: 'Owners', icon: 'user' },
            { to: '/admin/properties', label: 'Properties', icon: 'building' },
            { to: '/admin/properties?status=pending', label: 'Property Reviews', icon: 'file' },
            { to: '/admin/visits', label: 'Visit Requests', icon: 'calendar' },
            { to: '/admin/reports', label: 'Reviews & Reports', icon: 'flag' },
          ],
        },
        {
          title: 'Finance',
          items: [
            { to: '/admin/transactions', label: 'Transactions', icon: 'coins' },
            { to: '/admin/advertisements', label: 'Advertisements', icon: 'megaphone' },
          ],
        },
        {
          title: 'Insights',
          items: [
            { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
            { to: '/admin/notifications', label: 'Notifications', icon: 'bell', badge: unread },
            { to: '/admin/profile', label: 'Profile', icon: 'user' },
            { to: '/admin/settings', label: 'Settings', icon: 'settings' },
          ],
        },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
