import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getOverview(req, res, next) {
  try {
    const [
      tenantsCount,
      ownersCount,
      suspendedCount,
      propertiesCount,
      pendingPropsCount,
      approvedPropsCount,
      visitsCount,
      openReportsCount,
      transactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'tenant' } }),
      prisma.user.count({ where: { role: 'owner' } }),
      prisma.user.count({ where: { status: 'suspended' } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'pending' } }),
      prisma.property.count({ where: { status: 'approved' } }),
      prisma.visitRequest.count(),
      prisma.report.count({ where: { status: 'open' } }),
      prisma.transaction.findMany({ where: { status: 'completed' } }),
    ]);

    const grossValue = transactions.reduce((a, t) => a + t.amount, 0);
    const platformRevenue = transactions.reduce((a, t) => a + t.platformFee, 0);

    return successResponse(res, {
      totalUsers: tenantsCount,
      totalOwners: ownersCount,
      suspendedUsers: suspendedCount,
      totalProperties: propertiesCount,
      pendingProperties: pendingPropsCount,
      activeListings: approvedPropsCount,
      visitRequests: visitsCount,
      openReports: openReportsCount,
      grossValue,
      platformRevenue,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCounts(req, res, next) {
  try {
    const [users, properties, pending, reports, visits] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'pending' } }),
      prisma.report.count({ where: { status: 'open' } }),
      prisma.visitRequest.count(),
    ]);

    return successResponse(res, {
      users,
      properties,
      pending,
      reports,
      visits,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSettings(req, res, next) {
  try {
    let settings = await prisma.platformSetting.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: {
          id: 'global',
          platformFeePercent: 5.0,
          autoApproveListings: false,
          maintenanceMode: false,
          payoutHoldDays: 7,
          supportEmail: 'support@rentlink.pk',
        },
      });
    }

    return successResponse(res, {
      platformName: 'RentLink',
      supportEmail: settings.supportEmail,
      supportPhone: '+92 5811 456789',
      platformFee: settings.platformFeePercent,
      autoApprove: settings.autoApproveListings,
      requireVerification: true,
      maintenanceMode: settings.maintenanceMode,
      visitWindowDays: 14,
      maxImagesPerListing: 8,
      payoutHoldDays: settings.payoutHoldDays,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveSettings(req, res, next) {
  try {
    const { platformFee, autoApprove, maintenanceMode, supportEmail, payoutHoldDays } = req.body;

    const updateData = {};
    if (platformFee !== undefined) updateData.platformFeePercent = Number(platformFee);
    if (autoApprove !== undefined) updateData.autoApproveListings = Boolean(autoApprove);
    if (maintenanceMode !== undefined) updateData.maintenanceMode = Boolean(maintenanceMode);
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail;
    if (payoutHoldDays !== undefined) updateData.payoutHoldDays = Number(payoutHoldDays);

    const updated = await prisma.platformSetting.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        platformFeePercent: platformFee !== undefined ? Number(platformFee) : 5.0,
        autoApproveListings: autoApprove !== undefined ? Boolean(autoApprove) : false,
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : false,
        supportEmail: supportEmail || 'support@rentlink.pk',
        payoutHoldDays: payoutHoldDays !== undefined ? Number(payoutHoldDays) : 7,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_SETTINGS',
        targetType: 'PLATFORM_SETTING',
        targetId: 'global',
        details: JSON.stringify(updateData),
      },
    });

    return successResponse(res, updated, 'Platform settings saved successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return successResponse(res, logs);
  } catch (error) {
    next(error);
  }
}
