import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'rentlink';
const apply = process.argv.includes('--apply');
const generatedTitle = /^Admin notification test [0-9]+$/;

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const properties = await db.collection('properties').find({ title: generatedTitle }).toArray();
  const propertyIds = [...new Set(properties.flatMap((property) => [property.id, String(property._id)]).filter(Boolean))];
  const conversations = await db.collection('conversations').find({ propertyId: { $in: propertyIds } }).toArray();
  const conversationIds = [...new Set(conversations.flatMap((conversation) => [conversation.id, String(conversation._id)]).filter(Boolean))];
  const notificationFilter = {
    $or: [
      { propertyId: { $in: propertyIds } },
      { 'data.propertyId': { $in: propertyIds } },
      { body: /Admin notification test [0-9]+/ },
      { message: /Admin notification test [0-9]+/ },
    ],
  };

  const counts = {
    properties: properties.length,
    favorites: await db.collection('favorites').countDocuments({ propertyId: { $in: propertyIds } }),
    visitRequests: await db.collection('visitRequests').countDocuments({ propertyId: { $in: propertyIds } }),
    conversations: conversations.length,
    messages: await db.collection('messages').countDocuments({ conversationId: { $in: conversationIds } }),
    transactions: await db.collection('transactions').countDocuments({ propertyId: { $in: propertyIds } }),
    reports: await db.collection('reports').countDocuments({ targetId: { $in: propertyIds } }),
    notifications: await db.collection('notifications').countDocuments(notificationFilter),
  };

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', titles: properties.map((property) => property.title), counts }, null, 2));

  if (apply && properties.length) {
    await db.collection('messages').deleteMany({ conversationId: { $in: conversationIds } });
    await db.collection('conversations').deleteMany({ propertyId: { $in: propertyIds } });
    await db.collection('favorites').deleteMany({ propertyId: { $in: propertyIds } });
    await db.collection('visitRequests').deleteMany({ propertyId: { $in: propertyIds } });
    await db.collection('transactions').deleteMany({ propertyId: { $in: propertyIds } });
    await db.collection('reports').deleteMany({ targetId: { $in: propertyIds } });
    await db.collection('notifications').deleteMany(notificationFilter);
    await db.collection('properties').deleteMany({ _id: { $in: properties.map((property) => property._id) } });
    console.log('Cleanup completed.');
  }
} finally {
  await client.close();
}
