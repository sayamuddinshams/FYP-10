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
      email: p.owner.email,
      phone: p.owner.phone,
      avatar: p.owner.avatar,
      verification: p.owner.verification,
      role: p.owner.role,
    } : null,
  };
}

export async function getProperties(req, res, next) {
  try {
    const {
      type,
      district,
      city,
      area,
      minPrice,
      maxPrice,
      query,
      status = 'approved',
      sort = 'newest',
      page = 1,
      limit = 50,
      featured,
    } = req.query;

    const where = {};

    // By default public only sees approved
    if (status) {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type.toLowerCase();
    }

    if (district && district !== 'All Districts') {
      where.district = district;
    }

    if (city && city !== 'All Cities') {
      where.city = city;
    }

    if (area) {
      where.area = { contains: area };
    }

    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice, 10);
      if (maxPrice) where.price.lte = parseInt(maxPrice, 10);
    }

    if (query) {
      const q = query.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { district: { contains: q } },
        { city: { contains: q } },
        { area: { contains: q } },
        { address: { contains: q } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'views') orderBy = { views: 'desc' };

    const take = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          owner: true,
        },
        orderBy,
        take,
        skip,
      }),
      prisma.property.count({ where }),
    ]);

    const formatted = items.map(formatProperty);

    return successResponse(res, {
      items: formatted,
      total,
      page: parseInt(page, 10) || 1,
      limit: take,
      pages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeatured(req, res, next) {
  try {
    const items = await prisma.property.findMany({
      where: { status: 'approved', featured: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        owner: true,
      },
      take: 6,
    });
    return successResponse(res, items.map(formatProperty));
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const [totalApproved, properties] = await Promise.all([
      prisma.property.count({ where: { status: 'approved' } }),
      prisma.property.findMany({
        where: { status: 'approved' },
        select: { district: true, type: true },
      }),
    ]);

    const byDistrict = {};
    const byType = {};

    properties.forEach((p) => {
      byDistrict[p.district] = (byDistrict[p.district] || 0) + 1;
      byType[p.type] = (byType[p.type] || 0) + 1;
    });

    return successResponse(res, { totalApproved, byDistrict, byType });
  } catch (error) {
    next(error);
  }
}

export async function getMyProperties(req, res, next) {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        _count: { select: { visits: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, properties.map(formatProperty));
  } catch (error) {
    next(error);
  }
}

export async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        owner: true,
      },
    });

    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    return successResponse(res, formatProperty(property));
  } catch (error) {
    next(error);
  }
}

export async function getRelated(req, res, next) {
  try {
    const { id } = req.params;
    const current = await prisma.property.findUnique({ where: { id } });
    if (!current) {
      return errorResponse(res, 'Property not found.', 404);
    }

    const related = await prisma.property.findMany({
      where: {
        id: { not: id },
        status: 'approved',
        OR: [{ district: current.district }, { type: current.type }],
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        owner: true,
      },
      take: 4,
    });

    return successResponse(res, related.map(formatProperty));
  } catch (error) {
    next(error);
  }
}

export async function createProperty(req, res, next) {
  try {
    const {
      title,
      type,
      description,
      price,
      district,
      city,
      area,
      address,
      bedrooms = 0,
      bathrooms = 0,
      size = 0,
      furnishing = 'Unfurnished',
      availableFrom = '',
      amenities = [],
      images = [],
      status = 'pending',
    } = req.body;

    // Check if autoApprove is enabled in platform settings
    const settings = await prisma.platformSetting.findUnique({ where: { id: 'global' } });
    const finalStatus = settings?.autoApproveListings ? 'approved' : status;

    const property = await prisma.property.create({
      data: {
        title,
        type,
        description,
        price,
        district,
        city,
        area,
        address,
        bedrooms,
        bathrooms,
        size,
        furnishing,
        availableFrom,
        amenitiesJson: JSON.stringify(amenities),
        status: finalStatus,
        ownerId: req.user.id,
      },
    });

    if (images.length > 0) {
      await prisma.propertyImage.createMany({
        data: images.map((url, index) => ({
          propertyId: property.id,
          url,
          order: index,
        })),
      });
    }

    const full = await prisma.property.findUnique({
      where: { id: property.id },
      include: { images: true, owner: true },
    });

    return successResponse(res, formatProperty(full), 'Property listed successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProperty(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'You are not authorized to update this listing.', 403);
    }

    const {
      title,
      type,
      description,
      price,
      district,
      city,
      area,
      address,
      bedrooms,
      bathrooms,
      size,
      furnishing,
      availableFrom,
      amenities,
      images,
      status,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (district !== undefined) updateData.district = district;
    if (city !== undefined) updateData.city = city;
    if (area !== undefined) updateData.area = area;
    if (address !== undefined) updateData.address = address;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
    if (size !== undefined) updateData.size = size;
    if (furnishing !== undefined) updateData.furnishing = furnishing;
    if (availableFrom !== undefined) updateData.availableFrom = availableFrom;
    if (amenities !== undefined) updateData.amenitiesJson = JSON.stringify(amenities);

    // If an owner edits an approved listing, move it back to pending review
    if (req.user.role === 'owner') {
      if (status === 'draft') {
        updateData.status = 'draft';
      } else if (existing.status === 'approved') {
        updateData.status = 'pending';
      }
    } else if (status !== undefined) {
      updateData.status = status;
    }

    await prisma.property.update({
      where: { id },
      data: updateData,
    });

    if (Array.isArray(images)) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      if (images.length > 0) {
        await prisma.propertyImage.createMany({
          data: images.map((url, idx) => ({
            propertyId: id,
            url,
            order: idx,
          })),
        });
      }
    }

    const full = await prisma.property.findUnique({
      where: { id },
      include: { images: true, owner: true },
    });

    return successResponse(res, formatProperty(full), 'Property updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteProperty(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'You are not authorized to delete this listing.', 403);
    }

    await prisma.property.delete({ where: { id } });
    return successResponse(res, null, 'Listing deleted successfully.');
  } catch (error) {
    next(error);
  }
}

export async function togglePause(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'Unauthorized.', 403);
    }

    const newStatus = existing.status === 'suspended' ? 'approved' : 'suspended';
    const updated = await prisma.property.update({
      where: { id },
      data: { status: newStatus },
      include: { images: true, owner: true },
    });

    return successResponse(res, formatProperty(updated), `Listing is now ${newStatus}.`);
  } catch (error) {
    next(error);
  }
}

export async function recordView(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return successResponse(res, null, 'View incremented.');
  } catch (error) {
    next(error);
  }
}
