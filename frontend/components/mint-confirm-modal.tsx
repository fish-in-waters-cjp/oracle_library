'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Answer, Rarity, RARITY_COLORS } from '@/hooks/use-answers';
import Button from '@/components/ui/button';

/**
 * MintConfirmModal Props
 */
interface MintConfirmModalProps {
  /** 是否顯示對話框 */
  isOpen: boolean;
  /** 答案資料 */
  answer: Answer;
  /** 稀有度 */
  rarity: Rarity;
  /** 鑄造成本（MGC）*/
  mintCost?: number;
  /** 當前 MGC 餘額 */
  mgcBalance?: number;
  /** 確認回調 */
  onConfirm: () => void;
  /** 取消回調 */
  onCancel: () => void;
  /** 是否正在鑄造 */
  isMinting?: boolean;
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
 * Style 10 樣式定義
 */
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 40,
  },

  wrapper: {
    position: 'fixed' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 'var(--space-4)',
  },

  modal: {
    background: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-glow-gold)',
    maxWidth: '28rem',
    width: '100%',
    overflow: 'hidden',
    border: '1px solid var(--color-border-default)',
  },

  decorBar: {
    height: '0.25rem',
  },

  content: {
    padding: 'var(--space-6)',
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

  emoji: {
    fontSize: '3rem',
  },

  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
    letterSpacing: '0.02em',
  },

  subtitle: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },

  previewCard: {
    background: 'var(--color-background-elevated)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
    border: '1px solid var(--color-border-default)',
  },

  rarityBadgeWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
  },

  rarityBadge: {
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: '9999px',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: '#ffffff',
  },

  answerPreview: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    textAlign: 'center' as const,
    lineHeight: 1.6,
  },

  answerId: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center' as const,
  },

  costBox: {
    background: 'var(--color-background-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },

  costRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  costLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },

  costValue: {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
  },

  balanceSufficient: {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-success)',
  },

  balanceInsufficient: {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-error)',
  },

  divider: {
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--space-2)',
  },

  afterBalance: {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
  },

  warningBox: {
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-error)',
    textAlign: 'center' as const,
  },

  buttonGroup: {
    display: 'flex',
    gap: 'var(--space-3)',
  },

  cancelButton: {
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

  hint: {
    textAlign: 'center' as const,
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
};

/**
 * MintConfirmModal - 鑄造確認對話框
 *
 * 在用戶點擊鑄造按鈕時顯示，確認是否要花費 MGC 鑄造 NFT
 * Style 10 高端奢華設計
 */
export function MintConfirmModal({
  isOpen,
  answer,
  rarity,
  mintCost = 5,
  mgcBalance = 0,
  onConfirm,
  onCancel,
  isMinting = false,
}: MintConfirmModalProps) {
  const rarityName = RARITY_NAMES[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const hasEnoughMGC = mgcBalance >= mintCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={styles.overlay}
            onClick={!isMinting ? onCancel : undefined}
          />

          {/* 對話框 */}
          <div style={styles.wrapper}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={styles.modal}
            >
              {/* 稀有度裝飾條 */}
              <div
                style={{
                  ...styles.decorBar,
                  backgroundColor: rarityColor,
                }}
              />

              {/* 內容 */}
              <div style={styles.content}>
                {/* 標題 */}
                <div style={styles.titleSection}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    style={styles.emoji}
                  >
                    🎨
                  </motion.div>
                  <h2 style={styles.title}>
                    鑄造 NFT 確認
                  </h2>
                  <p style={styles.subtitle}>
                    將此解答永久保存至區塊鏈
                  </p>
                </div>

                {/* 答案預覽 */}
                <div style={styles.previewCard}>
                  {/* 稀有度標籤 */}
                  <div style={styles.rarityBadgeWrapper}>
                    <span
                      style={{
                        ...styles.rarityBadge,
                        backgroundColor: rarityColor,
                      }}
                    >
                      {rarityName}
                    </span>
                  </div>

                  {/* 答案內容 */}
                  <p style={styles.answerPreview}>
                    {answer.text_zh}
                  </p>

                  {/* 答案編號 */}
                  <p style={styles.answerId}>
                    答案編號 #{answer.id.toString().padStart(2, '0')}
                  </p>
                </div>

                {/* 成本資訊 */}
                <div style={styles.costBox}>
                  <div style={styles.costRow}>
                    <span style={styles.costLabel}>鑄造成本</span>
                    <span style={styles.costValue}>
                      {mintCost} MGC
                    </span>
                  </div>
                  <div style={styles.costRow}>
                    <span style={styles.costLabel}>你的餘額</span>
                    <span style={hasEnoughMGC ? styles.balanceSufficient : styles.balanceInsufficient}>
                      {mgcBalance} MGC
                    </span>
                  </div>
                  {hasEnoughMGC && (
                    <div style={{ ...styles.costRow, ...styles.divider }}>
                      <span style={styles.costLabel}>鑄造後餘額</span>
                      <span style={styles.afterBalance}>
                        {mgcBalance - mintCost} MGC
                      </span>
                    </div>
                  )}
                </div>

                {/* MGC 不足警告 */}
                {!hasEnoughMGC && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.warningBox}
                  >
                    MGC 不足，請先完成每日簽到獲得 MGC
                  </motion.div>
                )}

                {/* 操作按鈕 */}
                <div style={styles.buttonGroup}>
                  {/* 取消按鈕 */}
                  <motion.button
                    onClick={onCancel}
                    disabled={isMinting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...styles.cancelButton,
                      opacity: isMinting ? 0.6 : 1,
                      cursor: isMinting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    取消
                  </motion.button>

                  {/* 確認按鈕 */}
                  <Button
                    onClick={onConfirm}
                    disabled={!hasEnoughMGC || isMinting}
                    loading={isMinting}
                    style={{ flex: 1 }}
                  >
                    {isMinting ? '鑄造中...' : '確認鑄造'}
                  </Button>
                </div>

                {/* 提示文字 */}
                <p style={styles.hint}>
                  鑄造後，此解答將永久保存至 IOTA 區塊鏈
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
