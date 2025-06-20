'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './styles.module.css';

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export const UploadZone = ({ onUpload, loading = false }: UploadZoneProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: loading
  });

  return (
    <div
      {...getRootProps()}
      className={`${styles.uploadZone} ${isDragActive ? styles.active : ''} ${loading ? styles.loading : ''}`}
    >
      <input {...getInputProps()} />
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path
            fill="currentColor"
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </svg>
      </div>
      <h3 className={styles.title}>
        {loading ? '上传中...' : isDragActive ? '放开以上传' : '点击或拖拽图片到此处'}
      </h3>
      <p className={styles.subtext}>
        支持 PNG、JPG、JPEG、GIF、WEBP 格式
      </p>
    </div>
  );
}; 