import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/common/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智极图片平台",
  description: "专业的图片上传、裁剪、压缩平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Nav />
        <main className="main">
          {children}
        </main>
      </body>
    </html>
  );
}
