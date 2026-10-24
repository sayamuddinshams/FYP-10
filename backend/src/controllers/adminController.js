import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
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
      collections.users().countDocuments({ role: 'tenant' }),
      collections.users().countDocuments({ role: 'owner' }),
      collections.users().countDocuments({ status: 'suspended' }),
      collections.properties().countDocuments({}),
      collections.properties().countDocuments({ status: 'pending' }),
      collections.properties().countDocuments({ status: 'approved' }),
      collections.visitRequests().countDocuments({}),
      collections.reports().countDocuments({ status: 'open' }),
      collections.transactions().find({ status: 'completed' }).toArray(),
    ]);

    const grossValue = transactions.reduce((a, t) => a + (t.amount || 0), 0);
    const platformRevenue = transactions.reduce((a, t) => a + (t.platformFee || 0), 0);

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
      collections.users().countDocuments({}),
      collections.properties().countDocuments({}),
      collections.properties().countDocuments({ status: 'pending' }),
      collections.reports().countDocuments({ status: 'open' }),
      collections.visitRequests().countDocuments({}),
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
    let settings = await collections.platformSettings().findOne({ id: 'global' });
    if (!settings) {
      settings = {
        _id: 'global',
        id: 'global',
        platformFeePercent: 5.0,
        autoApproveListings: false,
        maintenanceMode: false,
        payoutHoldDays: 7,
        supportEmail: 'support@rentlink.pk',
        updatedAt: new Date(),
      };
      await collections.platformSettings().insertOne(settings);
    }

    return successResponse(res, {
      platformName: 'RentLink',
      supportEmail: settings.supportEmail || 'support@rentlink.pk',
      supportPhone: '+92 5811 456789',
      platformFee: settings.platformFeePercent ?? 5.0,
      autoApprove: Boolean(settings.autoApproveListings),
      requireVerification: true,
      maintenanceMode: Boolean(settings.maintenanceMode),
      visitWindowDays: 14,
      maxImagesPerListing: 8,
      payoutHoldDays: settings.payoutHoldDays ?? 7,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveSettings(req, res, next) {
  try {
    const { platformFee, autoApprove, maintenanceMode, supportEmail, payoutHoldDays } = req.body;

    const updateData = { updatedAt: new Date() };
    if (platformFee !== undefined) updateData.platformFeePercent = Number(platformFee);
    if (autoApprove !== undefined) updateData.autoApproveListings = Boolean(autoApprove);
    if (maintenanceMode !== undefined) updateData.maintenanceMode = Boolean(maintenanceMode);
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail;
    if (payoutHoldDays !== undefined) updateData.payoutHoldDays = Number(payoutHoldDays);

    await collections.platformSettings().updateOne(
      { id: 'global' },
      {
        $set: updateData,
        $setOnInsert: { _id: 'global', id: 'global' },
      },
      { upsert: true }
    );

    const updated = await collections.platformSettings().findOne({ id: 'global' });

    // Record audit log
    const logId = new ObjectId().toString();
    await collections.auditLogs().insertOne({
      _id: logId,
      id: logId,
      adminId: req.user.id,
      action: 'UPDATE_SETTINGS',
      targetType: 'PLATFORM_SETTING',
      targetId: 'global',
      details: JSON.stringify(updateData),
      createdAt: new Date(),
    });

    return successResponse(res, normalizeDoc(updated), 'Platform settings saved successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await collections.auditLogs()
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const adminIds = [...new Set(logs.map((l) => l.adminId).filter(Boolean))];
    const admins = await collections.users()
      .find({ $or: [{ id: { $in: adminIds } }, { _id: { $in: adminIds } }] })
      .toArray();

    const adminMap = new Map();
    for (const a of admins) {
      adminMap.set(a.id || a._id.toString(), {
        id: a.id || a._id.toString(),
        name: a.name,
        email: a.email,
      });
    }

    const formatted = logs.map((log) => {
      const doc = normalizeDoc(log);
      return {
        ...doc,
        admin: adminMap.get(doc.adminId) || null,
      };
    });

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}
