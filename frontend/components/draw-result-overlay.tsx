'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Answer, Rarity, RARITY_COLORS } from '@/hooks/use-answers';
import { MintConfirmModal } from './mint-confirm-modal';
import Button from '@/components/ui/button';

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
 * Style 10 稀有度背景色
 */
const RARITY_BG_COLORS: Record<Rarity, string> = {
  Common: 'rgba(156, 163, 175, 0.1)',
  Rare: 'rgba(96, 165, 250, 0.1)',
  Epic: 'rgba(167, 139, 250, 0.1)',
  Legendary: 'rgba(212, 175, 55, 0.15)',
};

/**
 * Style 10 稀有度文字色
 */
const RARITY_TEXT_COLORS: Record<Rarity, string> = {
  Common: '#9ca3af',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#d4af37',
};

/**
 * Style 10 樣式定義
 */
const styles = {
  container: {
    position: 'relative' as const,
    maxWidth: '42rem',
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

  titleSection: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },

  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
    letterSpacing: '0.02em',
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

  rarityLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },

  answerCard: {
    position: 'relative' as const,
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    border: '1px solid var(--color-border-default)',
  },

  quoteDecor: {
    position: 'absolute' as const,
    fontSize: 'var(--text-4xl)',
    opacity: 0.2,
    color: 'var(--color-primary)',
  },

  answerText: {
    position: 'relative' as const,
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    textAlign: 'center' as const,
    lineHeight: 1.8,
    fontWeight: 'var(--font-weight-medium)',
    padding: '0 var(--space-8)',
  },

  answerId: {
    textAlign: 'center' as const,
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
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

  hints: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-1)',
  },

  hint: {
    textAlign: 'center' as const,
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },

  recordId: {
    textAlign: 'center' as const,
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    fontFamily: 'monospace',
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
}: DrawResultOverlayProps) {
  const [showMintModal, setShowMintModal] = useState(false);

  const rarityName = RARITY_NAMES[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const rarityBgColor = RARITY_BG_COLORS[rarity];
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
          {/* 標題與稀有度 */}
          <div style={styles.titleSection}>
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={styles.title}
            >
              解答之書
            </motion.h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <span style={styles.rarityBadge}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: rarityTextColor }}>
                  {rarityName}
                </span>
                <span style={styles.rarityLabel}>稀有度</span>
              </span>
            </motion.div>
          </div>

          {/* 答案內容卡片 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              ...styles.answerCard,
              background: rarityBgColor,
              borderColor: rarityTextColor,
            }}
          >
            {/* 裝飾性引號 */}
            <div style={{ ...styles.quoteDecor, top: 'var(--space-4)', left: 'var(--space-4)' }}>
              「
            </div>
            <div style={{ ...styles.quoteDecor, bottom: 'var(--space-4)', right: 'var(--space-4)' }}>
              」
            </div>

            {/* 答案文字 */}
            <p style={styles.answerText}>
              {answer.text_zh}
            </p>
          </motion.div>

          {/* 答案編號 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={styles.answerId}
          >
            答案編號 #{answer.id.toString().padStart(2, '0')}
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

            {/* 鑄造 NFT 按鈕 */}
            <Button
              onClick={handleMintClick}
              disabled={isMinting}
              loading={isMinting}
              style={{ flex: 1 }}
            >
              {isMinting ? '鑄造中...' : '🎨 鑄造 NFT (5 MGC)'}
            </Button>
          </motion.div>

          {/* 提示文字 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={styles.hints}
          >
            <p style={styles.hint}>
              鑄造 NFT 後，此解答將永久保存至區塊鏈
            </p>
            <p style={styles.recordId}>
              DrawRecord ID: {recordId.substring(0, 12)}...
            </p>
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
