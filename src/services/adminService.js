import { db, emit, getUser } from '../data/store';
import { delay, fail, createNotification } from './core';

function decorate(report) {
  const reporter = getUser(report.reporterId);
  return {
    ...report,
    reporter: reporter ? { id: reporter.id, name: reporter.name, role: reporter.role } : null,
  };
}

const adminService = {
  /** Platform overview statistics used by the admin dashboard. */
  async overview() {
    await delay(400);
    const users = db.users;
    const properties = db.properties;
    const approved = properties.filter((p) => p.status === 'approved');
    const pending = properties.filter((p) => p.status === 'pending');
    const completedTransactions = db.transactions.filter((t) => t.status === 'completed');
    const revenue = completedTransactions.reduce((a, t) => a + t.amount, 0);
    const fees = completedTransactions.reduce((a, t) => a + Math.round(t.amount * 0.05), 0);

    return {
      totalUsers: users.filter((u) => u.role === 'tenant').length + 1320,
      totalOwners: users.filter((u) => u.role === 'owner').length + 96,
      totalProperties: properties.length + 264,
      pendingProperties: pending.length,
      activeListings: approved.length + 198,
      visitRequests: db.visits.length + 158,
      platformRevenue: fees,
      grossValue: revenue,
      openReports: db.reports.filter((r) => r.status === 'open').length,
      suspendedUsers: users.filter((u) => u.status === 'suspended').length,
    };
  },

  async counts() {
    await delay(200);
    return {
      users: db.users.length,
      properties: db.properties.length,
      pending: db.properties.filter((p) => p.status === 'pending').length,
      reports: db.reports.filter((r) => r.status === 'open').length,
      visits: db.visits.length,
    };
  },

  /** Full analytics dataset for the admin analytics screen. */
  async analytics() {
    await delay(380);
    return db.analytics;
  },

  /* ---------------- reports ---------------- */

  async listReports(status = 'all') {
    await delay(360);
    let items = db.reports.map(decorate);
    if (status !== 'all') items = items.filter((r) => r.status === status);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items;
  },

  async updateReport(id, status, resolution = '') {
    await delay(500);
    const report = db.reports.find((r) => r.id === id);
    if (!report) fail('Report not found.');
    report.status = status;
    if (resolution) report.resolution = resolution;
    emit();
    return decorate(report);
  },

  async resolveReport(id, resolution) {
    return this.updateReport(id, 'resolved', resolution);
  },

  async removeReport(id, resolution) {
    return this.updateReport(id, 'removed', resolution);
  },

  /* ---------------- platform settings ---------------- */

  async getSettings() {
    await delay(300);
    return {
      platformName: 'RentLink',
      supportEmail: 'support@rentlink.pk',
      supportPhone: '+92 5811 456789',
      platformFee: 5,
      autoApprove: false,
      requireVerification: true,
      maintenanceMode: false,
      visitWindowDays: 14,
      maxImagesPerListing: 8,
    };
  },

  async saveSettings(settings) {
    await delay(600);
    emit();
    return settings;
  },
};

export default adminService;
