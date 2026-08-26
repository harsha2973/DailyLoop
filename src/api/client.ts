import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL for the backend API.
 * Uses public HTTPS tunnel URL for universal device & recruiter access.
 */
export const API_BASE_URL = 'https://a6309e9e935216.lhr.life/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach stored JWT (if any) to every outgoing request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface a consistent error message from any failed request
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
