'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './styles.module.css';

// 压缩选项
const COMPRESS_OPTIONS = [
  { 
    label: '智能压缩', 
    value: 'smart',
    description: '自动分析图片内容，在保持视觉质量的同时最大化压缩率'
  },
  { 
    label: '保持原样', 
    value: 'original',
    description: '仅优化图片格式，保持原始质量，适合对图片质量要求高的场景'
  },
] as const;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
}

export default function CompressPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [compressMode, setCompressMode] = useState<'smart' | 'original'>('smart');
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'pending' as const
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  const compressImage = async (image: ImageFile) => {
    try {
      // 更新状态为压缩中
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'compressing' } : img
      ));

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', image.file);

      // 调用压缩 API
      const result = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error('压缩失败');
      }

      // 获取压缩后的图片数据
      const compressedBlob = await result.blob();
      const compressedUrl = URL.createObjectURL(compressedBlob);
      const compressedSize = compressedBlob.size;
      const compressionRatio = (1 - compressedSize / image.originalSize) * 100;

      // 更新图片信息
      setImages(prev => prev.map(img => 
        img.id === image.id ? {
          ...img,
          preview: compressedUrl,
          compressedSize,
          compressionRatio,
          status: 'done'
        } : img
      ));
    } catch (err) {
      setImages(prev => prev.map(img => 
        img.id === image.id ? {
          ...img,
          status: 'error',
          error: err instanceof Error ? err.message : '压缩失败'
        } : img
      ));
    }
  };

  const handleCompressAll = async () => {
    if (images.length === 0) return;

    setIsCompressing(true);
    try {
      // 并发压缩所有待处理的图片
      await Promise.all(
        images
          .filter(img => img.status === 'pending')
          .map(img => compressImage(img))
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = (image: ImageFile) => {
    const link = document.createElement('a');
    link.href = image.preview;
    link.download = `compressed-${image.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemove = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleReset = () => {
    // 清理所有预览 URL
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusText = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'compressing': return '压缩中';
      case 'done': return '已完成';
      case 'error': return '失败';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>图片压缩</h1>
      
      <div className={styles.content}>
        {images.length === 0 ? (
          <div {...getRootProps()} className={`${styles.uploadZone} ${isDragActive ? styles.dragActive : ''}`}>
            <input {...getInputProps()} />
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
            <div className={styles.text}>
              <h3 className={styles.title}>
                {isDragActive ? '放开以上传图片' : '拖放图片到这里'}
              </h3>
              <p className={styles.subtext}>
                支持拖拽单个或多个图片文件，也可以直接点击选择
              </p>
              <p className={styles.subtext}>
                支持 PNG、JPG、JPEG、GIF 格式，单个文件最大 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.compressContainer}>
            <div className={styles.toolbar}>
              <div className={styles.options}>
                <div className={styles.optionGroup}>
                  <label className={styles.label}>压缩模式</label>
                  <div className={styles.buttons}>
                    {COMPRESS_OPTIONS.map(({ label, value, description }) => (
                      <button
                        key={label}
                        className={`${styles.optionButton} ${compressMode === value ? styles.active : ''}`}
                        onClick={() => setCompressMode(value)}
                        title={description}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.optionDescription}>
                    {COMPRESS_OPTIONS.find(opt => opt.value === compressMode)?.description}
                  </p>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.actionButton} onClick={handleReset}>
                  清空列表
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.primary}`} 
                  onClick={handleCompressAll}
                  disabled={isCompressing || !images.some(img => img.status === 'pending')}
                >
                  {isCompressing ? '压缩中...' : '开始压缩'}
                </button>
              </div>
            </div>

            <div className={styles.imageList}>
              {images.map(image => (
                <div key={image.id} className={styles.imageCard}>
                  <div className={styles.imagePreview}>
                    <img src={image.preview} alt={image.file.name} />
                    <button 
                      className={styles.removeButton}
                      onClick={() => handleRemove(image.id)}
                      title="从列表中移除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.imageInfo}>
                    <div className={styles.fileName} title={image.file.name}>
                      {image.file.name}
                    </div>
                    <div className={styles.fileStats}>
                      <div className={styles.statItem}>
                        <span className={styles.label}>原始大小</span>
                        <span className={styles.value}>{formatFileSize(image.originalSize)}</span>
                      </div>
                      {image.compressedSize && (
                        <>
                          <div className={styles.statItem}>
                            <span className={styles.label}>压缩后大小</span>
                            <span className={styles.value}>{formatFileSize(image.compressedSize)}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.label}>压缩比例</span>
                            <span className={styles.value}>{image.compressionRatio?.toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.imageActions}>
                      <span className={`${styles.status} ${styles[image.status]}`}>
                        {getStatusText(image.status)}
                      </span>
                      {image.status === 'done' && (
                        <button 
                          className={`${styles.actionButton} ${styles.primary}`}
                          onClick={() => handleDownload(image)}
                          title="下载压缩后的图片"
                        >
                          下载
                        </button>
                      )}
                      {image.status === 'error' && (
                        <span className={styles.error}>{image.error}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 