'use client';

import PageTransition from '@/components/animated/page-transition';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

/**
 * 主頁面
 *
 * 包含簽到區塊和抽取解答區塊（US2 和 US3 時實作）
 */
export default function HomePage() {
  const { address } = useWalletConnection();

  return (
    <PageTransition variant="fade">
      <div className="space-y-8">
        {/* 歡迎訊息 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            歡迎來到永恆圖書館
          </h1>
          <p className="mt-2 text-gray-600">
            已連接錢包: <span className="font-mono text-sm">{address}</span>
          </p>
        </div>

        {/* 簽到區塊（US2 時實作） */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-500">
            每日簽到區塊（US2 時實作）
          </p>
        </div>

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
