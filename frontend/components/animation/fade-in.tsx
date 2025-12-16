'use client';

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface FadeInProps {
  /** 子元素 */
  children: ReactNode;
  /** 延遲時間（秒） */
  delay?: number;
  /** 持續時間（秒） */
  duration?: number;
  /** 淡入方向 */
  direction?: FadeInDirection;
  /** 位移距離（像素） */
  distance?: number;
  /** 自訂 className */
  className?: string;
  /** 禁用動畫 */
  disabled?: boolean;
}

/**
 * FadeIn 動畫元件
 *
 * 使用 Framer Motion 實現淡入動畫效果，支援多方向位移。
 * 適用於頁面載入、內容展示等場景。
 *
 * @example
 * ```tsx
 * // 基本淡入
 * <FadeIn>
 *   <div>內容</div>
 * </FadeIn>
 *
 * // 延遲淡入
 * <FadeIn delay={0.3}>
 *   <div>延遲內容</div>
 * </FadeIn>
 *
 * // 從下向上淡入
 * <FadeIn direction="up" distance={20}>
 *   <div>向上淡入</div>
 * </FadeIn>
 *
 * // 從左向右淡入
 * <FadeIn direction="left" distance={30}>
 *   <div>從左淡入</div>
 * </FadeIn>
 * ```
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'none',
  distance = 20,
  className,
  disabled = false,
}: FadeInProps) {
  // 如果禁用動畫，直接返回子元素
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // 計算初始位置
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'none':
      default:
        return { opacity: 0 };
    }
  };

  // 計算結束位置
  const getFinalPosition = () => {
    return { x: 0, y: 0, opacity: 1 };
  };

  // Framer Motion 動畫變體
  const variants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      ...getFinalPosition(),
      transition: {
        duration,
        delay,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
