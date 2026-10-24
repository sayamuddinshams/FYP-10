import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getActiveAds(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ads = await collections.advertisements()
      .find({
        status: 'active',
        start: { $lte: today },
        end: { $gte: today },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(res, ads.map(normalizeDoc));
  } catch (error) {
    next(error);
  }
}

export async function getAllAds(req, res, next) {
  try {
    const ads = await collections.advertisements()
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(res, ads.map(normalizeDoc));
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

    const adId = new ObjectId().toString();
    const newAd = {
      _id: adId,
      id: adId,
      title: title.trim(),
      description: description?.trim() || '',
      image: image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70',
      targetType: targetType || 'all',
      target: target || 'All Gilgit-Baltistan',
      start: start || new Date().toISOString().slice(0, 10),
      end: end || new Date().toISOString().slice(0, 10),
      status: status || 'active',
      owner: owner || 'RentLink',
      impressions: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.advertisements().insertOne(newAd);
    return successResponse(res, normalizeDoc(newAd), 'Advertisement campaign created.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAd(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.id;
    delete updateData._id;

    await collections.advertisements().updateOne(toIdQuery(id), { $set: updateData });
    const updated = await collections.advertisements().findOne(toIdQuery(id));

    if (!updated) {
      return errorResponse(res, 'Advertisement not found.', 404);
    }

    return successResponse(res, normalizeDoc(updated), 'Advertisement updated.');
  } catch (error) {
    next(error);
  }
}

export async function recordInteraction(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'impression' | 'click'

    const incField = type === 'click' ? { clicks: 1 } : { impressions: 1 };
    await collections.advertisements().updateOne(toIdQuery(id), { $inc: incField });

    const updated = await collections.advertisements().findOne(toIdQuery(id));
    if (!updated) {
      return errorResponse(res, 'Advertisement not found.', 404);
    }

    return successResponse(res, normalizeDoc(updated));
  } catch (error) {
    next(error);
  }
}

export async function deleteAd(req, res, next) {
  try {
    const { id } = req.params;
    await collections.advertisements().deleteOne(toIdQuery(id));
    return successResponse(res, null, 'Advertisement removed.');
  } catch (error) {
    next(error);
  }
}
