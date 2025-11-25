import { api } from './client';
import { AuthResponse, LoginFormData, RegisterFormData } from '@/types';

export const authApi = {
  login: (data: LoginFormData) => 
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterFormData) => 
    api.post<AuthResponse>('/auth/register', data),

  getProfile: (token: string) => 
    api.get('/auth/profile', token),
};
