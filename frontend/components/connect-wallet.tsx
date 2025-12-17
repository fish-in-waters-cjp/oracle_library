'use client';

import { useState } from 'react';
import { ConnectModal } from '@iota/dapp-kit';
import Button from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { cn } from '@/lib/utils';

/**
 * ConnectWallet 元件
 *
 * 根據錢包連接狀態顯示不同的按鈕：
 * - 未連接：顯示「連接錢包」按鈕，點擊打開連接模態框
 * - 已連接：顯示截斷的地址和錢包圖示，提供斷開連接功能
 *
 * @example
 * ```tsx
 * <ConnectWallet />
 * ```
 */
export function ConnectWallet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isConnected,
    truncatedAddress,
    walletIcon,
    disconnect,
    isDisconnecting,
  } = useWalletConnection();

  // 未連接狀態：顯示連接按鈕
  if (!isConnected) {
    return (
      <ConnectModal
        trigger={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            aria-label="連接錢包"
          >
            連接錢包
          </Button>
        }
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    );
  }

  // 已連接狀態：顯示地址和斷開按鈕
  return (
    <div className="flex items-center gap-2">
      {/* 錢包地址按鈕 */}
      <Button
        variant="outline"
        className={cn(
          'flex items-center gap-2',
          isDisconnecting && 'cursor-not-allowed'
        )}
        disabled={isDisconnecting}
        aria-label={`錢包地址: ${truncatedAddress}`}
      >
        {/* 錢包圖示 */}
        {walletIcon && (
          <img
            src={walletIcon}
            alt="Wallet Icon"
            className="h-5 w-5 rounded-full"
          />
        )}

        {/* 截斷的地址 */}
        <span className="font-mono text-sm">{truncatedAddress}</span>
      </Button>

      {/* 斷開連接按鈕 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={disconnect}
        loading={isDisconnecting}
        disabled={isDisconnecting}
        aria-label="斷開錢包連接"
      >
        {isDisconnecting ? '斷開中...' : '斷開'}
      </Button>
    </div>
  );
}
