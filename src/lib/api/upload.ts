import apiClient, { handleApiError } from './client';
import { Image } from '@/types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error: string;
}

export const uploadImage = async (file: File): Promise<Image> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<Image>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError<ApiErrorResponse>);
  }
};

export const getHistory = async (): Promise<Image[]> => {
  try {
    const response = await apiClient.get<Image[]>('/upload/history');
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError<ApiErrorResponse>);
  }
};

export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    await apiClient.delete(`/upload/${imageId}`);
  } catch (error) {
    throw handleApiError(error as AxiosError<ApiErrorResponse>);
  }
}; 