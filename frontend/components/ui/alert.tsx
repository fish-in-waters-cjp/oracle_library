import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** 警告訊息類型 */
  type?: AlertType;
  /** 訊息內容 */
  children: ReactNode;
}

/**
 * Alert 元件 (Style 10 - 高端奢華)
 *
 * 優雅的警告訊息元件，支援 4 種狀態：成功、警告、錯誤、資訊。
 * 使用半透明背景與相應顏色的邊框。
 *
 * @example
 * ```tsx
 * <Alert type="success">操作成功！</Alert>
 * <Alert type="warning">注意：餘額不足</Alert>
 * <Alert type="error">錯誤：操作失敗</Alert>
 * <Alert type="info">提示：每日簽到可獲得獎勵</Alert>
 * ```
 */
export default function Alert({
  type = 'info',
  children,
  className,
  style,
  ...props
}: AlertProps) {
  // 類型顏色映射
  const typeColors = {
    success: {
      bg: 'rgba(16, 185, 129, 0.05)',
      border: 'var(--color-success)',
      color: 'var(--color-success)',
    },
    warning: {
      bg: 'rgba(212, 175, 55, 0.05)',
      border: 'var(--color-warning)',
      color: 'var(--color-warning)',
    },
    error: {
      bg: 'rgba(220, 38, 38, 0.05)',
      border: 'var(--color-error)',
      color: 'var(--color-error)',
    },
    info: {
      bg: 'rgba(192, 192, 192, 0.05)',
      border: 'var(--color-info)',
      color: 'var(--color-info)',
    },
  };

  // Alert styles - Style 10
  const alertStyles: React.CSSProperties = {
    padding: 'var(--space-5)',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${typeColors[type].border}`,
    background: typeColors[type].bg,
    color: typeColors[type].color,
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    ...style,
  };

  return (
    <div className={cn('transition-all', className)} style={alertStyles} role="alert" {...props}>
      {children}
    </div>
  );
}
