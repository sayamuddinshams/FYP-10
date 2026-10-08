import { db, emit, getOwner, getUser, isVerifiedOwner, uid } from '../data/store';
import { delay, fail } from './core';
import { PLATFORM_FEE_RATE } from '../utils/constants';

/** Attach the reviewer's real account details so reviews never show a bare "Reviewer". */
function decorateReview(review) {
  const user = getUser(review.userId);
  return {
    ...review,
    userName: review.userName || user?.name || null,
    userRole: user?.role || null,
    userVerification: user?.verification || null,
  };
}

function decorate(property) {
  if (!property) return null;
  const owner = getOwner(property);
  return {
    ...property,
    owner: owner ? { id: owner.id, name: owner.name, avatar: owner.avatar, verification: owner.verification, memberSince: owner.memberSince, phone: owner.phone, role: owner.role } : null,
    ownerVerified: isVerifiedOwner(property),
    reviews: db.reviews.filter((r) => r.propertyId === property.id).map(decorateReview),
    favoriteCount: (db.favorites[property.ownerId] ? property.favorites : property.favorites) || 0,
  };
}

function matchesQuery(property, q) {
  if (!q) return true;
  const haystack = [property.title, property.description, property.district, property.city, property.area, property.address].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

const propertyService = {
  /**
   * Search & filter listings.
   * filters: { query, types[], districts[], cities[], areas[], minPrice, maxPrice,
   *           bedrooms, bathrooms, furnished, availability, verifiedOnly, sort, page, limit }
   */
  async list(filters = {}) {
    await delay(380);
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
      verifiedOnly = false,
      sort = 'recommended',
      page = 1,
      limit = 12,
      status = 'approved',
    } = filters;

    let items = db.properties.filter((p) => (status ? p.status === status : true));

    items = items.filter((p) => matchesQuery(p, query));
    if (types.length) items = items.filter((p) => types.includes(p.type));
    if (districts.length) items = items.filter((p) => districts.includes(p.district));
    if (cities.length) items = items.filter((p) => cities.includes(p.city));
    if (areas.length) items = items.filter((p) => areas.includes(p.area));
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') items = items.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') items = items.filter((p) => p.price <= Number(maxPrice));
    if (bedrooms) items = items.filter((p) => p.bedrooms >= Number(bedrooms));
    if (bathrooms) items = items.filter((p) => p.bathrooms >= Number(bathrooms));
    if (furnished === 'furnished') items = items.filter((p) => p.furnishing !== 'Unfurnished');
    if (furnished === 'unfurnished') items = items.filter((p) => p.furnishing === 'Unfurnished');
    if (availability) items = items.filter((p) => new Date(p.availableFrom) <= new Date(availability));
    if (verifiedOnly) items = items.filter((p) => isVerifiedOwner(p));

    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      recommended: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.views - a.views,
    };
    items = [...items].sort(sorters[sort] || sorters.recommended);

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return {
      items: paged.map(decorate),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async getById(id) {
    await delay(300);
    const property = db.properties.find((p) => p.id === id);
    if (!property) fail('Property not found.');
    return decorate(property);
  },

  async getFeatured(limit = 6) {
    await delay(350);
    const featured = db.properties.filter((p) => p.status === 'approved' && p.featured);
    const rest = db.properties.filter((p) => p.status === 'approved' && !p.featured);
    return [...featured, ...rest].slice(0, limit).map(decorate);
  },

  /** Aggregated figures used on the marketing homepage. */
  async stats() {
    await delay(220);
    const approved = db.properties.filter((p) => p.status === 'approved');
    const byType = {};
    approved.forEach((p) => { byType[p.type] = (byType[p.type] || 0) + 1; });
    return {
      total: approved.length,
      districts: new Set(approved.map((p) => p.district)).size,
      verifiedOwners: db.users.filter((u) => u.role === 'owner' && u.verification === 'verified').length,
      visits: db.visits.length,
      byType,
      // Real approved-listing counts per district (used by the homepage location cards).
      byDistrict: approved.reduce((acc, p) => {
        acc[p.district] = (acc[p.district] || 0) + 1;
        return acc;
      }, {}),
    };
  },

  async getRelated(id, limit = 3) {
    await delay(250);
    const current = db.properties.find((p) => p.id === id);
    if (!current) return [];
    return db.properties
      .filter((p) => p.id !== id && p.status === 'approved' && (p.type === current.type || p.district === current.district))
      .slice(0, limit)
      .map(decorate);
  },

  async getSimilarStats() {
    await delay(200);
    const approved = db.properties.filter((p) => p.status === 'approved');
    return { total: approved.length };
  },

  /* ---------------- favourites ---------------- */

  favoritesOf(userId) {
    return db.favorites[userId] || [];
  },

  async toggleFavorite(propertyId, userId) {
    await delay(180);
    if (!userId) fail('Sign in to save properties.');
    const list = db.favorites[userId] || [];
    const exists = list.includes(propertyId);
    db.favorites[userId] = exists ? list.filter((id) => id !== propertyId) : [propertyId, ...list];

    const property = db.properties.find((p) => p.id === propertyId);
    if (property) property.favorites = Math.max(0, property.favorites + (exists ? -1 : 1));
    emit();
    return { favorited: !exists, favorites: db.favorites[userId] };
  },

  async getFavorites(userId) {
    await delay(320);
    const ids = db.favorites[userId] || [];
    return ids.map((id) => decorate(db.properties.find((p) => p.id === id))).filter(Boolean);
  },

  async incrementView(id) {
    const property = db.properties.find((p) => p.id === id);
    if (property) {
      property.views += 1;
      emit();
    }
  },

  /* ---------------- owner lifecycle ---------------- */

  async create(data, ownerId) {
    await delay(700);
    const owner = db.users.find((u) => u.id === ownerId);
    if (!owner) fail('You must be signed in to publish a listing.');

    const property = {
      id: uid('p'),
      title: data.title,
      type: data.type,
      description: data.description,
      price: Number(data.price),
      district: data.district,
      city: data.city,
      area: data.area,
      address: data.address,
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      size: Number(data.size) || 0,
      furnishing: data.furnishing || 'Unfurnished',
      availableFrom: data.availableFrom || new Date().toISOString().slice(0, 10),
      amenities: data.amenities || [],
      images: data.images?.length ? data.images : placeholderImages(data.type),
      ownerId,
      status: data.status === 'draft' ? 'draft' : 'pending',
      views: 0,
      favorites: 0,
      rating: 0,
      reviewCount: 0,
      featured: false,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    db.properties.unshift(property);
    emit();
    return decorate(property);
  },

  async update(id, data) {
    await delay(650);
    const property = db.properties.find((p) => p.id === id);
    if (!property) fail('Property not found.');

    Object.assign(property, {
      ...data,
      price: data.price !== undefined ? Number(data.price) : property.price,
      bedrooms: data.bedrooms !== undefined ? Number(data.bedrooms) : property.bedrooms,
      bathrooms: data.bathrooms !== undefined ? Number(data.bathrooms) : property.bathrooms,
      size: data.size !== undefined ? Number(data.size) : property.size,
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    // Published listings go back through admin review when edited.
    if (property.status === 'approved') property.status = 'pending';
    emit();
    return decorate(property);
  },

  async saveDraft(id, data, ownerId) {
    if (id) return this.update(id, { ...data, status: 'draft' });
    return this.create({ ...data, status: 'draft' }, ownerId);
  },

  async submitForReview(id) {
    await delay(700);
    const property = db.properties.find((p) => p.id === id);
    if (!property) fail('Property not found.');
    property.status = 'pending';
    property.updatedAt = new Date().toISOString().slice(0, 10);
    emit();
    return decorate(property);
  },

  async remove(id) {
    await delay(450);
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1) fail('Property not found.');
    db.properties.splice(index, 1);
    emit();
    return true;
  },

  async pause(id) {
    await delay(400);
    const property = db.properties.find((p) => p.id === id);
    if (!property) fail('Property not found.');
    property.status = property.status === 'suspended' ? 'approved' : 'suspended';
    emit();
    return decorate(property);
  },

  async getByOwner(ownerId, status) {
    await delay(360);
    let items = db.properties.filter((p) => p.ownerId === ownerId);
    if (status && status !== 'all') items = items.filter((p) => p.status === status);
    items = [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return items.map(decorate);
  },

  /* ---------------- admin review ---------------- */

  async adminList(status = 'all') {
    await delay(400);
    let items = [...db.properties];
    if (status && status !== 'all') items = items.filter((p) => p.status === status);
    items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return items.map(decorate);
  },

  async setListingStatus(id, status, reason = '') {
    await delay(600);
    const property = db.properties.find((p) => p.id === id);
    if (!property) fail('Property not found.');
    property.status = status;
    property.adminNote = reason || '';
    property.updatedAt = new Date().toISOString().slice(0, 10);
    emit();
    return decorate(property);
  },
};

function placeholderImages(type) {
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
