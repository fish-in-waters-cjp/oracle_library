'use client';

import { cn } from '@/lib/utils';
import Badge from './ui/badge';
import type { Rarity } from '@/hooks/use-oracle-nfts';

export interface NFTCardProps {
  id: string;
  rarity: Rarity;
  question: string;
  answerZh: string;
  mintedAt: string;
  onClick?: () => void;
  className?: string;
}

// NFT 圖標映射 (根據稀有度)
const RARITY_ICONS: Record<Rarity, string> = {
  legendary: '🌟',
  epic: '💪',
  rare: '📚',
  common: '📖',
};

export default function NFTCard({
  id,
  rarity,
  question,
  answerZh,
  mintedAt,
  onClick,
  className,
}: NFTCardProps) {
  // 格式化日期 (只顯示日期部分)
  const formattedDate = new Date(mintedAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // 稀有度光暈樣式
  const glowStyles: Record<Rarity, React.CSSProperties> = {
    legendary: {
      background: 'radial-gradient(circle, var(--color-rarity-legendary) 0%, transparent 70%)',
      animation: 'pulse 2s ease-in-out infinite',
    },
    epic: {
      background: 'radial-gradient(circle, var(--color-rarity-epic) 0%, transparent 70%)',
    },
    rare: {
      background: 'radial-gradient(circle, var(--color-rarity-rare) 0%, transparent 70%)',
    },
    common: {
      background: 'radial-gradient(circle, var(--color-rarity-common) 0%, transparent 70%)',
    },
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'cursor-pointer',
        'overflow-hidden',
        'rounded-lg',
        'transition-all duration-300',
        'hover:-translate-y-1',
        'hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      style={{
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* NFT 圖像區域 - 正方形 */}
      <div
        className="relative flex items-center justify-center aspect-square"
        style={{ background: 'var(--color-background-elevated)' }}
      >
        {/* 稀有度光暈效果 */}
        <div
          className="absolute inset-0 opacity-10"
          style={glowStyles[rarity]}
          aria-hidden="true"
        />

        {/* NFT 圖標 */}
        <span
          className="relative z-10 select-none"
          style={{ fontSize: 'var(--text-5xl)' }}
          role="img"
          aria-label={`${rarity} NFT icon`}
        >
          {RARITY_ICONS[rarity]}
        </span>
      </div>

      {/* NFT 內容區域 */}
      <div style={{ padding: 'var(--space-6)' }}>
        {/* 答案文字 (作為標題) - 金色 */}
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-3)',
            fontWeight: 'var(--font-weight-normal)',
          }}
        >
          {answerZh}
        </h3>

        {/* 問題 (作為副標題) */}
        <p
          className="truncate"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {question}
        </p>

        {/* Footer: 稀有度 Badge + 日期 */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <Badge variant={rarity}>{getRarityLabel(rarity)}</Badge>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}

// 輔助函數：取得稀有度標籤
function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    legendary: '傳說',
    epic: '史詩',
    rare: '稀有',
    common: '普通',
  };
  return labels[rarity];
}
