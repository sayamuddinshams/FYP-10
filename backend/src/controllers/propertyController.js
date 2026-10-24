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
    amenitiesJson: doc.amenitiesJson || JSON.stringify(amenities),
    images,
    owner: ownerData
      ? {
          id: ownerData.id || ownerData._id?.toString(),
          name: ownerData.name,
          email: ownerData.email,
          phone: ownerData.phone || '',
          avatar: ownerData.avatar || null,
          verification: ownerData.verification || 'unverified',
          role: ownerData.role || 'owner',
        }
      : null,
  };
}

async function populateOwners(propertyDocs) {
  if (!propertyDocs || propertyDocs.length === 0) return [];
  const ownerIds = [...new Set(propertyDocs.map((p) => p.ownerId).filter(Boolean))];
  const owners = await collections.users()
    .find({
      $or: [{ id: { $in: ownerIds } }, { _id: { $in: ownerIds } }],
    })
    .toArray();

  const ownerMap = new Map();
  for (const o of owners) {
    const oId = o.id || o._id.toString();
    ownerMap.set(oId, o);
  }

  return propertyDocs.map((p) => {
    const owner = ownerMap.get(p.ownerId) || null;
    return formatProperty(p, owner);
  });
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

    if (status && status !== 'all') {
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
      where.area = { $regex: area, $options: 'i' };
    }

    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) where.price.$lte = parseInt(maxPrice, 10);
    }

    if (query) {
      const q = String(query).trim();
      where.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { area: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'views') sortOption = { views: -1 };

    const take = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [items, total] = await Promise.all([
      collections.properties().find(where).sort(sortOption).skip(skip).limit(take).toArray(),
      collections.properties().countDocuments(where),
    ]);

    const formatted = await populateOwners(items);

    return successResponse(res, {
      items: formatted,
      total,
      page: parseInt(page, 10) || 1,
      limit: take,
      pages: Math.ceil(total / take) || 1,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeatured(req, res, next) {
  try {
    const items = await collections.properties()
      .find({ status: 'approved', featured: true })
      .limit(6)
      .toArray();

    const formatted = await populateOwners(items);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const [totalApproved, properties] = await Promise.all([
      collections.properties().countDocuments({ status: 'approved' }),
      collections.properties()
        .find({ status: 'approved' }, { projection: { district: 1, type: 1 } })
        .toArray(),
    ]);

    const byDistrict = {};
    const byType = {};

    properties.forEach((p) => {
      if (p.district) byDistrict[p.district] = (byDistrict[p.district] || 0) + 1;
      if (p.type) byType[p.type] = (byType[p.type] || 0) + 1;
    });

    return successResponse(res, { totalApproved, byDistrict, byType });
  } catch (error) {
    next(error);
  }
}

export async function getMyProperties(req, res, next) {
  try {
    const properties = await collections.properties()
      .find({ ownerId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await Promise.all(
      properties.map(async (p) => {
        const propId = p.id || p._id.toString();
        const [visitsCount, favCount] = await Promise.all([
          collections.visitRequests().countDocuments({ propertyId: propId }),
          collections.favorites().countDocuments({ propertyId: propId }),
        ]);

        const formattedProp = formatProperty(p);
        formattedProp._count = {
          visits: visitsCount,
          favorites: favCount,
        };
        return formattedProp;
      })
    );

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;
    const property = await collections.properties().findOne(toIdQuery(id));

    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    const owner = property.ownerId
      ? await collections.users().findOne(toIdQuery(property.ownerId))
      : null;

    return successResponse(res, formatProperty(property, owner));
  } catch (error) {
    next(error);
  }
}

export async function getRelated(req, res, next) {
  try {
    const { id } = req.params;
    const current = await collections.properties().findOne(toIdQuery(id));
    if (!current) {
      return errorResponse(res, 'Property not found.', 404);
    }

    const currentId = current.id || current._id.toString();

    const related = await collections.properties()
      .find({
        status: 'approved',
        $and: [
          { $or: [{ district: current.district }, { type: current.type }] },
          { id: { $ne: currentId } },
          { _id: { $ne: current._id } },
        ],
      })
      .limit(4)
      .toArray();

    const formatted = await populateOwners(related);
    return successResponse(res, formatted);
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

    const settings = await collections.platformSettings().findOne({ id: 'global' });
    const finalStatus = settings?.autoApproveListings ? 'approved' : status;
    const propId = new ObjectId().toString();

    const newProperty = {
      _id: propId,
      id: propId,
      title,
      type,
      description,
      price: Number(price),
      district,
      city,
      area,
      address,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      size: Number(size) || 0,
      furnishing,
      availableFrom,
      amenities: Array.isArray(amenities) ? amenities : [],
      amenitiesJson: JSON.stringify(Array.isArray(amenities) ? amenities : []),
      images: Array.isArray(images) ? images : [],
      status: finalStatus,
      views: 0,
      featured: false,
      adminNote: '',
      ownerId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.properties().insertOne(newProperty);

    const owner = await collections.users().findOne(toIdQuery(req.user.id));
    return successResponse(res, formatProperty(newProperty, owner), 'Property listed successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProperty(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await collections.properties().findOne(toIdQuery(id));

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

    const updateData = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (district !== undefined) updateData.district = district;
    if (city !== undefined) updateData.city = city;
    if (area !== undefined) updateData.area = area;
    if (address !== undefined) updateData.address = address;
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms);
    if (size !== undefined) updateData.size = Number(size);
    if (furnishing !== undefined) updateData.furnishing = furnishing;
    if (availableFrom !== undefined) updateData.availableFrom = availableFrom;
    if (amenities !== undefined) {
      updateData.amenities = Array.isArray(amenities) ? amenities : [];
      updateData.amenitiesJson = JSON.stringify(updateData.amenities);
    }
    if (images !== undefined && Array.isArray(images)) {
      updateData.images = images;
    }

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

    await collections.properties().updateOne(toIdQuery(id), { $set: updateData });

    const updated = await collections.properties().findOne(toIdQuery(id));
    const owner = await collections.users().findOne(toIdQuery(updated.ownerId));

    return successResponse(res, formatProperty(updated, owner), 'Property updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteProperty(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await collections.properties().findOne(toIdQuery(id));

    if (!existing) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'You are not authorized to delete this listing.', 403);
    }

    const propId = existing.id || existing._id.toString();
    await Promise.all([
      collections.properties().deleteOne(toIdQuery(id)),
      collections.favorites().deleteMany({ propertyId: propId }),
      collections.visitRequests().deleteMany({ propertyId: propId }),
    ]);

    return successResponse(res, null, 'Listing deleted successfully.');
  } catch (error) {
    next(error);
  }
}

export async function togglePause(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await collections.properties().findOne(toIdQuery(id));

    if (!existing) {
      return errorResponse(res, 'Property listing not found.', 404);
    }

    if (req.user.role !== 'admin' && existing.ownerId !== req.user.id) {
      return errorResponse(res, 'Unauthorized.', 403);
    }

    const newStatus = existing.status === 'suspended' ? 'approved' : 'suspended';
    await collections.properties().updateOne(
      toIdQuery(id),
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    const updated = await collections.properties().findOne(toIdQuery(id));
    const owner = await collections.users().findOne(toIdQuery(updated.ownerId));

    return successResponse(res, formatProperty(updated, owner), `Listing is now ${newStatus}.`);
  } catch (error) {
    next(error);
  }
}

export async function recordView(req, res, next) {
  try {
    const { id } = req.params;
    await collections.properties().updateOne(toIdQuery(id), { $inc: { views: 1 } });
    return successResponse(res, null, 'View incremented.');
  } catch (error) {
    next(error);
  }
}
