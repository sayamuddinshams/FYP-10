import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { MOCK_USERS } from '../../frontend-3/src/data/users.js';
import { MOCK_PROPERTIES } from '../../frontend-3/src/data/properties.js';
import { MOCK_VISITS } from '../../frontend-3/src/data/visits.js';
import { MOCK_NOTIFICATIONS } from '../../frontend-3/src/data/notifications.js';
import { MOCK_TRANSACTIONS, MOCK_ADS, MOCK_REPORTS } from '../../frontend-3/src/data/platform.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.visitRequest.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();

  // Platform setting
  await prisma.platformSetting.create({
    data: {
      id: 'global',
      platformFeePercent: 5.0,
      autoApproveListings: false,
      maintenanceMode: false,
      payoutHoldDays: 7,
      supportEmail: 'support@rentlink.pk',
    },
  });

  const defaultPasswordHash = await bcrypt.hash('rentlink123', 10);

  // 1. Seed Users
  for (const u of MOCK_USERS) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: defaultPasswordHash,
        role: u.role,
        phone: u.phone || '',
        district: u.district || '',
        city: u.city || '',
        area: u.area || '',
        address: u.address || '',
        avatar: u.avatar || null,
        bio: u.bio || '',
        status: u.status || 'active',
        verification: u.verification || 'unverified',
        createdAt: u.joinedAt ? new Date(u.joinedAt) : new Date(),
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_USERS.length} users`);

  // 2. Seed Properties
  const validOwnerIds = new Set(MOCK_USERS.map((u) => u.id));
  let propCount = 0;

  for (const p of MOCK_PROPERTIES) {
    const ownerId = validOwnerIds.has(p.ownerId) ? p.ownerId : 'u6';
    const amenitiesJson = JSON.stringify(Array.isArray(p.amenities) ? p.amenities : []);

    const createdProp = await prisma.property.create({
      data: {
        id: p.id,
        title: p.title,
        type: p.type || 'house',
        description: p.description || '',
        price: p.price || 0,
        district: p.district || 'Gilgit',
        city: p.city || 'Gilgit',
        area: p.area || 'Jutial',
        address: p.address || '',
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        size: p.size || 0,
        furnishing: p.furnishing || 'Unfurnished',
        availableFrom: p.availableFrom || '',
        amenitiesJson,
        status: p.status || 'approved',
        views: p.views || 0,
        featured: Boolean(p.featured),
        adminNote: p.adminNote || '',
        ownerId,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      },
    });

    if (Array.isArray(p.images) && p.images.length > 0) {
      await prisma.propertyImage.createMany({
        data: p.images.map((url, idx) => ({
          propertyId: createdProp.id,
          url,
          order: idx,
        })),
      });
    }
    propCount++;
  }
  console.log(`✓ Seeded ${propCount} properties with images`);

  // 3. Seed Visits
  let visitCount = 0;
  for (const v of MOCK_VISITS) {
    try {
      await prisma.visitRequest.create({
        data: {
          id: v.id,
          propertyId: v.propertyId,
          tenantId: v.tenantId,
          ownerId: v.ownerId,
          date: v.date || '2026-11-01',
          time: v.time || '10:00 AM',
          status: v.status || 'pending',
          message: v.message || '',
          ownerNote: v.ownerNote || '',
          createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
        },
      });
      visitCount++;
    } catch {
      // skip invalid relations if any
    }
  }
  console.log(`✓ Seeded ${visitCount} visit requests`);

  // 4. Seed Notifications
  let notifCount = 0;
  for (const n of MOCK_NOTIFICATIONS) {
    if (!validOwnerIds.has(n.userId)) continue;
    try {
      await prisma.notification.create({
        data: {
          id: n.id,
          userId: n.userId,
          type: n.type || 'info',
          title: n.title || 'Notification',
          body: n.body || '',
          link: n.link || '',
          read: Boolean(n.read),
          createdAt: n.at ? new Date(n.at) : new Date(),
        },
      });
      notifCount++;
    } catch {}
  }
  console.log(`✓ Seeded ${notifCount} notifications`);

  // 5. Seed Transactions (with 5% fee calculation)
  let txCount = 0;
  for (const t of MOCK_TRANSACTIONS) {
    try {
      const amount = t.amount || 25000;
      const platformFee = Math.round(amount * 0.05);
      const ownerAmount = amount - platformFee;
      const createdAt = t.date ? new Date(t.date) : new Date();
      const payoutEligibilityDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      await prisma.transaction.create({
        data: {
          id: t.id,
          propertyId: t.propertyId || 'p1',
          tenantId: t.tenantId || 'u1',
          ownerId: t.ownerId || 'u6',
          amount,
          platformFee,
          ownerAmount,
          status: t.status || 'completed',
          payoutStatus: t.payoutStatus || 'eligible',
          payoutEligibilityDate,
          date: t.date || '2026-10-01',
          createdAt,
        },
      });
      txCount++;
    } catch {}
  }
  console.log(`✓ Seeded ${txCount} transactions`);

  // 6. Seed Advertisements
  for (const a of MOCK_ADS) {
    await prisma.advertisement.create({
      data: {
        id: a.id,
        title: a.title,
        description: a.description || '',
        image: a.image || '',
        targetType: a.targetType || 'all',
        target: a.target || 'All Gilgit-Baltistan',
        start: a.start || '2026-10-01',
        end: a.end || '2026-12-31',
        status: a.status || 'active',
        owner: a.owner || 'RentLink',
        impressions: a.impressions || 0,
        clicks: a.clicks || 0,
      },
    });
  }
  console.log(`✓ Seeded ${MOCK_ADS.length} advertisements`);

  // 7. Seed Reports
  for (const r of MOCK_REPORTS) {
    try {
      await prisma.report.create({
        data: {
          id: r.id,
          type: r.type || 'property',
          reporterId: r.reporterId || 'u1',
          targetId: r.targetId || 'p1',
          targetLabel: r.targetLabel || 'Property Listing',
          reason: r.reason || 'General Inquiry',
          details: r.details || '',
          status: r.status || 'open',
          resolution: r.resolution || '',
        },
      });
    } catch {}
  }
  console.log(`✓ Seeded ${MOCK_REPORTS.length} moderation reports`);

  console.log('\n🎉 SQLite database seeding completed successfully!');
}

main()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
