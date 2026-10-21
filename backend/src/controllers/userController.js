import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return {
    ...rest,
    propertyCount: u._count?.properties || 0,
    approvedCount: (u.properties || []).filter((p) => p.status === 'approved').length,
  };
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
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { city: { contains: q } },
        { district: { contains: q } },
      ];
    }

    const take = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: { select: { properties: true } },
          properties: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, {
      items: users.map(formatUser),
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
    const owners = await prisma.user.findMany({
      where: { role: 'owner' },
      include: {
        _count: { select: { properties: true } },
        properties: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, owners.map(formatUser));
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { properties: true } },
        properties: {
          where: { status: 'approved' },
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, formatUser(user));
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Admin accounts cannot be suspended.', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      include: { _count: { select: { properties: true } } },
    });

    return successResponse(res, formatUser(updated), `User status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
}

export async function updateUserVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { verification } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { verification },
      include: { _count: { select: { properties: true } } },
    });

    // Notify user of verification status change
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'verification',
        title: 'Verification Status Update',
        body: `Your identity verification status has been updated to "${verification}".`,
        link: updated.role === 'owner' ? '/owner/settings' : '/tenant/profile',
      },
    });

    return successResponse(res, formatUser(updated), `Verification set to ${verification}.`);
  } catch (error) {
    next(error);
  }
}
