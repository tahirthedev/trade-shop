import { api } from './client';
import { ProfessionalsResponse } from '@/types';

interface ProfessionalsFilters {
  trade?: string;
  location?: string;
  minScore?: number;
  availability?: string;
  page?: number;
  limit?: number;
}

export const professionalsApi = {
  getAll: (filters?: ProfessionalsFilters) => {
    const params = new URLSearchParams();
    if (filters?.trade) params.append('trade', filters.trade);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.minScore) params.append('minScore', filters.minScore.toString());
    if (filters?.availability) params.append('availability', filters.availability);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return api.get<ProfessionalsResponse>(`/professionals${query}`);
  },

  getById: (id: string) => 
    api.get(`/professionals/${id}`),
};
