import api from './api';
import { emit } from './core';

let cachedUnreadCount = 0;

const notificationService = {
  async list(userId) {
    try {
      const res = await api.get('/notifications');
      const items = res?.items || (Array.isArray(res) ? res : []);
      cachedUnreadCount = res?.unreadCount !== undefined ? res.unreadCount : items.filter((n) => !n.read).length;
      return items;
    } catch {
      return [];
    }
  },

  unreadCount(userId) {
    return cachedUnreadCount;
  },

  async markRead(id) {
    if (!id) return true;
    try {
      await api.patch(`/notifications/${id}/read`);
      if (cachedUnreadCount > 0) cachedUnreadCount -= 1;
      emit('notifications');
    } catch {
      // non-blocking
    }
    return true;
  },

  async markAllRead(userId) {
    try {
      await api.patch('/notifications/read-all');
      cachedUnreadCount = 0;
      emit('notifications');
    } catch {
      // non-blocking
    }
    return true;
  },

  async clearAll(userId) {
    try {
      cachedUnreadCount = 0;
      emit('notifications');
    } catch {}
    return true;
  },
};

export default notificationService;
