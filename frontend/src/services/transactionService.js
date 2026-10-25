import api from './api';
import { PLATFORM_FEE_RATE } from '../utils/constants';

const transactionService = {
  async list({ status } = {}) {
    const res = await api.get('/transactions/my', {
      status: status && status !== 'all' ? status : undefined,
    });
    return res?.items || (Array.isArray(res) ? res : []);
  },

  async listForOwner(ownerId) {
    const res = await api.get('/transactions/my');
    return res?.items || (Array.isArray(res) ? res : []);
  },

  /** Earnings summary for the owner earnings screen. */
  async summarize(ownerId) {
    const data = await api.get('/transactions/owner-summary', {
      ownerId: ownerId || undefined,
    });
    return (
      data || {
        totalEarnings: 0,
        grossCompleted: 0,
        pendingAmount: 0,
        failedAmount: 0,
        completedAmount: 0,
        platformFees: 0,
        pendingFees: 0,
        count: 0,
        rate: PLATFORM_FEE_RATE,
        transactions: [],
      }
    );
  },

  /** Aggregated totals for the owner dashboard. */
  async ownerSummary(ownerId) {
    try {
      const [earnings, props] = await Promise.all([
        this.summarize(ownerId),
        api.get('/properties/my'),
      ]);

      const properties = Array.isArray(props) ? props : [];
      return {
        totalProperties: properties.length,
        activeListings: properties.filter((p) => p.status === 'approved').length,
        pendingApproval: properties.filter((p) => p.status === 'pending' || p.status === 'changes').length,
        totalViews: properties.reduce((a, p) => a + (p.views || 0), 0),
        visitRequests: properties.reduce((a, p) => a + (p._count?.visits || 0), 0),
        pendingVisits: 0,
        earnings: earnings.totalEarnings || 0,
      };
    } catch {
      return {
        totalProperties: 0,
        activeListings: 0,
        pendingApproval: 0,
        totalViews: 0,
        visitRequests: 0,
        pendingVisits: 0,
        earnings: 0,
      };
    }
  },

  /** Platform-wide finance summary for the admin dashboard. */
  async adminSummary() {
    const data = await api.get('/transactions/admin-summary');
    return (
      data || {
        revenue: 0,
        fees: 0,
        pendingFees: 0,
        failed: 0,
        count: 0,
        completed: 0,
        pending: 0,
        failedCount: 0,
        rate: PLATFORM_FEE_RATE,
        transactions: [],
      }
    );
  },
};

export default transactionService;
