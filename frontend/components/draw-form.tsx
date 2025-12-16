'use client';

import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DrawFormProps {
  /** 抽取回調函數 */
  onDraw: () => void;
  /** 是否載入中 */
  isLoading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** MGC 餘額（用於判斷是否足夠） */
  balance?: number;
  /** 自訂 className */
  className?: string;
}

const DRAW_COST = 10; // 每次抽取消耗 10 MGC

/**
 * DrawForm 元件 (Style 10 - 高端奢華)
 *
 * 抽卡表單，包含成本資訊和抽取按鈕。
 * 使用 Style 10 設計系統的優雅配色與排版。
 */
export default function DrawForm({
  onDraw,
  isLoading = false,
  disabled = false,
  balance,
  className,
}: DrawFormProps) {
  // 檢查餘額是否足夠
  const hasInsufficientBalance = balance !== undefined && balance < DRAW_COST;
  const isButtonDisabled = disabled || isLoading || hasInsufficientBalance;

  // Style 10 - 容器樣式
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  };

  // Style 10 - 文字中心樣式
  const textCenterStyles: React.CSSProperties = {
    textAlign: 'center',
  };

  // Style 10 - 成本資訊樣式
  const costInfoStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-body)',
  };

  // Style 10 - 錯誤訊息樣式
  const errorStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-error)',
    marginTop: 'var(--space-1)',
    fontFamily: 'var(--font-body)',
  };

  // Style 10 - 按鈕樣式
  const buttonStyles: React.CSSProperties = {
    width: '100%',
  };

  return (
    <div className={className} style={containerStyles}>
      {/* 成本資訊 */}
      <div style={textCenterStyles}>
        <p style={costInfoStyles}>
          💎 每次抽取消耗 {DRAW_COST} MGC
        </p>
        {hasInsufficientBalance && (
          <p style={errorStyles}>餘額不足</p>
        )}
      </div>

      {/* 抽取按鈕 */}
      <Button
        onClick={onDraw}
        disabled={isButtonDisabled}
        loading={isLoading}
        variant="primary"
        size="lg"
        style={buttonStyles}
      >
        抽取解答
      </Button>
    </div>
  );
}
