import api from './api';
import { emit, fail } from './core';
import { saveSession, readSession } from './authService';

const userService = {
  async list({ role, status, query = '', page = 1, limit = 8 } = {}) {
    const params = {
      page,
      limit,
    };
    if (role && role !== 'all') params.role = role;
    if (status && status !== 'all') params.status = status;
    if (query) params.query = query;

    const res = await api.get('/users', params);
    return {
      items: res?.items || (Array.isArray(res) ? res : []),
      total: res?.total || 0,
      page: res?.page || page,
      pages: res?.pages || 1,
    };
  },

  async listOwners() {
    const res = await api.get('/users/owners');
    return Array.isArray(res) ? res : [];
  },

  async getById(id) {
    if (!id) fail('User ID is required.');
    return api.get(`/users/${id}`);
  },

  async updateProfile(id, data) {
    if (!id) fail('User ID is required.');
    const updated = await api.put('/auth/profile', data);
    const user = updated?.user || updated;
    const current = readSession();
    if (user && current && String(current.id) === String(id)) {
      saveSession({ ...current, ...user });
    }
    emit('auth');
    emit('users');
    return user;
  },

  async setStatus(id, status) {
    if (!id) fail('User ID is required.');
    const updated = await api.patch(`/users/${id}/status`, { status });
    emit('users');
    return updated;
  },

  async setVerification(id, verification, notes = '') {
    if (!id) fail('User ID is required.');
    const updated = await api.patch(`/users/${id}/verification`, {
      verification,
      notes,
    });
    const current = readSession();
    if (current && String(current.id) === String(id)) {
      saveSession({ ...current, verification, verificationNotes: notes });
    }
    emit('auth');
    emit('users');
    return updated;
  },

  async submitCnicVerification(id, payload) {
    if (!id) fail('User ID is required.');
    const updated = await api.post(`/users/${id}/cnic-verification`, payload);
    const user = updated?.user || updated;
    const current = readSession();
    if (current && String(current.id) === String(id)) {
      saveSession({ ...current, ...(user || {}), verification: 'pending' });
    }
    emit('auth');
    emit('users');
    return updated;
  },

  async simulateNadraSync(id, approve = true, reason = '') {
    return this.setVerification(id, approve ? 'verified' : 'rejected', reason);
  },
};

export default userService;
