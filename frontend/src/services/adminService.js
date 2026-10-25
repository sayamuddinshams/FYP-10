import api from './api';
import { emit, fail } from './core';

const adminService = {
  /** Platform overview statistics used by the admin dashboard. */
  async overview() {
    const data = await api.get('/admin/overview');
    return (
      data || {
        totalUsers: 0,
        totalOwners: 0,
        totalProperties: 0,
        pendingProperties: 0,
        activeListings: 0,
        visitRequests: 0,
        platformRevenue: 0,
        grossValue: 0,
        openReports: 0,
        suspendedUsers: 0,
      }
    );
  },

  async counts() {
    const data = await api.get('/admin/counts');
    return (
      data || {
        users: 0,
        properties: 0,
        pending: 0,
        reports: 0,
        visits: 0,
      }
    );
  },

  /** Full analytics dataset for the admin analytics screen. */
  async analytics() {
    try {
      const [overview, finance] = await Promise.all([
        this.overview(),
        api.get('/transactions/admin-summary'),
      ]);
      return {
        overview,
        finance,
      };
    } catch {
      return {};
    }
  },

  /* ---------------- reports ---------------- */

  async listReports(status = 'all') {
    const res = await api.get('/reports', {
      status: status !== 'all' ? status : undefined,
    });
    return Array.isArray(res) ? res : [];
  },

  async updateReport(id, status, resolution = '') {
    if (!id) fail('Report ID is required.');
    const updated = await api.patch(`/reports/${id}`, {
      status,
      resolution,
    });
    emit('reports');
    return updated;
  },

  async resolveReport(id, resolution) {
    return this.updateReport(id, 'resolved', resolution);
  },

  async removeReport(id, resolution) {
    return this.updateReport(id, 'dismissed', resolution);
  },

  /* ---------------- platform settings ---------------- */

  async getSettings() {
    try {
      const settings = await api.get('/admin/settings');
      return (
        settings || {
          platformName: 'RentLink',
          supportEmail: 'support@rentlink.pk',
          supportPhone: '+92 5811 456789',
          platformFee: 5,
          autoApprove: false,
          requireVerification: true,
          maintenanceMode: false,
          visitWindowDays: 14,
          maxImagesPerListing: 8,
        }
      );
    } catch {
      return {
        platformName: 'RentLink',
        supportEmail: 'support@rentlink.pk',
        platformFee: 5,
      };
    }
  },

  async saveSettings(settings) {
    const updated = await api.put('/admin/settings', settings);
    emit('settings');
    return updated;
  },
};

export default adminService;
