'use client';

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PageTransitionProps {
  /** 子元素 */
  children: ReactNode;
  /** 動畫變體 */
  variant?: 'fade' | 'slide';
  /** 滑動方向（僅當 variant='slide' 時有效） */
  direction?: 'from-left' | 'from-right';
  /** 自訂 className */
  className?: string;
}

/**
 * PageTransition 元件
 *
 * 提供頁面切換動畫效果。
 */
export default function PageTransition({
  children,
  variant = 'fade',
  direction = 'from-left',
  className,
}: PageTransitionProps) {
  const fadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideVariants: Variants = {
    initial: {
      opacity: 0,
      x: direction === 'from-left' ? -50 : 50,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: direction === 'from-left' ? 50 : -50,
    },
  };

  const variants = variant === 'fade' ? fadeVariants : slideVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
