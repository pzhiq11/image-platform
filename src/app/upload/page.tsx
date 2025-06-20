'use client';

import { useEffect, useState } from 'react';
import { UploadZone } from '@/components/modules/UploadZone/UploadZone';
import { uploadImage, getHistory } from '@/lib/api/upload';
import { Image } from '@/types';
import styles from './styles.module.css';

export default function UploadPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setImages(data);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const result = await uploadImage(file);
      setImages(prev => [result, ...prev]);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>图片上传</h1>
      <div className={styles.content}>
        <UploadZone onUpload={handleUpload} loading={loading} />
      </div>

      {images.length > 0 && (
        <div className={styles.history}>
          <h2 className={styles.historyTitle}>上传历史</h2>
          <div className={styles.imageGrid}>
            {images.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <div className={styles.imageContainer}>
                  <img src={image.url} alt={image.name} className={styles.image} />
                </div>
                <div className={styles.imageInfo}>
                  <p className={styles.imageName}>{image.name}</p>
                  <div className={styles.imageDetails}>
                    <span>{(image.size / 1024).toFixed(2)} KB</span>
                    <span>{image.format.toUpperCase()}</span>
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  <button
                    className={`${styles.copyButton} ${copiedId === image.id ? styles.copied : ''}`}
                    onClick={() => handleCopyUrl(image.url, image.id)}
                  >
                    {copiedId === image.id ? '已复制' : '复制链接'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 