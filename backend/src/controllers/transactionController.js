import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const PLATFORM_FEE_RATE = 0.05;

function decorateTransaction(t) {
  if (!t) return null;
  return {
    ...t,
    property: t.property ? { id: t.property.id, title: t.property.title } : null,
    tenant: t.tenant ? { id: t.tenant.id, name: t.tenant.name, email: t.tenant.email } : null,
    owner: t.owner ? { id: t.owner.id, name: t.owner.name, email: t.owner.email } : null,
  };
}

export async function getMyTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status } = req.query;

    const where = {};
    if (role === 'owner') {
      where.ownerId = userId;
    } else if (role === 'tenant') {
      where.tenantId = userId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const items = await prisma.transaction.findMany({
      where,
      include: {
        property: true,
        tenant: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, items.map(decorateTransaction));
  } catch (error) {
    next(error);
  }
}

export async function getOwnerEarningsSummary(req, res, next) {
  try {
    const ownerId = req.user.role === 'admin' && req.query.ownerId ? req.query.ownerId : req.user.id;

    const items = await prisma.transaction.findMany({
      where: { ownerId },
      include: { property: true, tenant: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });

    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');

    const sum = (arr, key) => arr.reduce((acc, t) => acc + (t[key] || 0), 0);

    return successResponse(res, {
      totalEarnings: sum(completed, 'ownerAmount'),
      grossCompleted: sum(completed, 'amount'),
      pendingAmount: sum(pending, 'amount'),
      failedAmount: sum(failed, 'amount'),
      completedAmount: sum(completed, 'amount'),
      platformFees: sum(completed, 'platformFee'),
      pendingFees: sum(pending, 'platformFee'),
      count: items.length,
      rate: PLATFORM_FEE_RATE,
      transactions: items.map(decorateTransaction),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminFinanceSummary(req, res, next) {
  try {
    const items = await prisma.transaction.findMany({
      include: { property: true, tenant: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });

    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');

    const revenue = items.reduce((a, t) => a + t.amount, 0);
    const fees = completed.reduce((a, t) => a + t.platformFee, 0);
    const pendingFees = pending.reduce((a, t) => a + t.platformFee, 0);
    const failedAmount = failed.reduce((a, t) => a + t.amount, 0);

    return successResponse(res, {
      revenue,
      fees,
      pendingFees,
      failed: failedAmount,
      count: items.length,
      completed: completed.length,
      pending: pending.length,
      failedCount: failed.length,
      rate: PLATFORM_FEE_RATE,
      items: items.map(decorateTransaction),
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const { propertyId, amount } = req.body;
    const tenantId = req.user.id;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return errorResponse(res, 'Property not found.', 404);
    }

    const platformFee = Math.round(Number(amount) * PLATFORM_FEE_RATE);
    const ownerAmount = Number(amount) - platformFee;

    const today = new Date();
    const eligibilityDate = new Date();
    eligibilityDate.setDate(today.getDate() + 7);

    const transaction = await prisma.transaction.create({
      data: {
        propertyId,
        tenantId,
        ownerId: property.ownerId,
        amount: Number(amount),
        platformFee,
        ownerAmount,
        status: 'completed',
        payoutStatus: 'pending',
        payoutEligibilityDate: eligibilityDate,
        date: today.toISOString().slice(0, 10),
      },
      include: { property: true, tenant: true, owner: true },
    });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'transaction_completed',
        title: 'Payment Received',
        body: `You received Rs. ${ownerAmount.toLocaleString()} for "${property.title}".`,
        link: '/owner/earnings',
      },
    });

    return successResponse(res, decorateTransaction(transaction), 'Payment successful.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updatePayout(req, res, next) {
  try {
    const { id } = req.params;
    const { payoutStatus } = req.body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { payoutStatus },
      include: { property: true, tenant: true, owner: true },
    });

    return successResponse(res, decorateTransaction(transaction), 'Payout status updated.');
  } catch (error) {
    next(error);
  }
}
