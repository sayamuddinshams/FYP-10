import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import TenantLayout from '../layouts/TenantLayout';
import OwnerLayout from '../layouts/OwnerLayout';
import AdminLayout from '../layouts/AdminLayout';
import RequireAuth from './RequireAuth';

import Home from '../pages/public/Home';
import Browse from '../pages/public/Browse';
import PropertyDetails from '../pages/public/PropertyDetails';
import About from '../pages/public/About';
import Story from '../pages/public/Story';
import Collaborations from '../pages/public/Collaborations';
import Team from '../pages/public/Team';
import Advertisements from '../pages/public/Advertisements';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';

import TenantDashboard from '../pages/tenant/Dashboard';
import TenantSaved from '../pages/tenant/Saved';
import TenantVisits from '../pages/tenant/Visits';
import TenantMessages from '../pages/tenant/Messages';
import TenantNotifications from '../pages/tenant/Notifications';
import TenantProfile from '../pages/tenant/Profile';
import TenantSettings from '../pages/tenant/Settings';

import OwnerDashboard from '../pages/owner/Dashboard';
import OwnerProperties from '../pages/owner/Properties';
import AddProperty from '../pages/owner/AddProperty';
import OwnerPropertyDetail from '../pages/owner/PropertyDetail';
import EditProperty from '../pages/owner/EditProperty';
import OwnerVisits from '../pages/owner/Visits';
import OwnerMessages from '../pages/owner/Messages';
import OwnerEarnings from '../pages/owner/Earnings';
import OwnerNotifications from '../pages/owner/Notifications';
import OwnerProfile from '../pages/owner/Profile';
import OwnerSettings from '../pages/owner/Settings';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminOwners from '../pages/admin/Owners';
import AdminProperties from '../pages/admin/Properties';
import AdminPropertyReview from '../pages/admin/PropertyReview';
import AdminVisits from '../pages/admin/Visits';
import AdminReports from '../pages/admin/Reports';
import AdminTransactions from '../pages/admin/Transactions';
import AdminAdvertisements from '../pages/admin/Advertisements';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminNotifications from '../pages/admin/Notifications';
import AdminProfile from '../pages/admin/Profile';
import AdminSettings from '../pages/admin/Settings';

import NotFound from '../pages/public/NotFound';

/**
 * Application Routing Table
 * -------------------------
 * Maps URL paths to page components, structured into four main domains:
 *  1. Public Routes: Accessible to any visitor (Home, Browse, Details, About, etc.)
 *  2. Tenant Routes: Protected space for renters to track visits, saved homes, and messages
 *  3. Owner Routes: Protected space for landlords/property managers to list and manage properties
 *  4. Admin Routes: Protected back-office for platform oversight, moderation, reports, and analytics
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ========================================================================= */}
      {/* 1. PUBLIC ROUTES (Wrapped in PublicLayout with header, navigation & footer) */}
      {/* ========================================================================= */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="property/:id" element={<PropertyDetails />} />
        <Route path="about" element={<About />} />
        <Route path="story" element={<Story />} />
        <Route path="collaborations" element={<Collaborations />} />
        <Route path="team" element={<Team />} />
        <Route path="advertisements" element={<Advertisements />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        {/* Catch-all route for invalid or missing URLs */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ========================================================================= */}
      {/* 2. TENANT ROUTES (Requires authentication; accessible to tenants & owners)  */}
      {/* ========================================================================= */}
      <Route
        path="tenant"
        element={
          <RequireAuth allowedRoles={['tenant', 'owner']}>
            <TenantLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<RequireAuth role="tenant"><TenantDashboard /></RequireAuth>} />
        <Route path="saved" element={<TenantSaved />} />
        <Route path="visits" element={<RequireAuth role="tenant"><TenantVisits /></RequireAuth>} />
        <Route path="messages" element={<RequireAuth role="tenant"><TenantMessages /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth role="tenant"><TenantNotifications /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth role="tenant"><TenantProfile /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth role="tenant"><TenantSettings /></RequireAuth>} />
        <Route index element={<Navigate to="/tenant/dashboard" replace />} />
      </Route>

      {/* ========================================================================= */}
      {/* 3. OWNER / LANDLORD ROUTES (Requires role="owner")                          */}
      {/* ========================================================================= */}
      <Route
        path="owner"
        element={
          <RequireAuth allowedRoles={['owner']}>
            <OwnerLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="properties" element={<OwnerProperties />} />
        <Route path="properties/new" element={<AddProperty />} />
        <Route path="properties/:id" element={<OwnerPropertyDetail />} />
        <Route path="properties/:id/edit" element={<EditProperty />} />
        <Route path="visits" element={<OwnerVisits />} />
        <Route path="messages" element={<OwnerMessages />} />
        <Route path="earnings" element={<OwnerEarnings />} />
        <Route path="notifications" element={<OwnerNotifications />} />
        <Route path="profile" element={<OwnerProfile />} />
        <Route path="settings" element={<OwnerSettings />} />
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
      </Route>

      {/* ========================================================================= */}
      {/* 4. PLATFORM ADMIN ROUTES (Requires role="admin")                           */}
      {/* ========================================================================= */}
      <Route
        path="admin"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/:id/review" element={<AdminPropertyReview />} />
        <Route path="visits" element={<AdminVisits />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="advertisements" element={<AdminAdvertisements />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
