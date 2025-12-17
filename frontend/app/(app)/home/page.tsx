'use client';

import { useState, useEffect, useRef } from 'react';
import PageTransition from '@/components/animated/page-transition';
import { useFlyingNumbers } from '@/components/animated/flying-number';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { useMGCBalance } from '@/hooks/use-mgc-balance';
import { useMGCCoins } from '@/hooks/use-mgc-coins';
import { CheckInCard } from '@/components/check-in-card';
import { DrawSection } from '@/components/draw-section';
import { DrawResult } from '@/hooks/use-oracle-draw';

/**
 * 主頁面
 *
 * 包含簽到區塊和抽取解答區塊
 */
export default function HomePage() {
  const { address } = useWalletConnection();
  const {
    balance,
    displayBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useMGCBalance(address);
  const { getCoinWithBalance, isLoading: coinsLoading } = useMGCCoins(address);

  // Optimistic UI 狀態
  const [optimisticBalance, setOptimisticBalance] = useState<bigint | null>(null);

  // 飛行數字動畫
  const { showFlyingNumber, flyingNumbers } = useFlyingNumbers();

  // 餘額顯示區域的 ref（用於定位飛行數字）
  const balanceRef = useRef<HTMLDivElement>(null);

  // 當真實餘額更新時，重置 optimistic balance
  useEffect(() => {
    if (balance !== BigInt(0)) {
      setOptimisticBalance(null);
    }
  }, [balance]);

  // 計算顯示用的餘額（Optimistic UI）
  const displayedBalance = optimisticBalance !== null ? optimisticBalance : balance;
  const displayedBalanceString = (Number(displayedBalance) / 1_000_000_000).toString();

  // 取得可用的 MGC Coin ID
  const DRAW_COST = BigInt(10_000_000_000); // 10 MGC
  const mgcCoinId = getCoinWithBalance(DRAW_COST);

  /**
   * 抽取開始時的回調（Optimistic UI）
   */
  const handleDrawStart = () => {
    // 立即扣除 10 MGC（Optimistic 更新）
    setOptimisticBalance(balance - DRAW_COST);
  };

  /**
   * 抽取成功回調
   */
  const handleDrawSuccess = (result: DrawResult) => {
    console.log('抽取成功:', result);
    // 重新查詢真實餘額
    refetchBalance();
  };

  /**
   * 鑄造成功回調
   */
  const handleMintSuccess = () => {
    // 顯示 -5 MGC 飛行數字動畫
    if (balanceRef.current) {
      const rect = balanceRef.current.getBoundingClientRect();
      showFlyingNumber(-5, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // 重新查詢真實餘額
    refetchBalance();
  };

  return (
    <PageTransition variant="fade">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* MGC 餘額顯示 - Style 10 黑金設計 */}
        <div
          ref={balanceRef}
          style={{
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-background-surface) 0%, var(--color-background-elevated) 100%)',
            border: '1px solid var(--color-border-default)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-glow-gold)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--color-primary)',
              letterSpacing: '0.02em',
            }}
          >
            你的智慧碎片
          </h1>
          <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'baseline' }}>
            {balanceLoading || coinsLoading ? (
              <div
                style={{
                  height: '3rem',
                  width: '8rem',
                  background: 'var(--color-background-elevated)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'pulse 2s infinite',
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-4xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {displayedBalanceString}
                </span>
                <span
                  style={{
                    marginLeft: 'var(--space-2)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  MGC
                </span>
                {optimisticBalance !== null && (
                  <span
                    style={{
                      marginLeft: 'var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    (更新中...)
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 簽到區塊 */}
        <CheckInCard />

        {/* 抽取解答區塊 */}
        {address ? (
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-normal)',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                letterSpacing: '0.02em',
              }}
            >
              抽取解答之書
            </h2>
            <DrawSection
              mgcCoinId={mgcCoinId || ''}
              onDrawStart={handleDrawStart}
              onDrawSuccess={handleDrawSuccess}
              onMintSuccess={handleMintSuccess}
            />
          </div>
        ) : (
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-border-default)',
              background: 'var(--color-background-surface)',
              padding: 'var(--space-8)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)' }}>
              請先連接錢包
            </p>
          </div>
        )}
      </div>

      {/* 飛行數字動畫 */}
      {flyingNumbers}
    </PageTransition>
  );
}
