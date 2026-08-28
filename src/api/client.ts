import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

/**
 * Base URL for the backend API.
 * Uses public HTTPS tunnel URL for universal device & recruiter access.
 */
export const API_BASE_URL = 'https://dailyloop-to-do-app.onrender.com/api';

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

// Surface a consistent error message from any failed request & handle 401 automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid -> clear local auth session & emit onUnauthorized event
      await AsyncStorage.multiRemove(['authToken', 'authUser']).catch(() => {});
      DeviceEventEmitter.emit('onUnauthorized');
    }

    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong';
    const customErr: any = new Error(message);
    if (error?.response?.status) {
      customErr.status = error.response.status;
    }
    return Promise.reject(customErr);
  }
);

