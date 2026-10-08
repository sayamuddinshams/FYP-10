import { db, emit } from '../data/store';
import { delay, fail } from './core';

const advertisementService = {
  async listActive() {
    await delay(320);
    const today = new Date().toISOString().slice(0, 10);
    return db.advertisements
      .filter((a) => a.status === 'active' && a.start <= today && a.end >= today)
      .map((a) => ({ ...a }));
  },

  async listAll() {
    await delay(340);
    return [...db.advertisements].sort((a, b) => new Date(b.start) - new Date(a.start)).map((a) => ({ ...a }));
  },

  async create(data) {
    await delay(600);
    if (!data.title?.trim()) fail('Title is required.');
    const ad = {
      id: `ad_${Math.random().toString(36).slice(2, 8)}`,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      image: data.image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70',
      targetType: data.targetType || 'all',
      target: data.target || 'All Gilgit-Baltistan',
      start: data.start,
      end: data.end,
      status: data.status || 'scheduled',
      owner: data.owner || 'RentLink',
      impressions: 0,
      clicks: 0,
    };
    db.advertisements.unshift(ad);
    emit();
    return { ...ad };
  },

  async update(id, data) {
    await delay(500);
    const ad = db.advertisements.find((a) => a.id === id);
    if (!ad) fail('Advertisement not found.');
    Object.assign(ad, data);
    emit();
    return { ...ad };
  },

  async setStatus(id, status) {
    await delay(400);
    const ad = db.advertisements.find((a) => a.id === id);
    if (!ad) fail('Advertisement not found.');
    ad.status = status;
    emit();
    return { ...ad };
  },

  async remove(id) {
    await delay(420);
    const index = db.advertisements.findIndex((a) => a.id === id);
    if (index === -1) fail('Advertisement not found.');
    db.advertisements.splice(index, 1);
    emit();
    return true;
  },
};

export default advertisementService;
