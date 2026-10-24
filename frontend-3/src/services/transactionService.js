import { db, getUser } from '../data/store';
import { delay } from './core';
import { PLATFORM_FEE_RATE } from '../utils/constants';

function withFee(amount) {
  const fee = Math.round(Number(amount) * PLATFORM_FEE_RATE);
  return { fee, ownerAmount: Number(amount) - fee };
}

function decorate(transaction) {
  const property = db.properties.find((p) => p.id === transaction.propertyId);
  const tenant = getUser(transaction.tenantId);
  const owner = getUser(transaction.ownerId);
  const { fee, ownerAmount } = withFee(transaction.amount);
  return {
    ...transaction,
    platformFee: fee,
    ownerAmount,
    property: property ? { id: property.id, title: property.title } : null,
    tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
    owner: owner ? { id: owner.id, name: owner.name } : null,
  };
}

const transactionService = {
  async list({ status } = {}) {
    await delay(380);
    let items = db.transactions.map(decorate);
    if (status && status !== 'all') items = items.filter((t) => t.status === status);
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  },

  async listForOwner(ownerId) {
    await delay(360);
    return db.transactions
      .filter((t) => t.ownerId === ownerId)
      .map(decorate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /** Earnings summary for the owner earnings screen. */
  async summarize(ownerId) {
    await delay(320);
    const items = db.transactions.filter((t) => !ownerId || t.ownerId === ownerId).map(decorate);
    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');
    const sum = (arr, key) => arr.reduce((acc, t) => acc + t[key], 0);
    return {
      totalEarnings: sum(completed, 'ownerAmount'),
      grossCompleted: sum(completed, 'amount'),
      pendingAmount: sum(pending, 'amount'),
      failedAmount: sum(failed, 'amount'),
      completedAmount: sum(completed, 'amount'),
      platformFees: sum(completed, 'platformFee'),
      pendingFees: sum(pending, 'platformFee'),
      count: items.length,
      rate: PLATFORM_FEE_RATE,
    };
  },

  /** Aggregated totals for the owner dashboard. */
  async ownerSummary(ownerId) {
    await delay(320);
    const properties = db.properties.filter((p) => p.ownerId === ownerId);
    const visits = db.visits.filter((v) => v.ownerId === ownerId);
    const txns = db.transactions.filter((t) => t.ownerId === ownerId);
    const fee = (amount) => Math.round(Number(amount) * PLATFORM_FEE_RATE);
    return {
      totalProperties: properties.length,
      activeListings: properties.filter((p) => p.status === 'approved').length,
      pendingApproval: properties.filter((p) => p.status === 'pending' || p.status === 'changes').length,
      totalViews: properties.reduce((a, p) => a + p.views, 0),
      visitRequests: visits.length,
      pendingVisits: visits.filter((v) => v.status === 'pending').length,
      earnings: txns.filter((t) => t.status === 'completed').reduce((a, t) => a + (t.amount - fee(t.amount)), 0),
    };
  },

  /** Platform-wide finance summary for the admin dashboard. */
  async adminSummary() {
    await delay(320);
    const items = db.transactions.map(decorate);
    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');
    return {
      revenue: items.reduce((a, t) => a + t.amount, 0),
      fees: completed.reduce((a, t) => a + t.platformFee, 0),
      pendingFees: pending.reduce((a, t) => a + t.platformFee, 0),
      failed: failed.reduce((a, t) => a + t.amount, 0),
      count: items.length,
      completed: completed.length,
      pending: pending.length,
      failedCount: failed.length,
      rate: PLATFORM_FEE_RATE,
    };
  },
};

export default transactionService;
