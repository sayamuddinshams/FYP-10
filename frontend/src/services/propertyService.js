import api from './api';
import { emit, fail } from './core';
import { PLATFORM_FEE_RATE } from '../utils/constants';

// Local cache for favorite property IDs to support fast synchronous reads
let cachedFavoriteIds = null;

const propertyService = {
  /**
   * Search & filter listings via GET /api/properties.
   */
  async list(filters = {}) {
    const {
      query = '',
      types = [],
      districts = [],
      cities = [],
      areas = [],
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnished,
      availability,
      sort = 'newest',
      page = 1,
      limit = 12,
      status = 'approved',
    } = filters;

    const params = {
      page,
      limit,
      status,
      sort,
    };

    if (query) params.query = query;
    if (types.length) params.types = types.join(',');
    if (districts.length) params.districts = districts.join(',');
    if (cities.length) params.city = cities[0];
    if (areas.length) params.area = areas[0];
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') params.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') params.maxPrice = maxPrice;
    if (bedrooms) params.bedrooms = bedrooms;
    if (bathrooms) params.bathrooms = bathrooms;
    if (furnished) params.furnished = furnished;
    if (availability) params.availability = availability;

    const data = await api.get('/properties', params);
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      pages: data.pages || 1,
    };
  },

  async getById(id) {
    if (!id) fail('Property ID is required.');
    return api.get(`/properties/${id}`);
  },

  async getFeatured(limit = 6) {
    const items = await api.get('/properties/featured', { limit });
    return Array.isArray(items) ? items : [];
  },

  /** Aggregated figures used on the marketing homepage. */
  async stats() {
    const data = await api.get('/properties/stats');
    const byDistrict = data?.byDistrict || {};
    const byType = data?.byType || {};
    const total = data?.totalApproved || 0;

    return {
      total,
      districts: Object.keys(byDistrict).length,
      types: Object.keys(byType).length,
      byType,
      byDistrict,
    };
  },

  async getRelated(id, limit = 3) {
    if (!id) return [];
    try {
      const items = await api.get(`/properties/${id}/related`, { limit });
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  async getSimilarStats() {
    const data = await this.stats();
    return { total: data.total };
  },

  /* ---------------- favourites ---------------- */

  favoritesOf(userId) {
    if (cachedFavoriteIds !== null) {
      return cachedFavoriteIds;
    }
    try {
      const raw = localStorage.getItem('rentlink_favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async toggleFavorite(propertyId, userId) {
    if (!propertyId) fail('Property ID is required.');
    const result = await api.post('/favorites/toggle', { propertyId });

    const currentList = this.favoritesOf(userId);
    let updated;
    if (result.favorited) {
      updated = Array.from(new Set([...currentList, propertyId]));
    } else {
      updated = currentList.filter((id) => id !== propertyId);
    }

    cachedFavoriteIds = updated;
    try {
      localStorage.setItem('rentlink_favorites', JSON.stringify(updated));
    } catch {}

    emit('favorites');
    return { favorited: result.favorited, favorites: updated };
  },

  async getFavorites(userId) {
    try {
      const res = await api.get('/favorites');
      const ids = res?.ids || [];
      cachedFavoriteIds = ids;
      try {
        localStorage.setItem('rentlink_favorites', JSON.stringify(ids));
      } catch {}
      return res?.items || [];
    } catch {
      return [];
    }
  },

  async incrementView(id) {
    if (!id) return;
    try {
      await api.post(`/properties/${id}/view`);
    } catch {
      // non-blocking
    }
  },

  /* ---------------- owner lifecycle ---------------- */

  async create(data, ownerId) {
    const created = await api.post('/properties', {
      ...data,
      price: Number(data.price),
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      size: Number(data.size) || 0,
      images: data.images?.length ? data.images : placeholderImages(data.type),
      status: data.status === 'draft' ? 'draft' : 'pending',
    });
    emit('properties');
    return created;
  },

  async update(id, data) {
    const payload = { ...data };
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.bedrooms !== undefined) payload.bedrooms = Number(payload.bedrooms);
    if (payload.bathrooms !== undefined) payload.bathrooms = Number(payload.bathrooms);
    if (payload.size !== undefined) payload.size = Number(payload.size);

    const updated = await api.put(`/properties/${id}`, payload);
    emit('properties');
    return updated;
  },

  async saveDraft(id, data, ownerId) {
    if (id) return this.update(id, { ...data, status: 'draft' });
    return this.create({ ...data, status: 'draft' }, ownerId);
  },

  async submitForReview(id) {
    return this.update(id, { status: 'pending' });
  },

  async remove(id) {
    await api.delete(`/properties/${id}`);
    emit('properties');
    return true;
  },

  async pause(id) {
    const updated = await api.patch(`/properties/${id}/toggle-pause`);
    emit('properties');
    return updated;
  },

  async getByOwner(ownerId, status) {
    const items = await api.get('/properties/my', {
      status: status && status !== 'all' ? status : undefined,
    });
    return Array.isArray(items) ? items : [];
  },

  /* ---------------- admin review ---------------- */

  async adminList(status = 'all') {
    const res = await api.get('/properties', {
      status: status && status !== 'all' ? status : 'all',
      limit: 100,
    });
    return res?.items || (Array.isArray(res) ? res : []);
  },

  async setListingStatus(id, status, reason = '') {
    const updated = await api.put(`/properties/${id}`, {
      status,
      adminNote: reason || '',
    });
    emit('properties');
    return updated;
  },
};

export function placeholderImages(type) {
  const pools = {
    house: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=70'],
    apartment: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=70'],
    room: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=70'],
    hostel: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=70'],
    office: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=70'],
    commercial: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=70'],
  };
  return pools[type] || pools.house;
}

export function rentalSummary(property) {
  const amount = Number(property?.price) || 0;
  const fee = Math.round(amount * PLATFORM_FEE_RATE);
  return { amount, fee, ownerAmount: amount - fee };
}

export default propertyService;
