import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getActiveAds(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'active',
        start: { lte: today },
        end: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, ads);
  } catch (error) {
    next(error);
  }
}

export async function getAllAds(req, res, next) {
  try {
    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, ads);
  } catch (error) {
    next(error);
  }
}

export async function createAd(req, res, next) {
  try {
    const { title, description, image, targetType, target, start, end, status, owner } = req.body;

    if (!title?.trim()) {
      return errorResponse(res, 'Title is required.', 400);
    }

    const ad = await prisma.advertisement.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        image: image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70',
        targetType: targetType || 'all',
        target: target || 'All Gilgit-Baltistan',
        start: start || new Date().toISOString().slice(0, 10),
        end: end || new Date().toISOString().slice(0, 10),
        status: status || 'active',
        owner: owner || 'RentLink',
      },
    });

    return successResponse(res, ad, 'Advertisement campaign created.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAd(req, res, next) {
  try {
    const { id } = req.params;
    const ad = await prisma.advertisement.update({
      where: { id },
      data: req.body,
    });
    return successResponse(res, ad, 'Advertisement updated.');
  } catch (error) {
    next(error);
  }
}

export async function recordInteraction(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'impression' | 'click'

    const data = type === 'click' ? { clicks: { increment: 1 } } : { impressions: { increment: 1 } };
    const updated = await prisma.advertisement.update({
      where: { id },
      data,
    });

    return successResponse(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteAd(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.advertisement.delete({ where: { id } });
    return successResponse(res, null, 'Advertisement removed.');
  } catch (error) {
    next(error);
  }
}
