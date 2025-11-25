import { api } from './client';
import { ProjectsResponse } from '@/types';

export const projectsApi = {
  getAll: (token?: string, filters?: { status?: string; clientId?: string; professionalId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.professionalId) params.append('professionalId', filters.professionalId);
    
    const query = params.toString() ? `?${params}` : '';
    return api.get<ProjectsResponse>(`/projects${query}`, token);
  },

  create: (data: any, token: string) => 
    api.post('/projects', data, token),

  update: (id: string, data: any, token?: string) =>
    api.put(`/projects/${id}`, data, token),

  getById: (id: string, token?: string) => 
    api.get(`/projects/${id}`, token),
};
