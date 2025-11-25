import { api } from './client';

export const aiApi = {
  chat: (message: string, userType: string, conversationHistory: any[]) =>
    api.post('/ai/chat', {
      message,
      userType,
      conversationHistory,
    }),

  analyzeProject: (description: string, images?: string[]) =>
    api.post('/ai/analyze-project', {
      description,
      images: images || [],
    }),
};
