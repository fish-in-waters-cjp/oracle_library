'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Badge from './ui/badge';
import type { OracleNFT, Rarity } from '@/hooks/use-oracle-nfts';

export interface NFTDetailModalProps {
  open: boolean;
  nft: OracleNFT | null;
  onClose: () => void;
  className?: string;
}

// NFT 圖標映射 (根據稀有度) - 用於 fallback
const RARITY_ICONS: Record<Rarity, string> = {
  legendary: '🌟',
  epic: '💪',
  rare: '📚',
  common: '📖',
};

/**
 * 根據 answerId 取得卡片圖片 URL
 * 注意：answerId 是 0-49，圖片檔名是 1-50，所以需要 +1
 */
function getCardImageUrl(answerId: number): string | null {
  // answerId 0-49 對應圖片 1.png - 50.png
  const imageId = answerId + 1;
  if (imageId >= 1 && imageId <= 50) {
    return `/game/cards/faces/${imageId}.png`;
  }
  return null;
}

const RARITY_LABELS: Record<Rarity, string> = {
  legendary: '傳說',
  epic: '史詩',
  rare: '稀有',
  common: '普通',
};

export default function NFTDetailModal({
  open,
  nft,
  onClose,
  className,
}: NFTDetailModalProps) {
  // ESC 鍵關閉
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滾動
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/60 backdrop-blur-sm',
            'flex items-center justify-center p-4',
            className
          )}
          onClick={onClose}
        >
          {nft && (
            <motion.div
              data-testid="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full max-w-2xl',
                'bg-background',
                'border border-border',
                'rounded-xl shadow-2xl',
                'overflow-hidden'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-heading font-semibold">NFT 詳情</h3>
                <button
                  onClick={onClose}
                  aria-label="關閉"
                  className={cn(
                    'p-2 rounded-lg',
                    'text-foreground-secondary hover:text-foreground',
                    'hover:bg-background-secondary',
                    'transition-colors'
                  )}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* NFT 圖像 */}
                <div className="relative flex items-center justify-center h-80 bg-gradient-to-br from-background to-background-secondary rounded-lg overflow-hidden">
                  {/* 稀有度光暈 */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-30 blur-3xl',
                      nft.rarity === 'legendary' && 'bg-rarity-legendary',
                      nft.rarity === 'epic' && 'bg-rarity-epic',
                      nft.rarity === 'rare' && 'bg-rarity-rare',
                      nft.rarity === 'common' && 'bg-rarity-common'
                    )}
                  />
                  {/* 顯示卡片圖片或 fallback 圖標 */}
                  {getCardImageUrl(nft.answerId) ? (
                    <Image
                      src={getCardImageUrl(nft.answerId)!}
                      alt={`NFT Card #${nft.answerId}`}
                      fill
                      className="object-contain relative z-10"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <span className="relative z-10 text-8xl select-none">
                      {RARITY_ICONS[nft.rarity]}
                    </span>
                  )}
                </div>

                {/* NFT 資訊 */}
                <div className="space-y-4">
                  {/* 稀有度 */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      稀有度
                    </div>
                    <Badge variant={nft.rarity}>
                      {RARITY_LABELS[nft.rarity]}
                    </Badge>
                  </div>

                  {/* 問題 */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      問題
                    </div>
                    <div className="text-foreground">{nft.question}</div>
                  </div>

                  {/* 解答（英文） */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      解答（英文）
                    </div>
                    <div className="text-foreground italic">{nft.answerEn}</div>
                  </div>

                  {/* 解答（中文） */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      解答（中文）
                    </div>
                    <div className="text-foreground">{nft.answerZh}</div>
                  </div>

                  {/* 鑄造時間 */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      鑄造時間
                    </div>
                    <div className="text-foreground">
                      {formatDate(nft.mintedAt)}
                    </div>
                  </div>

                  {/* NFT ID */}
                  <div>
                    <div className="text-sm text-foreground-tertiary mb-1">
                      NFT ID
                    </div>
                    <div className="font-mono text-sm text-foreground-secondary">
                      #{nft.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <button
                  onClick={onClose}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-background-secondary',
                    'text-foreground',
                    'hover:bg-border',
                    'transition-colors'
                  )}
                >
                  關閉
                </button>
                <button
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-primary text-primary-foreground',
                    'hover:bg-primary/90',
                    'transition-colors'
                  )}
                >
                  查看鏈上資訊
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
