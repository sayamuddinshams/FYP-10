import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatVisit(v) {
  if (!v) return null;
  return {
    ...v,
    property: v.property
      ? {
          id: v.property.id,
          title: v.property.title,
          image: v.property.images?.[0]?.url || null,
          price: v.property.price,
          district: v.property.district,
          city: v.property.city,
          area: v.property.area,
          location: `${v.property.area}, ${v.property.city}`,
        }
      : null,
    tenant: v.tenant
      ? {
          id: v.tenant.id,
          name: v.tenant.name,
          email: v.tenant.email,
          phone: v.tenant.phone,
          verification: v.tenant.verification,
          avatar: v.tenant.avatar,
        }
      : null,
    owner: v.owner
      ? {
          id: v.owner.id,
          name: v.owner.name,
          verification: v.owner.verification,
          phone: v.owner.phone,
        }
      : null,
  };
}

export async function createVisit(req, res, next) {
  try {
    const { propertyId, date, time, message = '' } = req.body;
    const tenantId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (property.ownerId === tenantId) {
      return errorResponse(res, 'You cannot schedule a visit to your own property.', 400);
    }

    const visit = await prisma.visitRequest.create({
      data: {
        propertyId,
        tenantId,
        ownerId: property.ownerId,
        date,
        time,
        status: 'pending',
        message: message || '',
      },
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        tenant: true,
        owner: true,
      },
    });

    // Create notification for owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'visit_request',
        title: 'New Visit Request',
        body: `${req.user.name} requested to visit "${property.title}" on ${date} at ${time}.`,
        link: '/owner/visits',
      },
    });

    return successResponse(res, formatVisit(visit), 'Visit request submitted successfully.', 201);
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

    const visits = await prisma.visitRequest.findMany({
      where,
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        tenant: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, visits.map(formatVisit));
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

    const visits = await prisma.visitRequest.findMany({
      where,
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        tenant: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, visits.map(formatVisit));
  } catch (error) {
    next(error);
  }
}

export async function getVisitById(req, res, next) {
  try {
    const { id } = req.params;
    const visit = await prisma.visitRequest.findUnique({
      where: { id },
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        tenant: true,
        owner: true,
      },
    });

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

    return successResponse(res, formatVisit(visit));
  } catch (error) {
    next(error);
  }
}

export async function updateVisitStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, ownerNote, date, time } = req.body;

    const existing = await prisma.visitRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!existing) {
      return errorResponse(res, 'Visit request not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'Only the property owner or an admin can update this visit.', 403);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (ownerNote !== undefined) updateData.ownerNote = ownerNote;
    if (date) updateData.date = date;
    if (time) updateData.time = time;

    const updated = await prisma.visitRequest.update({
      where: { id },
      data: updateData,
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        tenant: true,
        owner: true,
      },
    });

    // Notify tenant of the update
    const statusTitles = {
      approved: 'Visit Approved',
      rejected: 'Visit Declined',
      rescheduled: 'Visit Rescheduled',
      completed: 'Visit Marked as Completed',
    };
    const title = statusTitles[status] || 'Visit Request Updated';
    const noteText = ownerNote ? ` Note: "${ownerNote}"` : '';
    const body = `Your visit to "${existing.property?.title}" is now ${status}.${noteText}`;

    await prisma.notification.create({
      data: {
        userId: existing.tenantId,
        type: `visit_${status}`,
        title,
        body,
        link: '/tenant/visits',
      },
    });

    return successResponse(res, formatVisit(updated), 'Visit status updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function cancelVisit(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.visitRequest.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Visit request not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.tenantId !== req.user.id) {
      return errorResponse(res, 'Only the requesting tenant can cancel this visit.', 403);
    }

    await prisma.visitRequest.delete({ where: { id } });
    return successResponse(res, null, 'Visit request cancelled.');
  } catch (error) {
    next(error);
  }
}
