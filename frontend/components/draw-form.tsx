'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';

interface DrawFormProps {
  /** 是否正在抽取 */
  isDrawing: boolean;
  /** MGC 餘額 */
  mgcBalance: number;
  /** 抽取回調 */
  onDraw: (question: string) => void;
  /** 錯誤訊息 */
  error?: string | null;
}

/**
 * Style 10 樣式定義
 */
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },

  label: {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
  },

  textarea: {
    width: '100%',
    padding: 'var(--space-4)',
    background: 'var(--color-background-elevated)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    fontFamily: 'var(--font-body)',
    resize: 'none' as const,
    transition: 'var(--transition-fast)',
  },

  textareaDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  charCount: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-1)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },

  costBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-3)',
    background: 'var(--color-background-elevated)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border-default)',
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

  errorBox: {
    padding: 'var(--space-3)',
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-error)',
  },

  warningBox: {
    padding: 'var(--space-3)',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-primary)',
  },

  requiredHint: {
    color: 'var(--color-primary)',
  },

  hint: {
    textAlign: 'center' as const,
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
};

/**
 * DrawForm - 問題輸入表單
 *
 * 使用者輸入問題並點擊抽取按鈕
 * Style 10 高端奢華設計
 */
export function DrawForm({ isDrawing, mgcBalance, onDraw, error }: DrawFormProps) {
  const [question, setQuestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const DRAW_COST = 10;
  const canDraw = question.trim().length > 0 && mgcBalance >= DRAW_COST && !isDrawing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canDraw) {
      onDraw(question);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* 問題輸入框 */}
      <div>
        <label htmlFor="question" style={styles.label}>
          向神諭提問
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="輸入你的問題..."
          disabled={isDrawing}
          style={{
            ...styles.textarea,
            ...(isDrawing ? styles.textareaDisabled : {}),
            borderColor: isFocused ? 'var(--color-primary)' : 'var(--color-border-default)',
            boxShadow: isFocused ? 'var(--shadow-glow-gold)' : 'none',
          }}
          rows={3}
          maxLength={200}
        />
        <div style={styles.charCount}>
          <span>{question.length}/200 字</span>
          {question.trim().length === 0 && (
            <span style={styles.requiredHint}>* 請輸入問題</span>
          )}
        </div>
      </div>

      {/* MGC 成本提示 */}
      <div style={styles.costBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={styles.costLabel}>抽取成本</span>
          <span style={styles.costValue}>{DRAW_COST} MGC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={styles.costLabel}>你的餘額</span>
          <span style={mgcBalance >= DRAW_COST ? styles.balanceSufficient : styles.balanceInsufficient}>
            {mgcBalance} MGC
          </span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.errorBox}
        >
          {error}
        </motion.div>
      )}

      {/* MGC 不足警告 */}
      {mgcBalance < DRAW_COST && !isDrawing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.warningBox}
        >
          MGC 不足，請先完成每日簽到獲得 MGC
        </motion.div>
      )}

      {/* 抽取按鈕 */}
      <Button
        type="submit"
        disabled={!canDraw}
        loading={isDrawing}
        style={{ width: '100%' }}
      >
        {isDrawing ? '抽取中...' : '✨ 抽取解答之書'}
      </Button>

      {/* 提示文字 */}
      {!isDrawing && canDraw && (
        <p style={styles.hint}>
          點擊按鈕後將消耗 {DRAW_COST} MGC 進行抽取
        </p>
      )}
    </form>
  );
}
