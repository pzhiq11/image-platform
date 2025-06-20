import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

export const getUserId = () => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const userId = getUserId();
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  return config;
});

interface ApiErrorResponse {
  error: string;
}

export const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error('网络错误');
};

export default apiClient; 