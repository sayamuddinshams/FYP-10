import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatProperty(p) {
  if (!p) return null;
  let amenities = [];
  try {
    amenities = JSON.parse(p.amenitiesJson || '[]');
  } catch {
    amenities = [];
  }
  const images = (p.images || []).map((img) => img.url);
  return {
    ...p,
    amenities,
    images: images.length > 0 ? images : (p.images || []),
    owner: p.owner ? {
      id: p.owner.id,
      name: p.owner.name,
      avatar: p.owner.avatar,
      verification: p.owner.verification,
    } : null,
  };
}

export async function getFavorites(req, res, next) {
  try {
    const userId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: { orderBy: { order: 'asc' } },
            owner: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const properties = favorites
      .map((f) => f.property)
      .filter(Boolean)
      .map(formatProperty);

    const ids = favorites.map((f) => f.propertyId);

    return successResponse(res, { ids, items: properties });
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

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return successResponse(res, { favorited: false, propertyId }, 'Removed from favorites.');
    } else {
      await prisma.favorite.create({
        data: { userId, propertyId },
      });
      return successResponse(res, { favorited: true, propertyId }, 'Saved to favorites.');
    }
  } catch (error) {
    next(error);
  }
}
