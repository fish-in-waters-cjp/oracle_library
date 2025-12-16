import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 骨架形狀 */
  variant?: 'circle' | 'rectangle';
}

/**
 * Skeleton 元件
 *
 * 載入骨架元件，顯示載入中的佔位動畫。
 */
export default function Skeleton({
  variant = 'rectangle',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-testid="skeleton"
      className={cn(
        'bg-gray-200 animate-pulse',
        variant === 'circle' && 'rounded-full',
        variant === 'rectangle' && 'rounded',
        className
      )}
      {...props}
    />
  );
}
