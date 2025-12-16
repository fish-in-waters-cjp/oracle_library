import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 骨架形狀 */
  variant?: 'circle' | 'rectangle';
}

/**
 * Skeleton 元件 (Style 10 - 高端奢華)
 *
 * 載入骨架元件，使用優雅的漸變動畫展現載入狀態。
 * 深色背景配合金色微光效果。
 */
export default function Skeleton({
  variant = 'rectangle',
  className,
  style,
  ...props
}: SkeletonProps) {
  const skeletonStyles: React.CSSProperties = {
    background: 'var(--color-background-elevated)',
    borderRadius: variant === 'circle' ? '50%' : 'var(--radius-sm)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    ...style,
  };

  return (
    <div
      data-testid="skeleton"
      className={cn('transition-opacity', className)}
      style={skeletonStyles}
      {...props}
    />
  );
}
