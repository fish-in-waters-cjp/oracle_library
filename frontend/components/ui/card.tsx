import { HTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片標題 */
  title?: string;
  /** 卡片內容 */
  children: ReactNode;
  /** 稀有度（影響邊框顏色） */
  rarity?: RarityType;
  /** 是否顯示稀有度徽章 */
  showRarityBadge?: boolean;
}

/**
 * Card 元件 (Style 10 - 高端奢華)
 *
 * 深色背景、優雅邊框、hover 金色發光效果的卡片設計。
 * 支援稀有度系統（Legendary, Epic, Rare, Common）。
 *
 * @example
 * ```tsx
 * // 基本卡片
 * <Card title="標題">內容</Card>
 *
 * // 稀有度卡片
 * <Card title="傳說級" rarity="legendary" showRarityBadge>
 *   稀有內容
 * </Card>
 * ```
 */
export default function Card({
  title,
  children,
  rarity,
  showRarityBadge = false,
  className,
  style,
  ...props
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 稀有度顏色映射
  const rarityColors = {
    common: 'var(--color-rarity-common)',
    rare: 'var(--color-rarity-rare)',
    epic: 'var(--color-rarity-epic)',
    legendary: 'var(--color-rarity-legendary)',
  };

  // 稀有度標籤文字
  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };

  // 卡片 styles - Style 10
  const cardStyles: React.CSSProperties = {
    background: 'var(--color-background-elevated)',
    border: rarity
      ? `1px solid ${rarityColors[rarity]}`
      : '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-8)',
    transition: 'all var(--transition-slow)',
    ...(isHovered ? { boxShadow: 'var(--shadow-glow-gold)' } : {}),
    ...style,
  };

  // 標題 styles - Style 10
  const titleStyles: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-primary)',
    marginBottom: 'var(--space-4)',
    fontWeight: 'var(--font-weight-normal)',
  };

  // 內容 styles - Style 10
  const contentStyles: React.CSSProperties = {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    lineHeight: '1.6',
  };

  // 稀有度徽章 styles - Style 10
  const badgeStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-normal)',
    marginBottom: 'var(--space-3)',
    border: rarity ? `1px solid ${rarityColors[rarity]}` : '1px solid var(--color-border-default)',
    color: rarity ? rarityColors[rarity] : 'var(--color-text-secondary)',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div
      className={cn('transition-all', className)}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* 稀有度徽章 */}
      {showRarityBadge && rarity && (
        <div style={badgeStyles}>{rarityLabels[rarity]}</div>
      )}

      {/* 標題 */}
      {title && <h3 style={titleStyles}>{title}</h3>}

      {/* 內容 */}
      <div style={contentStyles}>{children}</div>
    </div>
  );
}
