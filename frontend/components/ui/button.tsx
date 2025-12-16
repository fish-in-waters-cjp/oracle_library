import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button 元件的 Props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按鈕變體 */
  variant?: 'primary' | 'secondary' | 'outline';
  /** 按鈕尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 載入狀態 */
  loading?: boolean;
  /** 按鈕內容 */
  children: ReactNode;
}

/**
 * Button 元件
 *
 * 可重用的按鈕元件，支援多種變體、尺寸和狀態。
 *
 * @example
 * ```tsx
 * // 基本使用
 * <Button onClick={handleClick}>點擊我</Button>
 *
 * // Primary 變體
 * <Button variant="primary">確認</Button>
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
  // 基礎樣式
  const baseStyles = cn(
    // 通用樣式
    'relative inline-flex items-center justify-center',
    'rounded-lg font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // 禁用狀態
    (disabled || loading) && 'opacity-50 cursor-not-allowed'
  );

  // 變體樣式
  const variantStyles = {
    primary: cn(
      'bg-blue-600 text-white',
      'hover:bg-blue-700 active:bg-blue-800',
      'focus-visible:ring-blue-500'
    ),
    secondary: cn(
      'bg-gray-600 text-white',
      'hover:bg-gray-700 active:bg-gray-800',
      'focus-visible:ring-gray-500'
    ),
    outline: cn(
      'bg-transparent border-2 border-gray-300 text-gray-700',
      'hover:bg-gray-50 active:bg-gray-100',
      'focus-visible:ring-gray-500'
    ),
  };

  // 尺寸樣式
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
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
