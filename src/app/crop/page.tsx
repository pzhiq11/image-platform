'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './styles.module.css';

// 防抖函数
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 定义裁剪比例选项
const ASPECT_RATIOS = [
  { label: '自由', value: undefined },
  { label: '1:1', value: 1 },
  { label: '2:3', value: 2/3 },
  { label: '3:2', value: 3/2 },
  { label: '4:3', value: 4/3 },
  { label: '3:4', value: 3/4 },
  { label: '9:16', value: 9/16 },
  { label: '16:9', value: 16/9 },
] as const;

export default function CropPage() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialCrop, setIsInitialCrop] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // 更新预览画布
  const updatePreview = useCallback(() => {
    if (!imgRef.current || !previewCanvasRef.current || !crop) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // 计算实际裁剪尺寸
    const pixelCrop = {
      x: crop.x * img.width / 100,
      y: crop.y * img.height / 100,
      width: crop.width * img.width / 100,
      height: crop.height * img.height / 100
    };

    // 设置预览画布尺寸
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // 绘制预览图
    ctx.drawImage(
      img,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  }, [crop]);

  // 使用防抖处理预览更新
  const debouncedUpdatePreview = useCallback(
    debounce(updatePreview, 100),
    [updatePreview]
  );

  // 计算居中裁剪区域
  const calculateCenteredCrop = useCallback((ratio?: number): Crop | undefined => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const imgWidth = img.width;
    const imgHeight = img.height;

    let cropWidth = imgWidth * 0.8; // 默认使用80%的宽度
    let cropHeight = imgHeight * 0.8; // 默认使用80%的高度

    if (ratio) {
      // 根据比例调整裁剪区域
      if (imgWidth / imgHeight > ratio) {
        // 图片更宽，以高度为基准
        cropHeight = imgHeight * 0.8;
        cropWidth = cropHeight * ratio;
      } else {
        // 图片更高，以宽度为基准
        cropWidth = imgWidth * 0.8;
        cropHeight = cropWidth / ratio;
      }
    }

    // 计算居中位置
    const x = (imgWidth - cropWidth) / 2;
    const y = (imgHeight - cropHeight) / 2;

    return {
      unit: 'px' as const,
      x,
      y,
      width: cropWidth,
      height: cropHeight
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setCroppedImage(null);
        setIsInitialCrop(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  // 图片加载完成后设置初始裁剪区域
  useEffect(() => {
    if (image && isInitialCrop && imgRef.current) {
      const initialCrop = calculateCenteredCrop(aspectRatio);
      if (initialCrop) {
        setCrop(initialCrop);
        setIsInitialCrop(false);
      }
    }
  }, [image, aspectRatio, isInitialCrop, calculateCenteredCrop]);

  // 更新预览
  useEffect(() => {
    if (image && !isInitialCrop && !isDragging) {
      debouncedUpdatePreview();
    }
  }, [image, crop, isInitialCrop, isDragging, debouncedUpdatePreview]);

  const handleCropComplete = (crop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    setIsDragging(false);
  };

  const handleCropChange = (c: Crop) => {
    setCrop(c);
    setIsDragging(true);
  };

  const handleAspectRatioChange = (ratio: number | undefined) => {
    setAspectRatio(ratio);
    setIsInitialCrop(true);
  };

  const handleCrop = async () => {
    if (!image || !imgRef.current) return;

    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      // 计算实际裁剪尺寸
      const pixelCrop = {
        x: crop.x * img.width / 100,
        y: crop.y * img.height / 100,
        width: crop.width * img.width / 100,
        height: crop.height * img.height / 100
      };

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        img,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCroppedImage(croppedImageUrl);
    } catch (error) {
      console.error('裁剪失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!croppedImage) return;

    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `cropped-image-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setCrop({
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
    setAspectRatio(undefined);
    setIsInitialCrop(true);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>图片裁剪</h1>
      
      <div className={styles.content}>
        {!image ? (
          <div {...getRootProps()} className={`${styles.uploadZone} ${isDragActive ? styles.dragActive : ''}`}>
            <input {...getInputProps()} />
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
            <div className={styles.text}>
              <h3 className={styles.title}>{isDragActive ? '放开以上传图片' : '拖放图片到这里'}</h3>
              <p className={styles.subtext}>支持 PNG、JPG、JPEG、GIF 格式</p>
            </div>
          </div>
        ) : (
          <div className={styles.cropContainer}>
            <div className={styles.toolbar}>
              <div className={styles.aspectRatios}>
                {ASPECT_RATIOS.map(({ label, value }) => (
                  <button
                    key={label}
                    className={`${styles.ratioButton} ${aspectRatio === value ? styles.active : ''}`}
                    onClick={() => handleAspectRatioChange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.actions}>
                <button className={styles.actionButton} onClick={handleReset}>
                  重新选择
                </button>
                {!croppedImage ? (
                  <button 
                    className={`${styles.actionButton} ${styles.primary}`} 
                    onClick={handleCrop}
                    disabled={isLoading}
                  >
                    {isLoading ? '处理中...' : '确认裁剪'}
                  </button>
                ) : (
                  <button className={`${styles.actionButton} ${styles.primary}`} onClick={handleDownload}>
                    下载图片
                  </button>
                )}
              </div>
            </div>
            <div className={styles.workspace}>
              <div className={styles.cropArea}>
                {!croppedImage ? (
                  <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    aspect={aspectRatio}
                    className={styles.cropComponent}
                  >
                    <img 
                      ref={imgRef}
                      src={image} 
                      alt="待裁剪图片" 
                      className={styles.preview}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </ReactCrop>
                ) : (
                  <img src={croppedImage} alt="裁剪后的图片" className={styles.preview} />
                )}
              </div>
              {!croppedImage && (
                <div className={styles.previewArea}>
                  <h3 className={styles.previewTitle}>预览</h3>
                  <div className={styles.previewContainer}>
                    <canvas
                      ref={previewCanvasRef}
                      className={styles.previewCanvas}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 