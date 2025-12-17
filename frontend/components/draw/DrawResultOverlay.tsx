'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button';
import { RARITY_INFO, type RarityValue } from '@/lib/random';
import type { Answer } from '@/hooks/use-answers';
import type { DrawResult } from '@/hooks/use-oracle-draw';

/**
 * DrawResultOverlay Props
 */
export interface DrawResultOverlayProps {
  /** 是否顯示 */
  open: boolean;
  /** 關閉回調 */
  onClose: () => void;
  /** 答案資料 */
  answer: Answer | null;
  /** 抽取結果 */
  drawResult: DrawResult | null;
  /** 鑄造 NFT 回調 */
  onMintNFT?: () => void;
  /** 是否正在鑄造 */
  isMinting?: boolean;
}

/**
 * DrawResultOverlay - 抽取結果 Overlay
 *
 * 顯示抽取到的神諭答案：
 * - 答案內容（中/英文）
 * - 稀有度標籤
 * - 鑄造 NFT 按鈕
 * - 關閉按鈕
 */
export default function DrawResultOverlay({
  open,
  onClose,
  answer,
  drawResult,
  onMintNFT,
  isMinting = false,
}: DrawResultOverlayProps) {
  // ESC 鍵關閉
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMinting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, isMinting]);

  // 阻止 body 滾動
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !answer) return null;

  const rarityInfo = RARITY_INFO[answer.rarity as RarityValue];
  const rarityColorMap: Record<string, string> = {
    gray: '#9ca3af',
    blue: '#60a5fa',
    purple: '#a78bfa',
    gold: '#d4af37',
  };
  const rarityColor = rarityColorMap[rarityInfo.color] || '#9ca3af';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      {/* Overlay 背景 */}
      <div
        data-testid="overlay-backdrop"
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        onClick={isMinting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* 內容卡片 */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: '500px',
          background: 'var(--color-background-surface)',
          border: `2px solid ${rarityColor}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: `0 0 40px ${rarityColor}40`,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 稀有度標題列 */}
        <div
          style={{
            background: `linear-gradient(135deg, ${rarityColor}20 0%, transparent 100%)`,
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: `1px solid ${rarityColor}40`,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              background: `${rarityColor}30`,
              border: `1px solid ${rarityColor}`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              color: rarityColor,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {rarityInfo.name}
          </span>
        </div>

        {/* 答案內容 */}
        <div style={{ padding: 'var(--space-8)' }}>
          {/* 中文答案 */}
          <h2
            id="result-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-3)',
              lineHeight: '1.4',
            }}
          >
            {answer.zh}
          </h2>

          {/* 英文答案 */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              fontStyle: 'italic',
              marginBottom: 'var(--space-6)',
            }}
          >
            {answer.en}
          </p>

          {/* 分類標籤 */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span
              style={{
                display: 'inline-block',
                padding: 'var(--space-1) var(--space-2)',
                background: 'var(--color-background-elevated)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {answer.category}
            </span>
          </div>

          {/* 交易資訊 */}
          {drawResult && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-background-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                TX: {drawResult.txDigest.slice(0, 16)}...
              </p>
            </div>
          )}

          {/* 操作按鈕 */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {onMintNFT && (
              <Button
                variant="primary"
                onClick={onMintNFT}
                loading={isMinting}
                disabled={isMinting}
                style={{ flex: 1 }}
              >
                鑄造 NFT
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isMinting}
              style={{ flex: onMintNFT ? 'none' : 1 }}
            >
              關閉
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
