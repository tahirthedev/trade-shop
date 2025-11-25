import { api } from './client';

export const profileApi = {
  // Get professional profile by user ID
  getProfessionalByUserId: async (userId: string) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.get(`/professionals/user/${userId}`, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch professional profile');
    }
  },

  // Get professional profile
  getProfile: async (professionalId: string) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.get(`/professionals/${professionalId}`, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  // Update professional profile
  updateProfile: async (professionalId: string, data: any) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.put(`/professionals/${professionalId}`, data, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  // Update user basic info
  updateUser: async (userId: string, data: any) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.put(`/users/${userId}`, data, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // Portfolio management
  addPortfolioItem: async (professionalId: string, item: any) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.post(`/professionals/${professionalId}/portfolio`, item, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add portfolio item');
    }
  },

  deletePortfolioItem: async (professionalId: string, itemId: string) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.delete(`/professionals/${professionalId}/portfolio/${itemId}`, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete portfolio item');
    }
  },

  // Certification management
  addCertification: async (professionalId: string, cert: any) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.post(`/professionals/${professionalId}/certifications`, cert, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add certification');
    }
  },

  deleteCertification: async (professionalId: string, certId: string) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.delete(`/professionals/${professionalId}/certifications/${certId}`, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete certification');
    }
  },

  // Work experience management
  addWorkExperience: async (professionalId: string, exp: any) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.post(`/professionals/${professionalId}/experience`, exp, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add work experience');
    }
  },

  deleteWorkExperience: async (professionalId: string, expId: string) => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await api.delete(`/professionals/${professionalId}/experience/${expId}`, token);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete work experience');
    }
  }
};
