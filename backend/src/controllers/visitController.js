import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatVisit(v, property = null, tenant = null, owner = null) {
  if (!v) return null;
  const doc = normalizeDoc(v);
  const prop = property || doc.property || null;
  const ten = tenant || doc.tenant || null;
  const own = owner || doc.owner || null;

  const propImages = Array.isArray(prop?.images) ? prop.images : [];
  const firstImage = propImages.length > 0
    ? (typeof propImages[0] === 'string' ? propImages[0] : propImages[0]?.url || null)
    : null;

  return {
    ...doc,
    property: prop
      ? {
          id: prop.id || prop._id?.toString(),
          title: prop.title,
          image: firstImage,
          price: prop.price,
          district: prop.district,
          city: prop.city,
          area: prop.area,
          location: `${prop.area || ''}, ${prop.city || ''}`,
        }
      : null,
    tenant: ten
      ? {
          id: ten.id || ten._id?.toString(),
          name: ten.name,
          email: ten.email,
          phone: ten.phone || '',
          verification: ten.verification || 'unverified',
          avatar: ten.avatar || null,
        }
      : null,
    owner: own
      ? {
          id: own.id || own._id?.toString(),
          name: own.name,
          verification: own.verification || 'unverified',
          phone: own.phone || '',
        }
      : null,
  };
}

async function populateVisits(visitDocs) {
  if (!visitDocs || visitDocs.length === 0) return [];

  const propIds = [...new Set(visitDocs.map((v) => v.propertyId).filter(Boolean))];
  const userIds = [
    ...new Set([
      ...visitDocs.map((v) => v.tenantId).filter(Boolean),
      ...visitDocs.map((v) => v.ownerId).filter(Boolean),
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

  return visitDocs.map((v) => {
    const prop = propMap.get(v.propertyId) || null;
    const tenant = userMap.get(v.tenantId) || null;
    const owner = userMap.get(v.ownerId) || null;
    return formatVisit(v, prop, tenant, owner);
  });
}

export async function createVisit(req, res, next) {
  try {
    const { propertyId, date, time, message = '' } = req.body;
    const tenantId = req.user.id;

    const property = await collections.properties().findOne(toIdQuery(propertyId));
    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (property.ownerId === tenantId) {
      return errorResponse(res, 'You cannot schedule a visit to your own property.', 400);
    }

    const visitId = new ObjectId().toString();
    const newVisit = {
      _id: visitId,
      id: visitId,
      propertyId: property.id || property._id.toString(),
      tenantId,
      ownerId: property.ownerId,
      date,
      time,
      status: 'pending',
      message: message || '',
      ownerNote: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.visitRequests().insertOne(newVisit);

    // Create notification for owner
    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId: property.ownerId,
      type: 'visit_request',
      title: 'New Visit Request',
      body: `${req.user.name} requested to visit "${property.title}" on ${date} at ${time}.`,
      link: '/owner/visits',
      read: false,
      createdAt: new Date(),
    });

    const owner = await collections.users().findOne(toIdQuery(property.ownerId));
    const tenant = await collections.users().findOne(toIdQuery(tenantId));

    return successResponse(
      res,
      formatVisit(newVisit, property, tenant, owner),
      'Visit request submitted successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getMyVisits(req, res, next) {
  try {
    const { status, role } = req.query;
    const userId = req.user.id;
    const userRole = role || req.user.role;

    const where = {};
    if (userRole === 'owner') {
      where.ownerId = userId;
    } else {
      where.tenantId = userId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const visits = await collections.visitRequests()
      .find(where)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await populateVisits(visits);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getAllVisits(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const visits = await collections.visitRequests()
      .find(where)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await populateVisits(visits);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getVisitById(req, res, next) {
  try {
    const { id } = req.params;
    const visit = await collections.visitRequests().findOne(toIdQuery(id));

    if (!visit) {
      return errorResponse(res, 'Visit request not found.', 404);
    }

    if (
      req.user.role !== 'admin' &&
      visit.tenantId !== req.user.id &&
      visit.ownerId !== req.user.id
    ) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const [property, tenant, owner] = await Promise.all([
      collections.properties().findOne(toIdQuery(visit.propertyId)),
      collections.users().findOne(toIdQuery(visit.tenantId)),
      collections.users().findOne(toIdQuery(visit.ownerId)),
    ]);

    return successResponse(res, formatVisit(visit, property, tenant, owner));
  } catch (error) {
    next(error);
  }
}

export async function updateVisitStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, ownerNote, date, time } = req.body;

    const existing = await collections.visitRequests().findOne(toIdQuery(id));
    if (!existing) {
      return errorResponse(res, 'Visit request not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'Only the property owner or an admin can update this visit.', 403);
    }

    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (ownerNote !== undefined) updateData.ownerNote = ownerNote;
    if (date) updateData.date = date;
    if (time) updateData.time = time;

    await collections.visitRequests().updateOne(toIdQuery(id), { $set: updateData });

    const updated = await collections.visitRequests().findOne(toIdQuery(id));
    const [property, tenant, owner] = await Promise.all([
      collections.properties().findOne(toIdQuery(updated.propertyId)),
      collections.users().findOne(toIdQuery(updated.tenantId)),
      collections.users().findOne(toIdQuery(updated.ownerId)),
    ]);

    // Notify tenant of the update
    const statusTitles = {
      approved: 'Visit Approved',
      rejected: 'Visit Declined',
      rescheduled: 'Visit Rescheduled',
      completed: 'Visit Marked as Completed',
    };
    const title = statusTitles[status] || 'Visit Request Updated';
    const noteText = ownerNote ? ` Note: "${ownerNote}"` : '';
    const body = `Your visit to "${property?.title || 'property'}" is now ${status}.${noteText}`;

    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId: existing.tenantId,
      type: `visit_${status}`,
      title,
      body,
      link: '/tenant/visits',
      read: false,
      createdAt: new Date(),
    });

    return successResponse(res, formatVisit(updated, property, tenant, owner), 'Visit status updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function cancelVisit(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await collections.visitRequests().findOne(toIdQuery(id));

    if (!existing) {
      return errorResponse(res, 'Visit request not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.tenantId !== req.user.id) {
      return errorResponse(res, 'Only the requesting tenant can cancel this visit.', 403);
    }

    await collections.visitRequests().deleteOne(toIdQuery(id));
    return successResponse(res, null, 'Visit request cancelled.');
  } catch (error) {
    next(error);
  }
}
