import { ObjectId } from 'mongodb';
import { collections, toIdQuery, normalizeDoc } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatConversation(c, currentUserId, property = null, p1 = null, p2 = null, msgs = []) {
  if (!c) return null;
  const doc = normalizeDoc(c);
  const isP1 = doc.participant1Id === currentUserId;
  const otherUser = isP1 ? p2 : p1;
  const otherId = isP1 ? doc.participant2Id : doc.participant1Id;

  const messages = msgs.map((m) => {
    const mDoc = normalizeDoc(m);
    const createdAt = mDoc.createdAt instanceof Date ? mDoc.createdAt.toISOString() : (mDoc.createdAt || new Date().toISOString());
    return {
      id: mDoc.id,
      senderId: mDoc.senderId,
      text: mDoc.text,
      read: Boolean(mDoc.read),
      at: createdAt,
    };
  });

  const lastMessage = messages[messages.length - 1] || null;
  const unreadCount = messages.filter((m) => m.senderId !== currentUserId && !m.read).length;

  const propImages = Array.isArray(property?.images) ? property.images : [];
  const firstImage = propImages.length > 0
    ? (typeof propImages[0] === 'string' ? propImages[0] : propImages[0]?.url || null)
    : null;

  const updatedAtStr = doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString());

  return {
    id: doc.id,
    propertyId: doc.propertyId,
    property: property
      ? {
          id: property.id || property._id?.toString(),
          title: property.title,
          image: firstImage,
          location: `${property.area || ''}, ${property.city || ''}`,
        }
      : null,
    other: otherUser
      ? {
          id: otherUser.id || otherUser._id?.toString(),
          name: otherUser.name,
          role: otherUser.role,
          avatar: otherUser.avatar,
          verification: otherUser.verification,
        }
      : { id: otherId, name: 'User' },
    unread: unreadCount,
    lastMessage,
    updatedAt: updatedAtStr,
    messages,
    participants: [doc.participant1Id, doc.participant2Id],
  };
}

async function populateConversationDetails(c, currentUserId) {
  const doc = normalizeDoc(c);
  const cId = doc.id;

  const [property, p1, p2, messages] = await Promise.all([
    collections.properties().findOne(toIdQuery(doc.propertyId)),
    collections.users().findOne(toIdQuery(doc.participant1Id)),
    collections.users().findOne(toIdQuery(doc.participant2Id)),
    collections.messages()
      .find({ conversationId: cId })
      .sort({ createdAt: 1 })
      .toArray(),
  ]);

  return formatConversation(doc, currentUserId, property, p1, p2, messages);
}

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await collections.conversations()
      .find({
        $or: [{ participant1Id: userId }, { participant2Id: userId }],
      })
      .sort({ updatedAt: -1 })
      .toArray();

    const formatted = await Promise.all(
      conversations.map((c) => populateConversationDetails(c, userId))
    );

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await collections.conversations().findOne(toIdQuery(id));
    if (!conversation) {
      return errorResponse(res, 'Conversation not found.', 404);
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const cId = conversation.id || conversation._id.toString();

    // Mark unread messages sent by other user as read
    await collections.messages().updateMany(
      {
        conversationId: cId,
        senderId: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    const formatted = await populateConversationDetails(conversation, userId);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function openConversation(req, res, next) {
  try {
    const { propertyId, otherUserId } = req.body;
    const currentUserId = req.user.id;

    if (!propertyId || !otherUserId) {
      return errorResponse(res, 'propertyId and otherUserId are required.', 400);
    }

    const [p1, p2] =
      currentUserId < otherUserId
        ? [currentUserId, otherUserId]
        : [otherUserId, currentUserId];

    let conversation = await collections.conversations().findOne({
      propertyId,
      $or: [
        { participant1Id: p1, participant2Id: p2 },
        { participant1Id: p2, participant2Id: p1 },
      ],
    });

    if (!conversation) {
      const cId = new ObjectId().toString();
      const newConv = {
        _id: cId,
        id: cId,
        propertyId,
        participant1Id: p1,
        participant2Id: p2,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      await collections.conversations().insertOne(newConv);
      conversation = newConv;
    }

    const formatted = await populateConversationDetails(conversation, currentUserId);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    if (!text || !text.trim()) {
      return errorResponse(res, 'Message text cannot be empty.', 400);
    }

    const conversation = await collections.conversations().findOne(toIdQuery(id));
    if (!conversation) {
      return errorResponse(res, 'Conversation not found.', 404);
    }

    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const recipientId =
      conversation.participant1Id === senderId
        ? conversation.participant2Id
        : conversation.participant1Id;

    const cId = conversation.id || conversation._id.toString();
    const msgId = new ObjectId().toString();
    const messageDoc = {
      _id: msgId,
      id: msgId,
      conversationId: cId,
      senderId,
      text: text.trim(),
      read: false,
      createdAt: new Date(),
    };

    await collections.messages().insertOne(messageDoc);

    // Update conversation timestamp
    await collections.conversations().updateOne(
      toIdQuery(id),
      { $set: { updatedAt: new Date() } }
    );

    // Send notification to recipient
    const property = await collections.properties().findOne(toIdQuery(conversation.propertyId));
    const notifId = new ObjectId().toString();
    await collections.notifications().insertOne({
      _id: notifId,
      id: notifId,
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      body: `${req.user.name} sent you a message about "${property?.title || 'property'}".`,
      link: req.user.role === 'owner' ? '/tenant/messages' : '/owner/messages',
      read: false,
      createdAt: new Date(),
    });

    const responseMsg = normalizeDoc(messageDoc);
    return successResponse(res, responseMsg, 'Message sent successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const conversation = await collections.conversations().findOne(toIdQuery(id));
    const cId = conversation ? (conversation.id || conversation._id.toString()) : id;

    await collections.messages().updateMany(
      {
        conversationId: cId,
        senderId: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    return successResponse(res, null, 'Messages marked as read.');
  } catch (error) {
    next(error);
  }
}
