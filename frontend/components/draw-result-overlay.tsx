'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Answer, Rarity, RARITY_COLORS } from '@/hooks/use-answers';
import { MintConfirmModal } from './mint-confirm-modal';
import Button from '@/components/ui/button';

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

/**
 * IOTA Explorer Base URL
 */
const EXPLORER_BASE_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.rebased.iota.org';

/**
 * DrawResultOverlay Props
 */
interface DrawResultOverlayProps {
  /** 答案資料 */
  answer: Answer;
  /** 稀有度 */
  rarity: Rarity;
  /** DrawRecord Object ID */
  recordId: string;
  /** 再抽一次回調 */
  onDrawAgain: () => void;
  /** 鑄造 NFT 回調 */
  onMintNFT: () => void;
  /** 是否正在鑄造 */
  isMinting?: boolean;
  /** MGC 餘額（用於確認對話框）*/
  mgcBalance?: number;
  /** 已鑄造的 NFT ID（可選，用於顯示 Explorer 連結） */
  mintedNftId?: string | null;
}

/**
 * 稀有度顯示名稱（中文）
 */
const RARITY_NAMES: Record<Rarity, string> = {
  Common: '普通',
  Rare: '稀有',
  Epic: '史詩',
  Legendary: '傳說',
};

/**
 * 稀有度文字色
 */
const RARITY_TEXT_COLORS: Record<Rarity, string> = {
  Common: '#9ca3af',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#d4af37',
};

/**
 * 樣式定義
 */
const styles = {
  container: {
    position: 'relative' as const,
    maxWidth: '32rem',
    margin: '0 auto',
  },

  card: {
    background: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-glow-gold)',
    overflow: 'hidden',
    border: '1px solid var(--color-border-default)',
  },

  decorBar: {
    height: '0.25rem',
  },

  content: {
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-6)',
  },

  rarityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    background: 'var(--color-background-elevated)',
    borderRadius: '9999px',
    border: '1px solid var(--color-border-default)',
  },

  buttonGroup: {
    display: 'flex',
    gap: 'var(--space-4)',
    paddingTop: 'var(--space-4)',
  },

  secondaryButton: {
    flex: 1,
    padding: 'var(--space-3) var(--space-6)',
    background: 'var(--color-background-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--color-text-primary)',
    fontWeight: 'var(--font-weight-semibold)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },

  glowEffect: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    borderRadius: 'var(--radius-xl)',
  },

  floatingDecor: {
    position: 'absolute' as const,
    width: '2rem',
    height: '2rem',
    opacity: 0.5,
    fontSize: '1.5rem',
  },
};

/**
 * DrawResultOverlay - 抽取結果顯示
 *
 * 美化的結果顯示元件，顯示答案內容、稀有度和操作按鈕
 * Style 10 高端奢華設計
 */
export function DrawResultOverlay({
  answer,
  rarity,
  recordId,
  onDrawAgain,
  onMintNFT,
  isMinting = false,
  mgcBalance = 0,
  mintedNftId = null,
}: DrawResultOverlayProps) {
  const [showMintModal, setShowMintModal] = useState(false);

  // NFT 是否已鑄造
  const hasMintedNFT = !!mintedNftId;

  // Explorer 連結
  const explorerUrl = mintedNftId
    ? `${EXPLORER_BASE_URL}/object/${mintedNftId}`
    : null;

  const rarityName = RARITY_NAMES[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const rarityTextColor = RARITY_TEXT_COLORS[rarity];

  const MINT_COST = 5;

  /**
   * 處理鑄造按鈕點擊
   */
  const handleMintClick = () => {
    setShowMintModal(true);
  };

  /**
   * 處理確認鑄造
   */
  const handleConfirmMint = () => {
    setShowMintModal(false);
    onMintNFT();
  };

  /**
   * 處理取消鑄造
   */
  const handleCancelMint = () => {
    setShowMintModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={styles.container}
    >
      {/* 主卡片容器 */}
      <div style={styles.card}>
        {/* 稀有度裝飾條 */}
        <div
          style={{
            ...styles.decorBar,
            background: rarityColor,
          }}
        />

        {/* 內容區域 */}
        <div style={styles.content}>
          {/* 卡片圖片與稀有度 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            {/* 卡片圖片 */}
            {getCardImageUrl(answer.id - 1) && (
              <motion.div
                initial={{ scale: 0.8, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                style={{
                  position: 'relative',
                  width: '240px',
                  height: '320px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: `0 0 40px ${rarityColor}50`,
                  border: `3px solid ${rarityTextColor}`,
                }}
              >
                <Image
                  src={getCardImageUrl(answer.id - 1)!}
                  alt={`Oracle Card #${answer.id}`}
                  fill
                  className="object-cover"
                  sizes="240px"
                  priority
                />
                {/* 稀有度光暈 */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 50%, ${rarityColor}20, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
            )}

            {/* 稀有度標籤 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <span style={{
                ...styles.rarityBadge,
                padding: 'var(--space-2) var(--space-6)',
                border: `1px solid ${rarityTextColor}`,
              }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: rarityTextColor }}>
                  {rarityName}
                </span>
              </span>
            </motion.div>
          </motion.div>

          {/* 操作按鈕 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.buttonGroup}
          >
            {/* 再抽一次按鈕 */}
            <motion.button
              onClick={onDrawAgain}
              disabled={isMinting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...styles.secondaryButton,
                opacity: isMinting ? 0.6 : 1,
                cursor: isMinting ? 'not-allowed' : 'pointer',
              }}
            >
              再抽一次
            </motion.button>

            {/* 根據是否已鑄造顯示不同按鈕 */}
            {hasMintedNFT ? (
              /* 已鑄造：顯示 Explorer 連結 */
              <motion.a
                href={explorerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-4) var(--space-8)',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-base)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-slow)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                查看 NFT
              </motion.a>
            ) : (
              /* 未鑄造：顯示鑄造按鈕 */
              <Button
                onClick={handleMintClick}
                disabled={isMinting}
                loading={isMinting}
                style={{ flex: 1 }}
              >
                {isMinting ? '鑄造中...' : '鑄造 NFT'}
              </Button>
            )}
          </motion.div>
        </div>

        {/* 稀有度光效（僅 Epic 和 Legendary）*/}
        {(rarity === 'Epic' || rarity === 'Legendary') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              ...styles.glowEffect,
              background: `radial-gradient(circle at 50% 50%, ${rarityColor}20, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* 外部裝飾粒子（僅 Legendary）*/}
      {rarity === 'Legendary' && (
        <>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ ...styles.floatingDecor, top: '-1rem', left: '-1rem' }}
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ ...styles.floatingDecor, top: '-1rem', right: '-1rem' }}
          >
            ⭐
          </motion.div>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ ...styles.floatingDecor, bottom: '-1rem', left: '-1rem' }}
          >
            💫
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 22, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ ...styles.floatingDecor, bottom: '-1rem', right: '-1rem' }}
          >
            🌟
          </motion.div>
        </>
      )}

      {/* 鑄造確認對話框 */}
      <MintConfirmModal
        isOpen={showMintModal}
        answer={answer}
        rarity={rarity}
        mintCost={MINT_COST}
        mgcBalance={mgcBalance}
        onConfirm={handleConfirmMint}
        onCancel={handleCancelMint}
        isMinting={isMinting}
      />
    </motion.div>
  );
}
