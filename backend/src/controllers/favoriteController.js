import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatProperty(p, owner = null) {
  if (!p) return null;
  const doc = normalizeDoc(p);

  let amenities = [];
  if (Array.isArray(doc.amenities)) {
    amenities = doc.amenities;
  } else if (doc.amenitiesJson) {
    try {
      amenities = JSON.parse(doc.amenitiesJson);
    } catch {
      amenities = [];
    }
  }

  let images = [];
  if (Array.isArray(doc.images)) {
    images = doc.images.map((img) => (typeof img === 'string' ? img : img.url || ''));
  }

  const ownerData = owner || doc.owner || null;

  return {
    ...doc,
    amenities,
    images,
    owner: ownerData
      ? {
          id: ownerData.id || ownerData._id?.toString(),
          name: ownerData.name,
          avatar: ownerData.avatar || null,
          verification: ownerData.verification || 'unverified',
        }
      : null,
  };
}

export async function getFavorites(req, res, next) {
  try {
    const userId = req.user.id;
    const favorites = await collections.favorites()
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const propIds = favorites.map((f) => f.propertyId).filter(Boolean);
    const properties = await collections.properties()
      .find({ $or: [{ id: { $in: propIds } }, { _id: { $in: propIds } }] })
      .toArray();

    const ownerIds = [...new Set(properties.map((p) => p.ownerId).filter(Boolean))];
    const owners = await collections.users()
      .find({ $or: [{ id: { $in: ownerIds } }, { _id: { $in: ownerIds } }] })
      .toArray();

    const ownerMap = new Map();
    for (const o of owners) {
      ownerMap.set(o.id || o._id.toString(), o);
    }

    const propMap = new Map();
    for (const p of properties) {
      const owner = ownerMap.get(p.ownerId) || null;
      propMap.set(p.id || p._id.toString(), formatProperty(p, owner));
    }

    const items = favorites
      .map((f) => propMap.get(f.propertyId))
      .filter(Boolean);

    const ids = favorites.map((f) => f.propertyId);

    return successResponse(res, { ids, items });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      return errorResponse(res, 'Property ID is required.', 400);
    }

    const existing = await collections.favorites().findOne({ userId, propertyId });

    if (existing) {
      await collections.favorites().deleteOne({ userId, propertyId });
      return successResponse(res, { favorited: false, propertyId }, 'Removed from favorites.');
    } else {
      const favId = new ObjectId().toString();
      await collections.favorites().insertOne({
        _id: favId,
        id: favId,
        userId,
        propertyId,
        createdAt: new Date(),
      });
      return successResponse(res, { favorited: true, propertyId }, 'Saved to favorites.');
    }
  } catch (error) {
    next(error);
  }
}
