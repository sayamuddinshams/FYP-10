import api from './api';
import { emit, fail } from './core';

const messageService = {
  async conversations(userId) {
    const res = await api.get('/messages');
    return Array.isArray(res) ? res : [];
  },

  async get(conversationId, userId) {
    if (!conversationId) fail('Conversation ID is required.');
    return api.get(`/messages/${conversationId}`);
  },

  /** Opens (or reuses) the conversation between a tenant and an owner about a property. */
  async openWith({ propertyId, ownerId, tenantId }) {
    if (!propertyId) fail('Property ID is required.');
    const otherUserId = ownerId || tenantId;
    const conversation = await api.post('/messages/open', {
      propertyId,
      otherUserId,
    });
    emit('messages');
    return conversation;
  },

  async send(conversationId, text, senderId) {
    if (!conversationId) fail('Conversation ID is required.');
    const body = String(text || '').trim();
    if (!body) fail('Message cannot be empty.');

    const res = await api.post(`/messages/${conversationId}`, { text: body });
    emit('messages');
    return res;
  },

  async markRead(conversationId, userId) {
    if (!conversationId) return true;
    try {
      await api.patch(`/messages/${conversationId}/read`);
      emit('messages');
    } catch {
      // non-blocking
    }
    return true;
  },
};

export default messageService;
