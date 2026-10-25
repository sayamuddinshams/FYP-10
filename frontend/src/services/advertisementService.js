import api from './api';
import { emit, fail } from './core';

const advertisementService = {
  async listActive() {
    try {
      const ads = await api.get('/advertisements/active');
      return Array.isArray(ads) ? ads : [];
    } catch {
      return [];
    }
  },

  async listAll() {
    try {
      const ads = await api.get('/advertisements');
      return Array.isArray(ads) ? ads : [];
    } catch {
      return [];
    }
  },

  async create(data) {
    if (!data.title?.trim()) fail('Title is required.');
    const ad = await api.post('/advertisements', {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      image: data.image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70',
      targetType: data.targetType || 'all',
      target: data.target || 'All Gilgit-Baltistan',
      start: data.start,
      end: data.end,
      status: data.status || 'active',
      owner: data.owner || 'RentLink',
    });
    emit('ads');
    return ad;
  },

  async update(id, data) {
    if (!id) fail('Advertisement ID is required.');
    const updated = await api.put(`/advertisements/${id}`, data);
    emit('ads');
    return updated;
  },

  async setStatus(id, status) {
    return this.update(id, { status });
  },

  async remove(id) {
    if (!id) fail('Advertisement ID is required.');
    await api.delete(`/advertisements/${id}`);
    emit('ads');
    return true;
  },

  async recordInteraction(id, type = 'impression') {
    if (!id) return;
    try {
      await api.post(`/advertisements/${id}/interact`, { type });
    } catch {
      // non-blocking
    }
  },
};

export default advertisementService;
