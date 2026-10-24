import { db, emit, getUser } from '../data/store';
import { delay, fail, createNotification } from './core';

function decorate(conversation, userId) {
  const property = db.properties.find((p) => p.id === conversation.propertyId);
  const otherId = conversation.participants.find((id) => id !== userId);
  const other = getUser(otherId);
  const last = conversation.messages[conversation.messages.length - 1];
  return {
    id: conversation.id,
    propertyId: conversation.propertyId,
    property: property ? { id: property.id, title: property.title, image: property.images?.[0], location: `${property.area}, ${property.city}` } : null,
    other: other ? { id: other.id, name: other.name, role: other.role, verification: other.verification } : { id: otherId, name: 'Unknown user' },
    unread: conversation.unread[userId] || 0,
    lastMessage: last || null,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages,
    participants: conversation.participants,
  };
}

const messageService = {
  async conversations(userId) {
    await delay(320);
    if (!userId) fail('Sign in to view messages.');
    const items = db.conversations.filter((c) => c.participants.includes(userId));
    items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return items.map((c) => decorate(c, userId));
  },

  async get(conversationId, userId) {
    await delay(240);
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (!conversation) fail('Conversation not found.');
    return decorate(conversation, userId);
  },

  /** Opens (or reuses) the conversation between a tenant and an owner about a property. */
  async openWith({ propertyId, ownerId, tenantId }) {
    await delay(300);
    let conversation = db.conversations.find((c) => c.propertyId === propertyId && c.participants.includes(tenantId) && c.participants.includes(ownerId));
    if (!conversation) {
      conversation = {
        id: `c_${Math.random().toString(36).slice(2, 9)}`,
        propertyId,
        participants: [tenantId, ownerId],
        unread: { [tenantId]: 0, [ownerId]: 0 },
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      db.conversations.unshift(conversation);
      emit();
    }
    return decorate(conversation, tenantId);
  },

  async send(conversationId, text, senderId) {
    await delay(300);
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (!conversation) fail('Conversation not found.');
    const body = String(text || '').trim();
    if (!body) fail('Message cannot be empty.');

    const message = { id: `m_${Math.random().toString(36).slice(2, 9)}`, senderId, text: body, at: new Date().toISOString() };
    conversation.messages.push(message);
    conversation.updatedAt = message.at;
    conversation.participants.forEach((id) => {
      if (id === senderId) conversation.unread[id] = 0;
      else conversation.unread[id] = (conversation.unread[id] || 0) + 1;
    });

    const recipientId = conversation.participants.find((id) => id !== senderId);
    const property = db.properties.find((p) => p.id === conversation.propertyId);
    createNotification({
      userId: recipientId,
      type: 'message',
      title: 'New message',
      body: `${getUser(senderId)?.name || 'Someone'} sent you a message${property ? ` about ${property.title}` : ''}.`,
      link: getUser(recipientId)?.role === 'owner' ? '/owner/messages' : '/tenant/messages',
    });

    emit();
    return decorate(conversation, senderId);
  },

  async markRead(conversationId, userId) {
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (conversation && conversation.unread[userId]) {
      conversation.unread[userId] = 0;
      emit();
    }
    return true;
  },
};

export default messageService;
