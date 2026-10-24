import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatUser(u, properties = []) {
  if (!u) return null;
  const doc = normalizeDoc(u);
  const { passwordHash, ...rest } = doc;
  const propList = properties || doc.properties || [];

  return {
    ...rest,
    propertyCount: propList.length,
    approvedCount: propList.filter((p) => p.status === 'approved').length,
    properties: propList,
  };
}

async function attachUserProperties(userDocs) {
  if (!userDocs || userDocs.length === 0) return [];
  const userIds = userDocs.map((u) => u.id || u._id.toString());

  const properties = await collections.properties()
    .find({ ownerId: { $in: userIds } }, { projection: { ownerId: 1, status: 1 } })
    .toArray();

  const propMap = new Map();
  for (const p of properties) {
    if (!propMap.has(p.ownerId)) {
      propMap.set(p.ownerId, []);
    }
    propMap.get(p.ownerId).push(p);
  }

  return userDocs.map((u) => {
    const uId = u.id || u._id.toString();
    const userProps = propMap.get(uId) || [];
    return formatUser(u, userProps);
  });
}

export async function getUsers(req, res, next) {
  try {
    const { role, status, query = '', page = 1, limit = 10 } = req.query;

    const where = {};
    if (role && role !== 'all') {
      where.role = role;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    if (query) {
      const q = String(query).trim();
      where.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
      ];
    }

    const take = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [users, total] = await Promise.all([
      collections.users().find(where).sort({ createdAt: -1 }).skip(skip).limit(take).toArray(),
      collections.users().countDocuments(where),
    ]);

    const formatted = await attachUserProperties(users);

    return successResponse(res, {
      items: formatted,
      total,
      page: parseInt(page, 10) || 1,
      limit: take,
      pages: Math.max(1, Math.ceil(total / take)),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOwners(req, res, next) {
  try {
    const owners = await collections.users()
      .find({ role: 'owner' })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await attachUserProperties(owners);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await collections.users().findOne(toIdQuery(id));

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const userId = user.id || user._id.toString();
    const approvedProps = await collections.properties()
      .find({ ownerId: userId, status: 'approved' })
      .toArray();

    return successResponse(res, formatUser(user, approvedProps));
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await collections.users().findOne(toIdQuery(id));
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Admin accounts cannot be suspended.', 400);
    }

    await collections.users().updateOne(
      toIdQuery(id),
      { $set: { status, updatedAt: new Date() } }
    );

    const updated = await collections.users().findOne(toIdQuery(id));
    const userProps = await collections.properties()
      .find({ ownerId: updated.id || updated._id.toString() })
      .toArray();

    return successResponse(res, formatUser(updated, userProps), `User status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
}

export async function updateUserVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { verification } = req.body;

    await collections.users().updateOne(
      toIdQuery(id),
      { $set: { verification, updatedAt: new Date() } }
    );

    const updated = await collections.users().findOne(toIdQuery(id));
    if (!updated) {
      return errorResponse(res, 'User not found.', 404);
    }

    const userId = updated.id || updated._id.toString();

    // Notify user of verification status change
    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId,
      type: 'verification',
      title: 'Verification Status Update',
      body: `Your identity verification status has been updated to "${verification}".`,
      link: updated.role === 'owner' ? '/owner/settings' : '/tenant/profile',
      read: false,
      createdAt: new Date(),
    });

    const userProps = await collections.properties()
      .find({ ownerId: userId })
      .toArray();

    return successResponse(res, formatUser(updated, userProps), `Verification set to ${verification}.`);
  } catch (error) {
    next(error);
  }
}

export async function submitCnicVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { cnic, cnicName, cnicDob, cnicExpiry, cnicLifetime, cnicFront, cnicBack } = req.body;

    if (!cnic || !cnicFront || !cnicBack) {
      return errorResponse(res, 'CNIC number and both front and back photos are required.', 400);
    }

    const trackingId = `NADRA-PK-${Math.floor(100000 + Math.random() * 900000)}`;

    const updateFields = {
      cnic: String(cnic).trim(),
      cnicName: String(cnicName || '').trim(),
      cnicDob: cnicDob || '',
      cnicExpiry: cnicLifetime ? 'Lifetime' : (cnicExpiry || ''),
      cnicLifetime: Boolean(cnicLifetime),
      cnicFront,
      cnicBack,
      verification: 'pending',
      nadraStatus: 'pending_sync',
      nadraTrackingId: trackingId,
      verificationSubmittedAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.users().updateOne(
      toIdQuery(id),
      { $set: updateFields }
    );

    const updated = await collections.users().findOne(toIdQuery(id));
    if (!updated) {
      return errorResponse(res, 'User not found.', 404);
    }

    const userId = updated.id || updated._id.toString();

    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId,
      type: 'verification',
      title: 'CNIC Queued for NADRA Verification',
      body: `Your CNIC (${cnic}) has been submitted under tracking ${trackingId} and is queued for NADRA registry cross-reference.`,
      link: '/owner/profile',
      read: false,
      createdAt: new Date(),
    });

    const userProps = await collections.properties()
      .find({ ownerId: userId })
      .toArray();

    return successResponse(res, formatUser(updated, userProps), 'CNIC submitted successfully for NADRA verification.');
  } catch (error) {
    next(error);
  }
}

