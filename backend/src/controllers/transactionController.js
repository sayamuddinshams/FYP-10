import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const PLATFORM_FEE_RATE = 0.05;

function decorateTransaction(t, property = null, tenant = null, owner = null) {
  if (!t) return null;
  const doc = normalizeDoc(t);
  const prop = property || doc.property || null;
  const ten = tenant || doc.tenant || null;
  const own = owner || doc.owner || null;

  return {
    ...doc,
    property: prop
      ? {
          id: prop.id || prop._id?.toString(),
          title: prop.title,
        }
      : null,
    tenant: ten
      ? {
          id: ten.id || ten._id?.toString(),
          name: ten.name,
          email: ten.email,
        }
      : null,
    owner: own
      ? {
          id: own.id || own._id?.toString(),
          name: own.name,
          email: own.email,
        }
      : null,
  };
}

async function populateTransactions(txDocs) {
  if (!txDocs || txDocs.length === 0) return [];

  const propIds = [...new Set(txDocs.map((t) => t.propertyId).filter(Boolean))];
  const userIds = [
    ...new Set([
      ...txDocs.map((t) => t.tenantId).filter(Boolean),
      ...txDocs.map((t) => t.ownerId).filter(Boolean),
    ]),
  ];

  const [properties, users] = await Promise.all([
    collections.properties().find({ $or: [{ id: { $in: propIds } }, { _id: { $in: propIds } }] }).toArray(),
    collections.users().find({ $or: [{ id: { $in: userIds } }, { _id: { $in: userIds } }] }).toArray(),
  ]);

  const propMap = new Map();
  for (const p of properties) {
    propMap.set(p.id || p._id.toString(), p);
  }

  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.id || u._id.toString(), u);
  }

  return txDocs.map((t) => {
    const prop = propMap.get(t.propertyId) || null;
    const ten = userMap.get(t.tenantId) || null;
    const own = userMap.get(t.ownerId) || null;
    return decorateTransaction(t, prop, ten, own);
  });
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

    const items = await collections.transactions()
      .find(where)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await populateTransactions(items);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getOwnerEarningsSummary(req, res, next) {
  try {
    const ownerId = req.user.role === 'admin' && req.query.ownerId ? req.query.ownerId : req.user.id;

    const items = await collections.transactions()
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .toArray();

    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');

    const sum = (arr, key) => arr.reduce((acc, t) => acc + (t[key] || 0), 0);
    const populated = await populateTransactions(items);

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
      transactions: populated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminFinanceSummary(req, res, next) {
  try {
    const items = await collections.transactions()
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const completed = items.filter((t) => t.status === 'completed');
    const pending = items.filter((t) => t.status === 'pending');
    const failed = items.filter((t) => t.status === 'failed');

    const revenue = items.reduce((a, t) => a + (t.amount || 0), 0);
    const fees = completed.reduce((a, t) => a + (t.platformFee || 0), 0);
    const pendingFees = pending.reduce((a, t) => a + (t.platformFee || 0), 0);
    const failedAmount = failed.reduce((a, t) => a + (t.amount || 0), 0);

    const populated = await populateTransactions(items);

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
      items: populated,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const { propertyId, amount } = req.body;
    const tenantId = req.user.id;

    const property = await collections.properties().findOne(toIdQuery(propertyId));
    if (!property) {
      return errorResponse(res, 'Property not found.', 404);
    }

    const numAmount = Number(amount);
    const platformFee = Math.round(numAmount * PLATFORM_FEE_RATE);
    const ownerAmount = numAmount - platformFee;

    const today = new Date();
    const eligibilityDate = new Date();
    eligibilityDate.setDate(today.getDate() + 7);

    const txId = `TXN-${Date.now().toString().slice(-6)}`;
    const newTransaction = {
      _id: txId,
      id: txId,
      propertyId: property.id || property._id.toString(),
      tenantId,
      ownerId: property.ownerId,
      amount: numAmount,
      platformFee,
      ownerAmount,
      status: 'completed',
      payoutStatus: 'pending',
      payoutEligibilityDate: eligibilityDate,
      date: today.toISOString().slice(0, 10),
      createdAt: today,
    };

    await collections.transactions().insertOne(newTransaction);

    // Notify owner
    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId: property.ownerId,
      type: 'transaction_completed',
      title: 'Payment Received',
      body: `You received Rs. ${ownerAmount.toLocaleString()} for "${property.title}".`,
      link: '/owner/earnings',
      read: false,
      createdAt: new Date(),
    });

    const [tenant, owner] = await Promise.all([
      collections.users().findOne(toIdQuery(tenantId)),
      collections.users().findOne(toIdQuery(property.ownerId)),
    ]);

    return successResponse(
      res,
      decorateTransaction(newTransaction, property, tenant, owner),
      'Payment successful.',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updatePayout(req, res, next) {
  try {
    const { id } = req.params;
    const { payoutStatus } = req.body;

    await collections.transactions().updateOne(
      toIdQuery(id),
      { $set: { payoutStatus } }
    );

    const updated = await collections.transactions().findOne(toIdQuery(id));
    if (!updated) {
      return errorResponse(res, 'Transaction not found.', 404);
    }

    const [property, tenant, owner] = await Promise.all([
      collections.properties().findOne(toIdQuery(updated.propertyId)),
      collections.users().findOne(toIdQuery(updated.tenantId)),
      collections.users().findOne(toIdQuery(updated.ownerId)),
    ]);

    return successResponse(res, decorateTransaction(updated, property, tenant, owner), 'Payout status updated.');
  } catch (error) {
    next(error);
  }
}
