import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** 尺寸（像素） */
  size?: number;
}

/**
 * Spinner 元件 (Style 10 - 高端奢華)
 *
 * 優雅的載入動畫，使用金色作為主色調。
 * 緩慢旋轉動畫（0.8秒一圈）展現高端質感。
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size={60} />
 * ```
 */
export default function Spinner({ size = 40, className, style, ...props }: SpinnerProps) {
  const spinnerStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    border: '1px solid var(--color-border-default)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    ...style,
  };

  return (
    <div className={cn(className)} style={spinnerStyles} role="status" {...props}>
      <span className="sr-only">載入中...</span>
    </div>
  );
}
