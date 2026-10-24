import { MongoClient, ObjectId } from 'mongodb';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

let client = null;
let db = null;

export { ObjectId };

/**
 * Connect to MongoDB and reuse connection across the application.
 */
export async function connectDB() {
  if (db && client) {
    return db;
  }

  const uri = ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = ENV.MONGODB_DB_NAME || 'rentlink';

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(dbName);
    logger.info(`✓ MongoDB connected successfully to database "${dbName}" via native driver`);

    // Ensure collections and indexes are initialized
    await initDBIndexes(db);

    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Get active database instance.
 */
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Get active MongoClient instance.
 */
export function getMongoClient() {
  return client;
}

/**
 * Gracefully close the MongoDB client connection.
 */
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('Closed MongoDB connection.');
  }
}

/**
 * Collection accessors
 */
export const collections = {
  users: () => getDB().collection('users'),
  properties: () => getDB().collection('properties'),
  visitRequests: () => getDB().collection('visitRequests'),
  favorites: () => getDB().collection('favorites'),
  conversations: () => getDB().collection('conversations'),
  messages: () => getDB().collection('messages'),
  notifications: () => getDB().collection('notifications'),
  transactions: () => getDB().collection('transactions'),
  advertisements: () => getDB().collection('advertisements'),
  reports: () => getDB().collection('reports'),
  auditLogs: () => getDB().collection('auditLogs'),
  platformSettings: () => getDB().collection('platformSettings'),
};

/**
 * Convert string/ObjectId into a safe query filter for ID.
 * Supports both string IDs (e.g. "u1", "p1") and MongoDB ObjectIds.
 */
export function toIdQuery(id) {
  if (!id) return { _id: null };
  const strId = String(id).trim();
  if (ObjectId.isValid(strId) && new ObjectId(strId).toString() === strId) {
    return {
      $or: [{ _id: new ObjectId(strId) }, { _id: strId }, { id: strId }],
    };
  }
  return {
    $or: [{ _id: strId }, { id: strId }],
  };
}

/**
 * Normalize MongoDB document: ensures string `id` field and removes `_id` duplication.
 */
export function normalizeDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  const id = doc.id || (_id ? _id.toString() : '');
  return {
    ...rest,
    id,
  };
}

/**
 * Initialize all collection indexes safely and idempotently.
 */
export async function initDBIndexes(database = null) {
  const targetDb = database || getDB();

  try {
    // 1. Users collection
    const users = targetDb.collection('users');
    await users.createIndex({ email: 1 }, { unique: true, background: true });
    await users.createIndex({ role: 1 }, { background: true });
    await users.createIndex({ status: 1 }, { background: true });
    await users.createIndex({ id: 1 }, { sparse: true, background: true });

    // 2. Properties collection
    const properties = targetDb.collection('properties');
    await properties.createIndex({ ownerId: 1 }, { background: true });
    await properties.createIndex({ status: 1 }, { background: true });
    await properties.createIndex({ district: 1 }, { background: true });
    await properties.createIndex({ city: 1 }, { background: true });
    await properties.createIndex({ type: 1 }, { background: true });
    await properties.createIndex({ price: 1 }, { background: true });
    await properties.createIndex({ featured: 1 }, { background: true });
    await properties.createIndex({ createdAt: -1 }, { background: true });
    await properties.createIndex({ id: 1 }, { sparse: true, background: true });

    // 3. VisitRequests collection
    const visits = targetDb.collection('visitRequests');
    await visits.createIndex({ propertyId: 1 }, { background: true });
    await visits.createIndex({ tenantId: 1 }, { background: true });
    await visits.createIndex({ ownerId: 1 }, { background: true });
    await visits.createIndex({ status: 1 }, { background: true });
    await visits.createIndex({ createdAt: -1 }, { background: true });
    await visits.createIndex({ id: 1 }, { sparse: true, background: true });

    // 4. Favorites collection
    const favorites = targetDb.collection('favorites');
    await favorites.createIndex(
      { userId: 1, propertyId: 1 },
      { unique: true, background: true }
    );
    await favorites.createIndex({ userId: 1 }, { background: true });

    // 5. Conversations collection
    const conversations = targetDb.collection('conversations');
    await conversations.createIndex(
      { propertyId: 1, participant1Id: 1, participant2Id: 1 },
      { unique: true, background: true }
    );
    await conversations.createIndex({ participant1Id: 1 }, { background: true });
    await conversations.createIndex({ participant2Id: 1 }, { background: true });
    await conversations.createIndex({ updatedAt: -1 }, { background: true });
    await conversations.createIndex({ id: 1 }, { sparse: true, background: true });

    // 6. Messages collection
    const messages = targetDb.collection('messages');
    await messages.createIndex(
      { conversationId: 1, createdAt: 1 },
      { background: true }
    );
    await messages.createIndex({ senderId: 1 }, { background: true });
    await messages.createIndex({ id: 1 }, { sparse: true, background: true });

    // 7. Notifications collection
    const notifications = targetDb.collection('notifications');
    await notifications.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await notifications.createIndex({ userId: 1, read: 1 }, { background: true });
    await notifications.createIndex({ id: 1 }, { sparse: true, background: true });

    // 8. Transactions collection
    const transactions = targetDb.collection('transactions');
    await transactions.createIndex({ propertyId: 1 }, { background: true });
    await transactions.createIndex({ tenantId: 1 }, { background: true });
    await transactions.createIndex({ ownerId: 1 }, { background: true });
    await transactions.createIndex({ status: 1 }, { background: true });
    await transactions.createIndex({ createdAt: -1 }, { background: true });
    await transactions.createIndex({ id: 1 }, { sparse: true, background: true });

    // 9. Advertisements collection
    const advertisements = targetDb.collection('advertisements');
    await advertisements.createIndex({ status: 1, start: 1, end: 1 }, { background: true });
    await advertisements.createIndex({ id: 1 }, { sparse: true, background: true });

    // 10. Reports collection
    const reports = targetDb.collection('reports');
    await reports.createIndex({ status: 1 }, { background: true });
    await reports.createIndex({ reporterId: 1 }, { background: true });
    await reports.createIndex({ id: 1 }, { sparse: true, background: true });

    // 11. AuditLogs collection
    const auditLogs = targetDb.collection('auditLogs');
    await auditLogs.createIndex({ adminId: 1, createdAt: -1 }, { background: true });

    // 12. PlatformSettings collection
    const platformSettings = targetDb.collection('platformSettings');
    await platformSettings.createIndex({ id: 1 }, { unique: true, background: true });

    logger.info('✓ MongoDB indexes verified and established successfully.');
  } catch (error) {
    logger.warn('Index initialization warning:', error.message);
  }
}
