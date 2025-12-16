import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'legendary' | 'epic' | 'rare' | 'common';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge 變體（稀有度） */
  variant?: BadgeVariant;
  /** 內容 */
  children: ReactNode;
}

/**
 * Badge 元件 (Style 10 - 高端奢華)
 *
 * 用於顯示稀有度標籤、狀態標籤等小型資訊標籤。
 * 使用極簡設計，細邊框，與對應稀有度的顏色。
 *
 * @example
 * ```tsx
 * // 稀有度標籤
 * <Badge variant="legendary">Legendary</Badge>
 * <Badge variant="epic">Epic</Badge>
 * <Badge variant="rare">Rare</Badge>
 * <Badge variant="common">Common</Badge>
 *
 * // 預設為 common
 * <Badge>標籤</Badge>
 * ```
 */
export default function Badge({
  variant = 'common',
  children,
  className,
  style,
  ...props
}: BadgeProps) {
  // 稀有度顏色映射
  const variantColors = {
    legendary: {
      borderColor: 'var(--color-rarity-legendary)',
      color: 'var(--color-rarity-legendary)',
    },
    epic: {
      borderColor: 'var(--color-rarity-epic)',
      color: 'var(--color-rarity-epic)',
    },
    rare: {
      borderColor: 'var(--color-rarity-rare)',
      color: 'var(--color-rarity-rare)',
    },
    common: {
      borderColor: 'var(--color-rarity-common)',
      color: 'var(--color-rarity-common)',
    },
  };

  // Style 10 - Badge 樣式
  const badgeStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-normal)',
    border: '1px solid',
    borderColor: variantColors[variant].borderColor,
    color: variantColors[variant].color,
    ...style,
  };

  return (
    <span
      className={cn('transition-colors', className)}
      style={badgeStyles}
      {...props}
    >
      {children}
    </span>
  );
}
