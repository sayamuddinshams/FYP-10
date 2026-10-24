import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications = await collections.notifications()
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const items = notifications.map((n) => {
      const doc = normalizeDoc(n);
      const createdAt = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString());
      return {
        ...doc,
        at: createdAt,
      };
    });

    const unreadCount = items.filter((n) => !n.read).length;

    return successResponse(res, {
      items,
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

    const notification = await collections.notifications().findOne(toIdQuery(id));
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 404);
    }

    if (notification.userId !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await collections.notifications().updateOne(toIdQuery(id), { $set: { read: true } });
    const updated = await collections.notifications().findOne(toIdQuery(id));

    return successResponse(res, normalizeDoc(updated), 'Marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await collections.notifications().updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await collections.notifications().findOne(toIdQuery(id));
    if (!notification) {
      return errorResponse(res, 'Notification not found.', 404);
    }

    if (notification.userId !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await collections.notifications().deleteOne(toIdQuery(id));
    return successResponse(res, null, 'Notification removed.');
  } catch (error) {
    next(error);
  }
}
