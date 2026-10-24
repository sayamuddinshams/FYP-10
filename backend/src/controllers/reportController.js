import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function decorateReport(r, reporter = null) {
  if (!r) return null;
  const doc = normalizeDoc(r);
  const rep = reporter || doc.reporter || null;

  return {
    ...doc,
    reporter: rep
      ? {
          id: rep.id || rep._id?.toString(),
          name: rep.name,
          email: rep.email,
          role: rep.role,
        }
      : null,
  };
}

async function populateReports(reportDocs) {
  if (!reportDocs || reportDocs.length === 0) return [];

  const reporterIds = [...new Set(reportDocs.map((r) => r.reporterId).filter(Boolean))];
  const reporters = await collections.users()
    .find({ $or: [{ id: { $in: reporterIds } }, { _id: { $in: reporterIds } }] })
    .toArray();

  const userMap = new Map();
  for (const u of reporters) {
    userMap.set(u.id || u._id.toString(), u);
  }

  return reportDocs.map((r) => {
    const rep = userMap.get(r.reporterId) || null;
    return decorateReport(r, rep);
  });
}

export async function createReport(req, res, next) {
  try {
    const { type, targetId, targetLabel, reason, details } = req.body;
    const reporterId = req.user.id;

    if (!reason || !details) {
      return errorResponse(res, 'Reason and details are required to submit a report.', 400);
    }

    const reportId = new ObjectId().toString();
    const newReport = {
      _id: reportId,
      id: reportId,
      type: type || 'listing',
      reporterId,
      targetId: targetId || '',
      targetLabel: targetLabel || 'Item',
      reason,
      details,
      status: 'open',
      resolution: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.reports().insertOne(newReport);
    const reporter = await collections.users().findOne(toIdQuery(reporterId));

    return successResponse(res, decorateReport(newReport, reporter), 'Report submitted for review.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const reports = await collections.reports()
      .find(where)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = await populateReports(reports);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const updateData = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (resolution !== undefined) updateData.resolution = resolution;

    await collections.reports().updateOne(toIdQuery(id), { $set: updateData });
    const updated = await collections.reports().findOne(toIdQuery(id));

    if (!updated) {
      return errorResponse(res, 'Report not found.', 404);
    }

    const reporter = await collections.users().findOne(toIdQuery(updated.reporterId));
    return successResponse(res, decorateReport(updated, reporter), 'Report updated.');
  } catch (error) {
    next(error);
  }
}
