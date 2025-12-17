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
    if (balance !== 0n) {
      setOptimisticBalance(null);
    }
  }, [balance]);

  // 計算顯示用的餘額（Optimistic UI）
  const displayedBalance = optimisticBalance !== null ? optimisticBalance : balance;
  const displayedBalanceString = (Number(displayedBalance) / 1_000_000_000).toString();

  // 取得可用的 MGC Coin ID
  const DRAW_COST = 10_000_000_000n; // 10 MGC
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
      <div className="space-y-8">
        {/* MGC 餘額顯示 */}
        <div
          ref={balanceRef}
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg"
        >
          <h1 className="text-xl font-bold">你的智慧碎片</h1>
          <div className="mt-2 flex items-baseline">
            {balanceLoading || coinsLoading ? (
              <div className="h-12 w-32 animate-pulse rounded bg-white/20"></div>
            ) : (
              <>
                <span className="text-5xl font-bold">{displayedBalanceString}</span>
                <span className="ml-2 text-2xl">MGC</span>
                {optimisticBalance !== null && (
                  <span className="ml-3 text-sm opacity-75">
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
        {address && mgcCoinId ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">抽取解答之書</h2>
            <DrawSection
              mgcCoinId={mgcCoinId}
              onDrawStart={handleDrawStart}
              onDrawSuccess={handleDrawSuccess}
              onMintSuccess={handleMintSuccess}
            />
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-gray-500">
              {!address
                ? '請先連接錢包'
                : coinsLoading
                ? '載入中...'
                : 'MGC 不足，請先完成簽到獲得 MGC'}
            </p>
          </div>
        )}
      </div>

      {/* 飛行數字動畫 */}
      {flyingNumbers}
    </PageTransition>
  );
}
