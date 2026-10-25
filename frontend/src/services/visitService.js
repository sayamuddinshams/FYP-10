import api from './api';
import { emit, fail } from './core';

const visitService = {
  async listByTenant(tenantId, status) {
    const res = await api.get('/visits/my', {
      status: status && status !== 'all' ? status : undefined,
    });
    return Array.isArray(res) ? res : [];
  },

  async listByOwner(ownerId, status) {
    const res = await api.get('/visits/my', {
      role: 'owner',
      status: status && status !== 'all' ? status : undefined,
    });
    return Array.isArray(res) ? res : [];
  },

  async listAll(status) {
    const res = await api.get('/visits/all', {
      status: status && status !== 'all' ? status : undefined,
    });
    return Array.isArray(res) ? res : [];
  },

  async create({ propertyId, tenantId, date, time, message }) {
    if (!propertyId) fail('Property ID is required.');
    const visit = await api.post('/visits', {
      propertyId,
      date,
      time,
      message: message || '',
    });
    emit('visits');
    return visit;
  },

  async updateStatus(id, status, note = '') {
    if (!id) fail('Visit ID is required.');
    const visit = await api.put(`/visits/${id}/status`, {
      status,
      ownerNote: note,
    });
    emit('visits');
    return visit;
  },

  async reschedule(id, { date, time, note }) {
    if (!id) fail('Visit ID is required.');
    const visit = await api.put(`/visits/${id}/status`, {
      status: 'rescheduled',
      date,
      time,
      ownerNote: note,
    });
    emit('visits');
    return visit;
  },
};

export default visitService;
