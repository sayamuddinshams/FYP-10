import bcrypt from 'bcryptjs';
import { connectDB, closeDB, collections } from '../config/db.js';
import { MOCK_USERS } from './fixtures/users.js';
import { MOCK_PROPERTIES } from './fixtures/properties.js';
import { MOCK_VISITS } from './fixtures/visits.js';
import { MOCK_NOTIFICATIONS } from './fixtures/notifications.js';
import { MOCK_TRANSACTIONS, MOCK_ADS, MOCK_REPORTS } from './fixtures/platform.js';

export async function seedDatabase() {
  console.log('Seeding MongoDB database...');
  await connectDB();

  // Clear existing records
  await collections.auditLogs().deleteMany({});
  await collections.reports().deleteMany({});
  await collections.advertisements().deleteMany({});
  await collections.transactions().deleteMany({});
  await collections.notifications().deleteMany({});
  await collections.messages().deleteMany({});
  await collections.conversations().deleteMany({});
  await collections.favorites().deleteMany({});
  await collections.visitRequests().deleteMany({});
  await collections.properties().deleteMany({});
  await collections.users().deleteMany({});
  await collections.platformSettings().deleteMany({});

  // 1. Platform Settings
  await collections.platformSettings().insertOne({
    _id: 'global',
    id: 'global',
    platformFeePercent: 5.0,
    autoApproveListings: false,
    maintenanceMode: false,
    payoutHoldDays: 7,
    supportEmail: 'support@rentlink.pk',
    updatedAt: new Date(),
  });

  const defaultPasswordHash = await bcrypt.hash('rentlink123', 10);
  const tenantPasswordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  // 2. Seed Users
  const userDocs = MOCK_USERS.map((u) => {
    let passwordHash = defaultPasswordHash;
    if (u.email.toLowerCase() === 'admin@rentlink.pk') {
      passwordHash = adminPasswordHash;
    } else if (u.email.toLowerCase() === 'tenant@rentlink.pk' || u.email.toLowerCase() === 'owner@rentlink.pk') {
      passwordHash = tenantPasswordHash;
    }

    return {
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase().trim(),
      passwordHash,
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
      updatedAt: new Date(),
    };
  });

  if (userDocs.length > 0) {
    await collections.users().insertMany(userDocs);
  }
  console.log(`✓ Seeded ${userDocs.length} users in MongoDB`);

  // 3. Seed Properties
  const validOwnerIds = new Set(MOCK_USERS.map((u) => u.id));
  const propertyDocs = [];

  for (const p of MOCK_PROPERTIES) {
    const ownerId = validOwnerIds.has(p.ownerId) ? p.ownerId : 'u6';
    const amenities = Array.isArray(p.amenities) ? p.amenities : [];
    const images = Array.isArray(p.images) ? p.images : [];

    propertyDocs.push({
      _id: p.id,
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
      amenities,
      amenitiesJson: JSON.stringify(amenities),
      images,
      status: p.status || 'approved',
      views: p.views || 0,
      featured: Boolean(p.featured),
      adminNote: p.adminNote || '',
      ownerId,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: new Date(),
    });
  }

  if (propertyDocs.length > 0) {
    await collections.properties().insertMany(propertyDocs);
  }
  console.log(`✓ Seeded ${propertyDocs.length} properties in MongoDB`);

  // 4. Seed Visits
  const visitDocs = [];
  for (const v of MOCK_VISITS) {
    visitDocs.push({
      _id: v.id,
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
      updatedAt: new Date(),
    });
  }

  if (visitDocs.length > 0) {
    await collections.visitRequests().insertMany(visitDocs);
  }
  console.log(`✓ Seeded ${visitDocs.length} visit requests in MongoDB`);

  // 5. Seed Notifications
  const notifDocs = [];
  for (const n of MOCK_NOTIFICATIONS) {
    if (!validOwnerIds.has(n.userId)) continue;
    notifDocs.push({
      _id: n.id,
      id: n.id,
      userId: n.userId,
      type: n.type || 'info',
      title: n.title || 'Notification',
      body: n.body || '',
      link: n.link || '',
      read: Boolean(n.read),
      createdAt: n.at ? new Date(n.at) : new Date(),
    });
  }

  if (notifDocs.length > 0) {
    await collections.notifications().insertMany(notifDocs);
  }
  console.log(`✓ Seeded ${notifDocs.length} notifications in MongoDB`);

  // 6. Seed Transactions
  const txDocs = [];
  for (const t of MOCK_TRANSACTIONS) {
    const amount = t.amount || 25000;
    const platformFee = Math.round(amount * 0.05);
    const ownerAmount = amount - platformFee;
    const createdAt = t.date ? new Date(t.date) : new Date();
    const payoutEligibilityDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    txDocs.push({
      _id: t.id,
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
    });
  }

  if (txDocs.length > 0) {
    await collections.transactions().insertMany(txDocs);
  }
  console.log(`✓ Seeded ${txDocs.length} transactions in MongoDB`);

  // 7. Seed Advertisements
  const adDocs = MOCK_ADS.map((a) => ({
    _id: a.id,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (adDocs.length > 0) {
    await collections.advertisements().insertMany(adDocs);
  }
  console.log(`✓ Seeded ${adDocs.length} advertisements in MongoDB`);

  // 8. Seed Reports
  const reportDocs = MOCK_REPORTS.map((r) => ({
    _id: r.id,
    id: r.id,
    type: r.type || 'property',
    reporterId: r.reporterId || 'u1',
    targetId: r.targetId || 'p1',
    targetLabel: r.targetLabel || 'Property Listing',
    reason: r.reason || 'General Inquiry',
    details: r.details || '',
    status: r.status || 'open',
    resolution: r.resolution || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (reportDocs.length > 0) {
    await collections.reports().insertMany(reportDocs);
  }
  console.log(`✓ Seeded ${reportDocs.length} moderation reports in MongoDB`);

  console.log('\n🎉 MongoDB database seeding completed successfully!');
}

// Direct execution
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await closeDB();
    });
}
