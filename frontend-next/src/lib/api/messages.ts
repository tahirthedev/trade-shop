import { apiClient } from './client';

export const messagesApi = {
  // Get all conversations for a user
  getConversations: async (userId: string) => {
    return apiClient.get(`/messages/conversations?userId=${userId}`);
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string, limit = 50, before?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);
    
    return apiClient.get(`/messages/conversations/${conversationId}?${params.toString()}`);
  },

  // Create or get existing conversation
  createConversation: async (participants: string[], projectId?: string) => {
    return apiClient.post('/messages/conversations', {
      participants,
      project: projectId,
    });
  },

  // Send a message
  sendMessage: async (messageData: {
    conversation: string;
    sender: string;
    recipient: string;
    content: string;
    attachments?: Array<{
      url: string;
      name: string;
      type: string;
      size: number;
    }>;
  }) => {
    return apiClient.post('/messages', messageData);
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    return apiClient.put(`/messages/${messageId}/read`, {});
  },

  // Mark all messages in conversation as read
  markAllAsRead: async (conversationId: string, userId: string) => {
    return apiClient.put(`/messages/conversations/${conversationId}/mark-all-read`, {
      userId,
    });
  },

  // Delete a message
  deleteMessage: async (messageId: string) => {
    return apiClient.delete(`/messages/${messageId}`);
  },

  // Get unread message count
  getUnreadCount: async (userId: string) => {
    return apiClient.get(`/messages/unread-count?userId=${userId}`);
  },
};
