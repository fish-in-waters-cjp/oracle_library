'use client';

import { useState } from 'react';
import { ConnectModal } from '@iota/dapp-kit';
import Button from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

/**
 * Style 10 樣式定義
 */
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },

  walletIcon: {
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: '50%',
  },

  address: {
    fontFamily: 'monospace',
    fontSize: 'var(--text-sm)',
  },
};

/**
 * ConnectWallet 元件 - Style 10 高端奢華設計
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
    <div style={styles.container}>
      {/* 錢包地址按鈕 */}
      <Button
        variant="secondary"
        disabled={isDisconnecting}
        aria-label={`錢包地址: ${truncatedAddress}`}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
      >
        {/* 錢包圖示 */}
        {walletIcon && (
          <img
            src={walletIcon}
            alt="Wallet Icon"
            style={styles.walletIcon}
          />
        )}

        {/* 截斷的地址 */}
        <span style={styles.address}>{truncatedAddress}</span>
      </Button>

      {/* 斷開連接按鈕 */}
      <Button
        variant="ghost"
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
