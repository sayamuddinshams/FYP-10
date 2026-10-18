import { db, emit } from '../data/store';
import { delay, fail } from './core';

function decorate(user) {
  const { password, ...rest } = user;
  const properties = db.properties.filter((p) => p.ownerId === user.id);
  return {
    ...rest,
    propertyCount: properties.length,
    approvedCount: properties.filter((p) => p.status === 'approved').length,
  };
}

const userService = {
  async list({ role, status, query = '', page = 1, limit = 8 } = {}) {
    await delay(360);
    let items = db.users.map(decorate);
    if (role && role !== 'all') items = items.filter((u) => u.role === role);
    if (status && status !== 'all') items = items.filter((u) => u.status === status);
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((u) => [u.name, u.email, u.city, u.district].join(' ').toLowerCase().includes(q));
    }
    items.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit).map((u) => ({ ...u, password: undefined })), total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  },

  async listOwners() {
    await delay(360);
    const owners = db.users.filter((u) => u.role === 'owner').map(decorate);
    owners.sort((a, b) => (a.verification === 'verified' ? -1 : 1) - (b.verification === 'verified' ? -1 : 1) || new Date(b.joinedAt) - new Date(a.joinedAt));
    return owners;
  },

  async getById(id) {
    await delay(240);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    return decorate(user);
  },

  async updateProfile(id, data) {
    await delay(500);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    Object.assign(user, data);
    emit();
    return decorate(user);
  },

  async setStatus(id, status) {
    await delay(420);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    if (user.role === 'admin') fail('Admin accounts cannot be suspended.');
    user.status = status;
    emit();
    return decorate(user);
  },

  async setVerification(id, verification) {
    await delay(440);
    const user = db.users.find((u) => u.id === id);
    if (!user) fail('User not found.');
    user.verification = verification;
    emit();
    return decorate(user);
  },
};

export default userService;
