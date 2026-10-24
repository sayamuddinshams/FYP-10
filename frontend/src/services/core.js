import { db, emit, getUser } from '../data/store';

/** Simulated network latency so loading states are real. */
export function delay(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ServiceError extends Error {}

export function fail(message) {
  throw new ServiceError(message);
}

export function createNotification({ userId, type, title, body, link }) {
  if (!userId || userId === 'system') return null;
  const note = {
    id: `n_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    type,
    title,
    body,
    link,
    at: new Date().toISOString(),
    read: false,
  };
  db.notifications.unshift(note);
  return note;
}

export function notifyOwnerOfProperty(propertyId, payload) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return;
  createNotification({ ...payload, userId: property.ownerId });
}

export { emit, getUser };
