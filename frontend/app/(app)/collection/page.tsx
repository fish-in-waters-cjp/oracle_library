'use client';

import { useState, useMemo } from 'react';
import { useCurrentAccount } from '@iota/dapp-kit';
import FadeIn from '@/components/animation/fade-in';
import NFTGrid from '@/components/nft-grid';
import NFTDetailModal from '@/components/nft-detail-modal';
import CollectionStats from '@/components/animated/collection-stats';
import { useOwnedOracleNFTs } from '@/hooks/use-owned-oracle-nfts';
import { MOCK_NFTS } from '@/data/mock-nfts';
import { MOCK_ENABLED } from '@/config/mock';
import type { OracleNFT, NFTStats } from '@/hooks/use-oracle-nfts';

/**
 * 計算 NFT 統計資料
 */
function calculateStats(nfts: OracleNFT[]): NFTStats {
  return {
    total: nfts.length,
    legendary: nfts.filter((n) => n.rarity === 'legendary').length,
    epic: nfts.filter((n) => n.rarity === 'epic').length,
    rare: nfts.filter((n) => n.rarity === 'rare').length,
    common: nfts.filter((n) => n.rarity === 'common').length,
  };
}

export default function CollectionPage() {
  const [selectedNFT, setSelectedNFT] = useState<OracleNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 取得當前帳戶
  const currentAccount = useCurrentAccount();

  // 從鏈上取得 NFT（只有在非 Mock 模式下才會實際查詢）
  const {
    nfts: onChainNFTs,
    isLoading,
    error,
  } = useOwnedOracleNFTs(MOCK_ENABLED ? null : (currentAccount?.address ?? null));

  // 根據 MOCK_ENABLED 設定選擇顯示的 NFT
  const displayNFTs = useMemo(() => {
    if (MOCK_ENABLED) {
      return MOCK_NFTS;
    }
    return onChainNFTs;
  }, [onChainNFTs]);

  // 計算統計資料
  const stats = useMemo(() => {
    return calculateStats(displayNFTs);
  }, [displayNFTs]);

  const handleNFTClick = (nft: OracleNFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNFT(null), 200);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-base)' }}>
      <main
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-8)',
        }}
      >
        {/* 頁面標題 */}
        <FadeIn direction="up">
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-12)',
              textAlign: 'center',
              fontWeight: 'var(--font-weight-normal)',
              letterSpacing: '0.02em',
            }}
          >
            我的收藏
          </h1>
        </FadeIn>

        {/* 錯誤訊息（僅在非 Mock 模式下顯示）*/}
        {!MOCK_ENABLED && error && (
          <FadeIn direction="up">
            <div
              style={{
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
              }}
            >
              {error}
            </div>
          </FadeIn>
        )}

        {/* 未連接錢包提示（僅在非 Mock 模式下顯示）*/}
        {!MOCK_ENABLED && !currentAccount && (
          <FadeIn direction="up">
            <div
              style={{
                padding: 'var(--space-8)',
                marginBottom: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border-default)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                請先連接錢包以查看您的 NFT 收藏
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                連接後將自動載入您擁有的 Oracle NFT
              </p>
            </div>
          </FadeIn>
        )}

        {/* 統計卡片 */}
        <CollectionStats stats={stats} style={{ marginBottom: 'var(--space-12)' }} />

        {/* NFT 網格 */}
        {!MOCK_ENABLED && isLoading ? (
          <FadeIn direction="up">
            <div
              style={{
                padding: 'var(--space-16)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              載入中...
            </div>
          </FadeIn>
        ) : displayNFTs.length > 0 ? (
          <NFTGrid nfts={displayNFTs} onNFTClick={handleNFTClick} />
        ) : (
          <FadeIn direction="up">
            <div
              style={{
                padding: 'var(--space-16)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              您還沒有任何 Oracle NFT
            </div>
          </FadeIn>
        )}

        {/* NFT 詳情 Modal */}
        <NFTDetailModal
          open={isModalOpen}
          nft={selectedNFT}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
}
