import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

function formatConversation(c, currentUserId) {
  if (!c) return null;
  const isP1 = c.participant1Id === currentUserId;
  const other = isP1 ? c.participant2 : c.participant1;
  const otherId = isP1 ? c.participant2Id : c.participant1Id;

  const messages = (c.messages || []).map((m) => ({
    id: m.id,
    senderId: m.senderId,
    text: m.text,
    read: m.read,
    at: m.createdAt.toISOString(),
  }));

  const lastMessage = messages[messages.length - 1] || null;
  const unreadCount = (c.messages || []).filter(
    (m) => m.senderId !== currentUserId && !m.read
  ).length;

  return {
    id: c.id,
    propertyId: c.propertyId,
    property: c.property
      ? {
          id: c.property.id,
          title: c.property.title,
          image: c.property.images?.[0]?.url || null,
          location: `${c.property.area}, ${c.property.city}`,
        }
      : null,
    other: other
      ? {
          id: other.id,
          name: other.name,
          role: other.role,
          avatar: other.avatar,
          verification: other.verification,
        }
      : { id: otherId, name: 'User' },
    unread: unreadCount,
    lastMessage,
    updatedAt: c.updatedAt.toISOString(),
    messages,
    participants: [c.participant1Id, c.participant2Id],
  };
}

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        participant1: true,
        participant2: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(
      res,
      conversations.map((c) => formatConversation(c, userId))
    );
  } catch (error) {
    next(error);
  }
}

export async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        participant1: true,
        participant2: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

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

    // Mark unread messages sent by other user as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return successResponse(res, formatConversation(conversation, userId));
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

    // Ensure consistent participant ordering for unique index
    const [p1, p2] =
      currentUserId < otherUserId
        ? [currentUserId, otherUserId]
        : [otherUserId, currentUserId];

    let conversation = await prisma.conversation.findFirst({
      where: {
        propertyId,
        OR: [
          { participant1Id: p1, participant2Id: p2 },
          { participant1Id: p2, participant2Id: p1 },
        ],
      },
      include: {
        property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
        participant1: true,
        participant2: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId,
          participant1Id: p1,
          participant2Id: p2,
        },
        include: {
          property: { include: { images: { orderBy: { order: 'asc' }, take: 1 } } },
          participant1: true,
          participant2: true,
          messages: true,
        },
      });
    }

    return successResponse(res, formatConversation(conversation, currentUserId));
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

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { property: true },
    });

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

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId,
        text: text.trim(),
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Send notification to recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        body: `${req.user.name} sent you a message about "${conversation.property?.title || 'property'}".`,
        link: req.user.role === 'owner' ? '/tenant/messages' : '/owner/messages',
      },
    });

    return successResponse(res, message, 'Message sent successfully.', 201);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return successResponse(res, null, 'Messages marked as read.');
  } catch (error) {
    next(error);
  }
}
