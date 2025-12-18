'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { OracleNFT, Rarity } from '@/hooks/use-oracle-nfts';

interface NFTDetailModalProps {
  open: boolean;
  nft: OracleNFT | null;
  onClose: () => void;
}

/**
 * 稀有度顏色配置
 */
const RARITY_COLORS: Record<Rarity, { bg: string; text: string; glow: string; border: string }> = {
  legendary: {
    bg: 'rgba(212, 175, 55, 0.15)',
    text: '#d4af37',
    glow: 'rgba(212, 175, 55, 0.4)',
    border: '#d4af37',
  },
  epic: {
    bg: 'rgba(167, 139, 250, 0.15)',
    text: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.4)',
    border: '#a78bfa',
  },
  rare: {
    bg: 'rgba(96, 165, 250, 0.15)',
    text: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.4)',
    border: '#60a5fa',
  },
  common: {
    bg: 'rgba(156, 163, 175, 0.15)',
    text: '#9ca3af',
    glow: 'rgba(156, 163, 175, 0.3)',
    border: '#9ca3af',
  },
};

const RARITY_LABELS: Record<Rarity, string> = {
  legendary: '傳說',
  epic: '史詩',
  rare: '稀有',
  common: '普通',
};

/**
 * 根據 answerId 取得卡片圖片 URL
 * answerId 是 0-49，圖片檔名也是 0-49
 */
function getCardImageUrl(answerId: number): string | null {
  if (answerId >= 0 && answerId <= 49) {
    return `/game/cards/faces/${answerId}.png`;
  }
  return null;
}

/**
 * 簡潔樣式定義 - 以卡片為主體
 */
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },

  modal: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
  },

  closeButton: {
    position: 'absolute' as const,
    top: '-48px',
    right: '0',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },

  cardWrapper: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '2.5/3.5',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  infoBar: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },

  rarityBadge: {
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },

  cardNumber: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'var(--font-mono)',
  },

  viewButton: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

export default function NFTDetailModal({
  open,
  nft,
  onClose,
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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!nft) return null;

  const rarityColors = RARITY_COLORS[nft.rarity];
  const cardImageUrl = getCardImageUrl(nft.answerId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={styles.overlay}
          onClick={onClose}
        >
          <motion.div
            data-testid="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={styles.modal}
          >
            {/* 關閉按鈕 */}
            <motion.button
              onClick={onClose}
              aria-label="關閉"
              style={styles.closeButton}
              whileHover={{ background: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* 卡片主體 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                ...styles.cardWrapper,
                boxShadow: `0 20px 60px ${rarityColors.glow}`,
              }}
            >
              {cardImageUrl ? (
                <Image
                  src={cardImageUrl}
                  alt={`Oracle NFT #${nft.answerId + 1}`}
                  fill
                  className="object-cover"
                  sizes="320px"
                  priority
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-background-elevated)',
                }}>
                  <span style={{ fontSize: '4rem', opacity: 0.5 }}>📖</span>
                </div>
              )}
            </motion.div>

            {/* 簡潔資訊列 */}
            <div style={styles.infoBar}>
              <span
                style={{
                  ...styles.rarityBadge,
                  background: rarityColors.bg,
                  color: rarityColors.text,
                  border: `1px solid ${rarityColors.border}60`,
                }}
              >
                {RARITY_LABELS[nft.rarity]}
              </span>
              <span style={styles.cardNumber}>#{nft.answerId + 1}</span>
            </div>

            {/* Explorer 按鈕 */}
            <motion.button
              style={{
                ...styles.viewButton,
                borderColor: `${rarityColors.border}40`,
              }}
              whileHover={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: rarityColors.border,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const network = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
                window.open(`https://explorer.iota.org/object/${nft.id}?network=${network}`, '_blank');
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              在 Explorer 查看
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
