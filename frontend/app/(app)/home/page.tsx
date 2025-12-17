'use client';

import PageTransition from '@/components/animated/page-transition';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { useMGCBalance } from '@/hooks/use-mgc-balance';
import { CheckInCard } from '@/components/check-in-card';

/**
 * 主頁面
 *
 * 包含簽到區塊和抽取解答區塊
 */
export default function HomePage() {
  const { address } = useWalletConnection();
  const { displayBalance, isLoading: balanceLoading } = useMGCBalance(address);

  return (
    <PageTransition variant="fade">
      <div className="space-y-8">
        {/* MGC 餘額顯示 */}
        <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <h1 className="text-xl font-bold">你的智慧碎片</h1>
          <div className="mt-2 flex items-baseline">
            {balanceLoading ? (
              <div className="h-12 w-32 animate-pulse rounded bg-white/20"></div>
            ) : (
              <>
                <span className="text-5xl font-bold">{displayBalance}</span>
                <span className="ml-2 text-2xl">MGC</span>
              </>
            )}
          </div>
        </div>

        {/* 簽到區塊 */}
        <CheckInCard />

        {/* 抽取解答區塊（US3 時實作） */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-500">
            抽取解答區塊（US3 時實作）
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
