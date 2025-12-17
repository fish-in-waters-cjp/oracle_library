'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/animated/page-transition';
import { ConnectWallet } from '@/components/connect-wallet';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

/**
 * 登入頁面
 *
 * 未連接錢包時顯示圖書館入口視覺和連接按鈕。
 * 已連接時自動跳轉到主頁面。
 */
export default function LoginPage() {
  const router = useRouter();
  const { isConnected } = useWalletConnection();

  // 已連接時自動跳轉到主頁
  useEffect(() => {
    if (isConnected) {
      router.push('/home');
    }
  }, [isConnected, router]);

  // 未連接時顯示登入頁面
  return (
    <PageTransition variant="fade">
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4">
        {/* 圖書館入口視覺 */}
        <div className="mb-12 text-center">
          {/* Logo/Title */}
          <h1 className="mb-4 text-6xl font-bold text-white md:text-7xl">
            永恆圖書館
          </h1>
          <h2 className="text-2xl font-light text-blue-200 md:text-3xl">
            Eternal Library
          </h2>

          {/* 描述 */}
          <p className="mt-8 max-w-md text-lg text-blue-100">
            探索智慧之源，每日簽到獲得智慧碎片
            <br />
            提出問題，抽取神諭解答
            <br />
            將答案鑄造成永恆的 NFT 收藏
          </p>
        </div>

        {/* 連接錢包按鈕 */}
        <div className="flex flex-col items-center gap-4">
          <ConnectWallet />

          {/* 網路提示 */}
          <p className="text-sm text-blue-300">
            使用 IOTA {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </p>
        </div>

        {/* 裝飾性元素 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* 光暈效果 */}
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        </div>
      </div>
    </PageTransition>
  );
}
