import './globals.css';
import type { Metadata } from 'next';
import StarryBackground from '@/components/StarryBackground';
import PerformanceMonitor from '@/components/PerformanceMonitor';

export const metadata: Metadata = {
  title: '巧克力作品集',
  description: '展示巧克力的各类艺术作品，包括AI动画、3D动画、建模、平面设计、绘画等',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <StarryBackground />
        <PerformanceMonitor />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
