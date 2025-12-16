'use client';

import { cn } from '@/lib/utils';
import NFTCard from './nft-card';
import type { OracleNFT } from '@/hooks/use-oracle-nfts';

export interface NFTGridProps {
  nfts: OracleNFT[];
  onNFTClick?: (nft: OracleNFT) => void;
  isLoading?: boolean;
  className?: string;
}

export default function NFTGrid({
  nfts,
  onNFTClick,
  isLoading = false,
  className,
}: NFTGridProps) {
  // 載入狀態：顯示骨架屏
  if (isLoading) {
    return (
      <div
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-8)',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 空狀態：沒有 NFT
  if (nfts.length === 0) {
    return (
      <div className={cn('text-center', className)} style={{ padding: 'var(--space-16) 0' }}>
        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-secondary)' }}>
          尚無收藏的 NFT
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          開始抽取神諭解答並鑄造成 NFT 吧！
        </p>
      </div>
    );
  }

  // 正常狀態：顯示 NFT 網格
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-8)',
      }}
    >
      {nfts.map((nft) => (
        <NFTCard
          key={nft.id}
          {...nft}
          onClick={() => onNFTClick?.(nft)}
        />
      ))}
    </div>
  );
}

// NFT 卡片骨架屏元件
function NFTCardSkeleton() {
  return (
    <div
      data-testid="nft-skeleton"
      className="animate-pulse overflow-hidden"
      style={{
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* 圖像骨架 - 正方形 */}
      <div
        className="aspect-square"
        style={{ background: 'var(--color-background-elevated)' }}
      />

      {/* 內容骨架 */}
      <div style={{ padding: 'var(--space-6)' }}>
        {/* 標題骨架 */}
        <div
          style={{
            height: '1.25rem',
            background: 'var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            width: '75%',
            marginBottom: 'var(--space-3)',
          }}
        />

        {/* 副標題骨架 */}
        <div
          style={{
            height: '1rem',
            background: 'var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            marginBottom: 'var(--space-4)',
          }}
        />

        {/* Footer 骨架 */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div
            style={{
              height: '1.5rem',
              background: 'var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              width: '4rem',
            }}
          />
          <div
            style={{
              height: '1rem',
              background: 'var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              width: '5rem',
            }}
          />
        </div>
      </div>
    </div>
  );
}
