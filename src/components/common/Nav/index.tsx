'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './styles.module.css';

const navItems = [
  { name: '图片上传', path: '/upload' },
  { name: '图片裁剪', path: '/crop' },
  { name: '图片压缩', path: '/compress' },
];

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          智极图片
        </Link>
        <div className={styles.links}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.link} ${pathname === item.path ? styles.active : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}; 