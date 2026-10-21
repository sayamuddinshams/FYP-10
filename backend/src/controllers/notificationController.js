import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return successResponse(res, {
      items: notifications.map((n) => ({
        ...n,
        at: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 404);
    }

    if (notification.userId !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return successResponse(res, updated, 'Marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 404);
    }

    if (notification.userId !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await prisma.notification.delete({ where: { id } });
    return successResponse(res, null, 'Notification removed.');
  } catch (error) {
    next(error);
  }
}
