import { apiClient } from './client';

export const proposalsApi = {
  // Get all proposals with optional filters
  getAll: async (filters?: {
    projectId?: string;
    professionalId?: string;
    clientId?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.professionalId) params.append('professionalId', filters.professionalId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);

    return apiClient.get(`/proposals?${params.toString()}`);
  },

  // Get proposal by ID
  getById: async (id: string) => {
    return apiClient.get(`/proposals/${id}`);
  },

  // Create a new proposal
  create: async (proposalData: {
    project: string;
    professional: string;
    client: string;
    budget: number;
    timeline?: {
      startDate?: string;
      estimatedDuration?: {
        value: number;
        unit: string;
      };
      completionDate?: string;
    };
    coverLetter: string;
    scope?: string;
    milestones?: Array<{
      title: string;
      description: string;
      amount: number;
      dueDate?: string;
    }>;
    attachments?: Array<{
      url: string;
      name: string;
      type: string;
    }>;
  }) => {
    return apiClient.post('/proposals', proposalData);
  },

  // Accept a proposal
  accept: async (id: string) => {
    return apiClient.put(`/proposals/${id}/accept`, {});
  },

  // Reject a proposal
  reject: async (id: string, reason?: string) => {
    return apiClient.put(`/proposals/${id}/reject`, { reason });
  },

  // Withdraw a proposal
  withdraw: async (id: string) => {
    return apiClient.put(`/proposals/${id}/withdraw`, {});
  },

  // Update a proposal
  update: async (id: string, updateData: {
    budget?: number;
    timeline?: any;
    coverLetter?: string;
    scope?: string;
    milestones?: any[];
    attachments?: any[];
  }) => {
    return apiClient.put(`/proposals/${id}`, updateData);
  },

  // Delete a proposal
  delete: async (id: string) => {
    return apiClient.delete(`/proposals/${id}`);
  },
};
