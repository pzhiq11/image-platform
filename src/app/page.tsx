'use client';

import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    title: '图片上传',
    description: '支持拖拽上传，保存上传历史，复制图片链接',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    path: '/upload'
  },
  {
    title: '图片裁剪',
    description: '智能裁剪，自定义尺寸',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    path: '/crop'
  },
  {
    title: '图片压缩',
    description: '智能压缩，集成tinypng，保持画质，减小体积',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9V4.5M15 9H19.5M9 15v4.5M9 15H4.5M15 15v4.5M15 15h4.5" />
      </svg>
    ),
    path: '/compress'
  }
];

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}> 图片处理平台 </h1>
          <p className={styles.description}>
            一站式图片处理解决方案，支持上传、裁剪、压缩等功能，让您的图片处理更加简单高效。
          </p>
        </div>
      </section>

      <section className={styles.features}>
        {features.map((feature) => (
          <Link key={feature.path} href={feature.path} className={styles.featureCard}>
            <div className={styles.icon}>{feature.icon}</div>
            <h2 className={styles.featureTitle}>{feature.title}</h2>
            <p className={styles.featureDescription}>{feature.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
