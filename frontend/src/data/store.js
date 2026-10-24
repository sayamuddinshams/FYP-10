import { MOCK_USERS } from './users';
import { MOCK_PROPERTIES } from './properties';
import { MOCK_VISITS, MOCK_REVIEWS } from './visits';
import { MOCK_CONVERSATIONS } from './messages';
import { MOCK_NOTIFICATIONS } from './notifications';
import { MOCK_TRANSACTIONS, MOCK_ADS, MOCK_REPORTS, MOCK_ANALYTICS } from './platform';

/**
 * In-Memory Mock Database
 * -----------------------
 * RentLink uses this central store to simulate a full backend database (PostgreSQL/Node.js).
 * All UI actions (adding a listing, booking a visit, sending messages, toggling favorites)
 * write directly to this `db` object and call `emit()`.
 *
 * React components listening via `subscribe()` or the `useStoreVersion()` hook
 * will automatically re-render when changes occur, providing full real-time reactivity
 * without requiring an external server during development and evaluation.
 */
const listeners = new Set();

export const db = {
  users: MOCK_USERS.map((u) => ({ ...u })),
  properties: MOCK_PROPERTIES.map((p) => ({ ...p })),
  visits: MOCK_VISITS.map((v) => ({ ...v })),
  reviews: MOCK_REVIEWS.map((r) => ({ ...r })),
  conversations: MOCK_CONVERSATIONS.map((c) => ({ ...c, messages: [...c.messages] })),
  notifications: MOCK_NOTIFICATIONS.map((n) => ({ ...n })),
  transactions: MOCK_TRANSACTIONS.map((t) => ({ ...t })),
  advertisements: MOCK_ADS.map((a) => ({ ...a })),
  reports: MOCK_REPORTS.map((r) => ({ ...r })),
  favorites: {
    u0_tenant: ['p1', 'p2', 'p4', 'p13', 'p16'],
    u1: ['p1', 'p2', 'p4', 'p13', 'p16'],
    u2: ['p2', 'p12', 'p5'],
    u3: ['p13', 'p16', 'p9'],
    u4: ['p3', 'p10', 'p15'],
    u5: [],
    u6: [],
    u7: [],
    u8: [],
    u9: [],
    u10: [],
    u11: [],
  },
  analytics: MOCK_ANALYTICS,
  session: null,
};

let counter = 1000;
let version = 0;

export function getVersion() {
  return version;
}

export function uid(prefix = 'id') {
  counter += 1;
  return `${prefix}${counter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emit() {
  version += 1;
  listeners.forEach((l) => {
    try {
      l();
    } catch (err) {
      // never let a subscriber break the store
      console.error(err);
    }
  });
}

export function getOwner(property) {
  return db.users.find((u) => u.id === property?.ownerId) || null;
}

export function getUser(id) {
  return db.users.find((u) => u.id === id) || null;
}

export function isVerifiedOwner(property) {
  return getOwner(property)?.verification === 'verified';
}
