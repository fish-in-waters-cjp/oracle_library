'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScaleSpringProps {
  /** 子元素 */
  children: ReactNode;
  /** hover 時的縮放比例 */
  scale?: number;
  /** 初始縮放比例（從此比例彈性放大到 1） */
  initialScale?: number;
  /** 初始延遲時間（秒） */
  delay?: number;
  /** 自訂 className */
  className?: string;
  /** 禁用動畫 */
  disabled?: boolean;
  /** 組合淡入效果 */
  withFadeIn?: boolean;
  /** 組合向上滑動效果 */
  withSlideUp?: boolean;
}

/**
 * ScaleSpring 動畫元件
 *
 * 使用 Framer Motion 實現彈性縮放動畫效果。
 * 支援 hover 互動、初始載入動畫、以及與淡入/滑動效果的組合。
 * 適用於卡片 hover、按鈕互動、NFT 展示等場景。
 *
 * @example
 * ```tsx
 * // 基本 hover 縮放
 * <ScaleSpring>
 *   <Card>Hover me</Card>
 * </ScaleSpring>
 *
 * // 自訂縮放比例
 * <ScaleSpring scale={1.1}>
 *   <Button>點擊我</Button>
 * </ScaleSpring>
 *
 * // 初始彈性放大動畫
 * <ScaleSpring initialScale={0.8} delay={0.2}>
 *   <NFTCard />
 * </ScaleSpring>
 *
 * // 組合淡入效果
 * <ScaleSpring withFadeIn initialScale={0.9}>
 *   <Card>淡入並彈性放大</Card>
 * </ScaleSpring>
 * ```
 */
export default function ScaleSpring({
  children,
  scale = 1.05,
  initialScale,
  delay = 0,
  className,
  disabled = false,
  withFadeIn = false,
  withSlideUp = false,
}: ScaleSpringProps) {
  // 如果禁用動畫，直接返回子元素
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // 計算初始狀態
  const getInitialState = () => {
    const state: any = {};

    if (initialScale !== undefined) {
      state.scale = initialScale;
    }

    if (withFadeIn) {
      state.opacity = 0;
    }

    if (withSlideUp) {
      state.y = 20;
    }

    return Object.keys(state).length > 0 ? state : undefined;
  };

  // 計算動畫後狀態
  const getAnimateState = () => {
    const state: any = { scale: 1 };

    if (withFadeIn) {
      state.opacity = 1;
    }

    if (withSlideUp) {
      state.y = 0;
    }

    return state;
  };

  // 彈性動畫配置
  const springTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    delay,
  };

  return (
    <motion.div
      className={cn(className)}
      initial={getInitialState()}
      animate={getAnimateState()}
      whileHover={{ scale }}
      transition={springTransition}
    >
      {children}
    </motion.div>
  );
}
