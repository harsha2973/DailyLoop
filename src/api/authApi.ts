import { apiClient } from './client';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export const registerRequest = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return data;
};

export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return data;
};

export const changePasswordRequest = async (
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.put<{ message: string }>('/auth/change-password', {
    oldPassword,
    newPassword,
  });
  return data;
};

export const updateProfileRequest = async (
  name: string,
  email: string
): Promise<{ message: string; user: User }> => {
  const { data } = await apiClient.put<{ message: string; user: User }>('/auth/profile', {
    name,
    email,
  });
  return data;
};

