import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button 元件的 Props
 * Style 10 - 高端奢華設計系統
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按鈕變體 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** 按鈕尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 載入狀態 */
  loading?: boolean;
  /** 按鈕內容 */
  children: ReactNode;
}

/**
 * Button 元件 (Style 10 - 高端奢華)
 *
 * 採用透明背景、金色邊框、優雅 hover 發光效果的奢華按鈕設計。
 * 使用 Playfair Display 字體與緩慢過渡動畫展現高端質感。
 *
 * @example
 * ```tsx
 * // 基本使用
 * <Button onClick={handleClick}>點擊我</Button>
 *
 * // Primary 變體（金色）
 * <Button variant="primary">確認</Button>
 *
 * // Secondary 變體（銀色）
 * <Button variant="secondary">查看收藏</Button>
 *
 * // 載入狀態
 * <Button loading>提交中...</Button>
 *
 * // 禁用狀態
 * <Button disabled>無法點擊</Button>
 * ```
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  // 基礎樣式 - 使用 Tailwind classes
  const baseStyles = cn(
    'relative inline-flex items-center justify-center',
    'cursor-pointer transition-all',
    'focus-visible:outline-none focus-visible:ring-1',
    // 禁用狀態
    (disabled || loading) && 'cursor-not-allowed'
  );

  // 直接使用 CSS 變數的 inline styles
  const getButtonStyles = () => {
    const styles: React.CSSProperties = {
      gap: 'var(--space-2)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--font-weight-normal)',
      textDecoration: 'none',
      transition: 'all var(--transition-slow)',
      borderRadius: 'var(--radius-sm)',
      opacity: disabled || loading ? 0.4 : 1,
    };

    // 尺寸
    if (variant === 'link') {
      // link 變體的 padding
      const linkPadding = {
        sm: 'var(--space-2) var(--space-3)',
        md: 'var(--space-2) var(--space-3)',
        lg: 'var(--space-3) var(--space-4)',
      };
      styles.padding = linkPadding[size];
    } else {
      const padding = {
        sm: 'var(--space-2) var(--space-5)',
        md: 'var(--space-4) var(--space-8)',
        lg: 'var(--space-5) var(--space-10)',
      };
      styles.padding = padding[size];
    }

    const fontSize = {
      sm: 'var(--text-sm)',
      md: 'var(--text-base)',
      lg: 'var(--text-lg)',
    };
    styles.fontSize = fontSize[size];

    // 變體樣式
    switch (variant) {
      case 'primary':
        styles.background = 'transparent';
        styles.color = 'var(--color-primary)';
        styles.border = '1px solid var(--color-primary)';
        break;
      case 'secondary':
        styles.background = 'transparent';
        styles.color = 'var(--color-secondary)';
        styles.border = '1px solid var(--color-secondary)';
        break;
      case 'ghost':
        styles.background = 'transparent';
        styles.color = 'var(--color-text-secondary)';
        styles.border = '1px solid var(--color-border-default)';
        break;
      case 'link':
        styles.background = 'transparent';
        styles.color = 'var(--color-primary)';
        styles.border = 'none';
        styles.textDecoration = 'underline';
        break;
    }

    return styles;
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, className)}
      style={getButtonStyles()}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        const target = e.currentTarget;
        switch (variant) {
          case 'primary':
            target.style.background = 'rgba(212, 175, 55, 0.1)';
            target.style.boxShadow = 'var(--shadow-glow-gold)';
            break;
          case 'secondary':
            target.style.background = 'rgba(192, 192, 192, 0.05)';
            target.style.boxShadow = 'var(--shadow-glow-silver)';
            break;
          case 'ghost':
            target.style.borderColor = 'var(--color-primary)';
            target.style.color = 'var(--color-primary)';
            break;
          case 'link':
            target.style.opacity = '0.8';
            break;
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        const target = e.currentTarget;
        switch (variant) {
          case 'primary':
            target.style.background = 'transparent';
            target.style.boxShadow = 'none';
            break;
          case 'secondary':
            target.style.background = 'transparent';
            target.style.boxShadow = 'none';
            break;
          case 'ghost':
            target.style.borderColor = 'var(--color-border-default)';
            target.style.color = 'var(--color-text-secondary)';
            break;
          case 'link':
            target.style.opacity = '1';
            break;
        }
      }}
      {...props}
    >
      {/* 載入動畫 */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-label="載入中"
        >
          <div
            className="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"
            style={{ width: '1rem', height: '1rem' }}
          >
            <span className="sr-only">載入中...</span>
          </div>
        </div>
      )}

      {/* 按鈕內容 */}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
        {children}
      </span>
    </button>
  );
}
