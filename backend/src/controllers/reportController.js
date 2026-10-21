import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function decorateReport(r) {
  if (!r) return null;
  return {
    ...r,
    reporter: r.reporter
      ? {
          id: r.reporter.id,
          name: r.reporter.name,
          email: r.reporter.email,
          role: r.reporter.role,
        }
      : null,
  };
}

export async function createReport(req, res, next) {
  try {
    const { type, targetId, targetLabel, reason, details } = req.body;
    const reporterId = req.user.id;

    if (!reason || !details) {
      return errorResponse(res, 'Reason and details are required to submit a report.', 400);
    }

    const report = await prisma.report.create({
      data: {
        type: type || 'listing',
        reporterId,
        targetId: targetId || '',
        targetLabel: targetLabel || 'Item',
        reason,
        details,
        status: 'open',
      },
      include: { reporter: true },
    });

    return successResponse(res, decorateReport(report), 'Report submitted for review.', 201);
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

    const reports = await prisma.report.findMany({
      where,
      include: { reporter: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, reports.map(decorateReport));
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolution: resolution || '',
      },
      include: { reporter: true },
    });

    return successResponse(res, decorateReport(report), 'Report updated.');
  } catch (error) {
    next(error);
  }
}
