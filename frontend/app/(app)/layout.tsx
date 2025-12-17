'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { ConnectWallet } from '@/components/connect-wallet';
import { cn } from '@/lib/utils';

/**
 * 應用佈局
 *
 * 已登入使用者的主要佈局，包含導航列和內容區域。
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isConnected } = useWalletConnection();

  // 未連接時跳轉到登入頁
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // 未連接時不渲染內容（等待跳轉）
  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航列 */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo 和導航連結 */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                href="/home"
                className="text-xl font-bold text-indigo-600 hover:text-indigo-700"
              >
                永恆圖書館
              </Link>

              {/* 導航連結 */}
              <div className="hidden md:flex md:items-center md:gap-4">
                <NavLink href="/home">主頁</NavLink>
                <NavLink href="/home/collection">收藏</NavLink>
              </div>
            </div>

            {/* 右側：MGC 餘額 + 錢包 */}
            <div className="flex items-center gap-4">
              {/* MGC 餘額區域（預留位置，US2 時實作） */}
              <div className="hidden md:flex md:items-center md:gap-2">
                {/* 這裡將來會放 BalanceDisplay 元件 */}
              </div>

              {/* 錢包連接狀態 */}
              <ConnectWallet />
            </div>
          </div>

          {/* 移動版導航 */}
          <div className="flex gap-4 pb-3 md:hidden">
            <NavLink href="/home">主頁</NavLink>
            <NavLink href="/home/collection">收藏</NavLink>
          </div>
        </div>
      </nav>

      {/* 主要內容區域 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

/**
 * 導航連結元件
 */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        'text-gray-700 hover:text-indigo-600',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'rounded-md px-3 py-2'
      )}
    >
      {children}
    </Link>
  );
}
