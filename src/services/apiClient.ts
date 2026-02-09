import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {storageService} from './storageService';
import {API_BASE_URL} from '../constants/config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{message?: string}>) => {
    if (error.response) {
      const {status, data} = error.response;

      if (status === 401) {
        storageService.clearAuth();
      }

      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        data,
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  },
);

export default apiClient;
