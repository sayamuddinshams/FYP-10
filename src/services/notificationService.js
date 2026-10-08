import { db, emit } from '../data/store';
import { delay, fail } from './core';

const notificationService = {
  async list(userId) {
    await delay(280);
    if (!userId) fail('Sign in to view notifications.');
    const items = db.notifications.filter((n) => n.userId === userId);
    items.sort((a, b) => new Date(b.at) - new Date(a.at));
    return items.map((n) => ({ ...n }));
  },

  unreadCount(userId) {
    if (!userId) return 0;
    return db.notifications.filter((n) => n.userId === userId && !n.read).length;
  },

  async markRead(id) {
    await delay(150);
    const note = db.notifications.find((n) => n.id === id);
    if (note) note.read = true;
    emit();
    return true;
  },

  async markAllRead(userId) {
    await delay(250);
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    emit();
    return true;
  },

  async clearAll(userId) {
    await delay(250);
    db.notifications = db.notifications.filter((n) => n.userId !== userId);
    emit();
    return true;
  },
};

export default notificationService;
