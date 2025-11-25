import { apiClient } from './client';

export const reviewsApi = {
  // Get reviews with optional filters
  getAll: async (filters?: {
    professionalId?: string;
    clientId?: string;
    projectId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.professionalId) params.append('professionalId', filters.professionalId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.projectId) params.append('projectId', filters.projectId);

    return apiClient.get(`/reviews?${params.toString()}`);
  },

  // Create a new review
  create: async (reviewData: {
    project: string;
    professional: string;
    client: string;
    rating: number;
    detailedRatings?: {
      quality?: number;
      communication?: number;
      timeliness?: number;
      professionalism?: number;
    };
    title?: string;
    comment: string;
    images?: Array<{
      url: string;
      description?: string;
    }>;
    wouldRecommend?: boolean;
  }) => {
    return apiClient.post('/reviews', reviewData);
  },

  // Add professional response to review
  addResponse: async (reviewId: string, responseText: string) => {
    return apiClient.put(`/reviews/${reviewId}/response`, {
      text: responseText,
    });
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string) => {
    return apiClient.put(`/reviews/${reviewId}/helpful`, {});
  },
};
