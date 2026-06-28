'use client';

import { useEffect, useRef, useState, useMemo, useId } from 'react';
import './starry-background.css';

// 闪烁效果参数配置接口
export interface StarAnimationConfig {
  minCycleDuration: number;      // 最小闪烁周期（秒）
  maxCycleDuration: number;      // 最大闪烁周期（秒）
  minFadeDuration: number;       // 最小淡入淡出时间（秒）
  maxFadeDuration: number;       // 最大淡入淡出时间（秒）
  minPauseDuration: number;      // 最小消失暂停时间（秒）
  maxPauseDuration: number;      // 最大消失暂停时间（秒）
  minBaseOpacity: number;        // 最小基础透明度
  maxBaseOpacity: number;        // 最大基础透明度
  minSize: number;               // 最小星星尺寸（px）
  maxSize: number;               // 最大星星尺寸（px）
}

// 默认配置
const DEFAULT_CONFIG: StarAnimationConfig = {
  minCycleDuration: 3,      // 最小闪烁周期
  maxCycleDuration: 8,      // 最大闪烁周期
  minFadeDuration: 0.8,     // 最小淡入淡出时间
  maxFadeDuration: 1.5,     // 最大淡入淡出时间
  minPauseDuration: 0.5,    // 最小消失暂停时间
  maxPauseDuration: 2,      // 最大消失暂停时间
  minBaseOpacity: 0.15,     // 最小基础透明度
  maxBaseOpacity: 0.4,      // 最大基础透明度
  minSize: 2,               // 最小星星尺寸
  maxSize: 4,               // 最大星星尺寸
};

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;      // 基础透明度
  cycleDuration: number;    // 完整闪烁周期（淡入+暂停+淡出）
  fadeInDuration: number;   // 淡入时间
  fadeOutDuration: number;  // 淡出时间
  pauseDuration: number;    // 消失暂停时间
  animationDelay: number;   // 动画延迟
}

interface Meteor {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  size: number;
  trailLength: number;
}

// 使用固定种子生成可重现的随机数
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function StarryBackground({
  config = DEFAULT_CONFIG,
}: {
  config?: StarAnimationConfig;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(true); // 默认开启
  const [isLoaded, setIsLoaded] = useState(true); // 默认 true，立即显示
  const [isMobile, setIsMobile] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const instanceId = useId(); // 每个实例的唯一 ID

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 从 localStorage 读取用户偏好（仅在客户端）
  useEffect(() => {
    const saved = localStorage.getItem('starryBackgroundEnabled');
    if (saved !== null) {
      setIsEnabled(saved === 'true');
    }
    setHasHydrated(true);
  }, []);

  // 懒加载：进入视口后才创建动效
  useEffect(() => {
    // 立即加载，不使用懒加载
    setIsLoaded(true);
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // 生成星星数据 - 使用固定种子确保 SSR 和客户端一致
  const stars = useMemo(() => {
    const count = isMobile ? 150 : 300;
    const random = seededRandom(instanceId.charCodeAt(instanceId.length - 1) * 1000);
    return Array.from({ length: count }, (_, i) => {
      const r1 = random();
      const r2 = random();
      const r3 = random();
      const r4 = random();
      const r5 = random();
      const r6 = random();
      const r7 = random();
      const r8 = random();
      
      // 计算闪烁参数
      const fadeInDuration = config.minFadeDuration + r1 * (config.maxFadeDuration - config.minFadeDuration);
      const fadeOutDuration = config.minFadeDuration + r2 * (config.maxFadeDuration - config.minFadeDuration);
      const pauseDuration = config.minPauseDuration + r3 * (config.maxPauseDuration - config.minPauseDuration);
      const cycleDuration = Math.max(
        config.minCycleDuration,
        fadeInDuration + fadeOutDuration + pauseDuration + r4 * 2
      );
      
      return {
        id: i,
        x: r5 * 100,
        y: r6 * 100,
        size: config.minSize + r7 * (config.maxSize - config.minSize),
        baseOpacity: config.minBaseOpacity + r8 * (config.maxBaseOpacity - config.minBaseOpacity),
        cycleDuration,
        fadeInDuration,
        fadeOutDuration,
        pauseDuration,
        animationDelay: random() * 5, // 随机延迟 0-5秒
      };
    });
  }, [isMobile, instanceId, config]);

  // 生成流星数据 - 使用固定种子确保 SSR 和客户端一致
  const meteors = useMemo(() => {
    const count = isMobile ? 2 : 4; // 减少同时可见流星数量
    const random = seededRandom(instanceId.charCodeAt(0) * 1000 + instanceId.length);
    return Array.from({ length: count }, (_, i) => {
      const r1 = random();
      const r2 = random();
      const r3 = random();
      const r4 = random();
      const r5 = random();
      return {
        id: i,
        startX: 30 + r1 * 90, // 从屏幕右上方区域开始（30%-120%）
        startY: -20 + r2 * 50, // 初始Y位置范围更广（-20%到30%）
        duration: r3 * 5 + 3, // 减慢速度：3-8秒（之前是1.5-4秒）
        delay: r4 * 10 + 5, // 降低频率：5-15秒延迟（之前是0.5-3秒）
        size: r5 * 2 + 3, // 3-5px
        trailLength: random() * 4 + 8, // 8-12倍长度
      };
    });
  }, [isMobile, instanceId]);

  // 切换动效开关
  const toggleEffect = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem('starryBackgroundEnabled', String(newValue));
  };

  // 渲染星星
  const renderStars = () => {
    return stars.map((star) => (
      <div
        key={star.id}
        className="star"
        style={{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          '--star-opacity': star.baseOpacity,
          animationDelay: `${star.animationDelay}s`,
          animationDuration: `${star.cycleDuration}s`,
        } as React.CSSProperties}
      />
    ));
  };

  // 渲染流星
  const renderMeteors = () => {
    return meteors.map((meteor) => (
      <div
        key={meteor.id}
        className="meteor"
        style={{
          '--start-x': `${meteor.startX}%`,
          '--start-y': `${meteor.startY}%`,
          '--duration': `${meteor.duration}s`,
          '--delay': `${meteor.delay}s`,
          '--size': `${meteor.size}px`,
          '--trail-length': `${meteor.trailLength}`,
          animationDelay: `${meteor.delay}s`,
          animationDuration: `${meteor.duration}s`,
        } as React.CSSProperties}
      >
        <div className="meteor-head" />
        <div className="meteor-trail" />
      </div>
    ));
  };

  // 始终渲染星空背景，按钮根据状态显示
  return (
    <>
      {/* 星空背景容器 - 始终渲染 */}
      <div
        ref={containerRef}
        className={`starry-background ${isEnabled && isLoaded ? 'loaded' : ''}`}
      >
        {/* 星星层 */}
        <div className="stars-layer">
          {isLoaded && renderStars()}
        </div>
        
        {/* 流星层 */}
        <div className="meteors-layer">
          {isLoaded && renderMeteors()}
        </div>
      </div>
      
      {/* 动效控制按钮 - 仅在 hydration 后显示 */}
      {hasHydrated && (
        <button
          onClick={toggleEffect}
          className="starry-toggle-btn"
          title={isEnabled ? "关闭星空动效" : "开启星空动效"}
        >
          {isEnabled ? "✧ 关闭星空" : "✦ 开启星空"}
        </button>
      )}
    </>
  );
}