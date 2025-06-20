export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  userId: string;
  name: string;
  url: string;
  size: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  format: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface CompressOptions {
  quality: number;
  format?: 'jpeg' | 'png' | 'webp';
} 