import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input 元件的 Props
 * Style 10 - 高端奢華設計系統
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 標籤文字 */
  label?: string;
  /** 錯誤訊息 */
  error?: string;
  /** 輔助說明文字 */
  helpText?: string;
}

/**
 * Input 元件 (Style 10 - 高端奢華)
 *
 * 透明背景、金色邊框、focus 時金色發光效果的優雅輸入框設計。
 * 使用 Inter 字體與細緻的過渡動畫。
 *
 * @example
 * ```tsx
 * // 基本使用
 * <Input placeholder="請輸入..." />
 *
 * // 帶標籤
 * <Input label="電子郵件" type="email" />
 *
 * // 帶輔助說明
 * <Input label="密碼" type="password" helpText="至少 8 個字元" />
 *
 * // 錯誤狀態
 * <Input label="用戶名" error="此欄位為必填" />
 *
 * // 受控元件
 * <Input value={value} onChange={(e) => setValue(e.target.value)} />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id: providedId, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    // 生成唯一 ID（用於 label 和 error 的關聯）
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = error ? `${id}-error` : undefined;
    const helpId = helpText ? `${id}-help` : undefined;

    // 基礎樣式類
    const baseClasses = cn(
      'w-full transition-all',
      'focus:outline-none',
      'placeholder:opacity-60',
      props.disabled && 'cursor-not-allowed',
      className
    );

    // Input inline styles - Style 10
    const inputStyles: React.CSSProperties = {
      maxWidth: '400px',
      padding: 'var(--space-4)',
      background: 'transparent',
      border: error
        ? '1px solid var(--color-error)'
        : '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      transition: 'all var(--transition-normal)',
      opacity: props.disabled ? 0.4 : 1,
      ...(isFocused && !error ? {
        borderColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-glow-gold)',
      } : {}),
      ...style,
    };

    // Label styles - Style 10
    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-primary)',
      marginBottom: 'var(--space-3)',
      fontFamily: 'var(--font-body)',
    };

    // Help text styles - Style 10
    const helpStyles: React.CSSProperties = {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-muted)',
      marginTop: 'var(--space-2)',
      fontFamily: 'var(--font-body)',
    };

    // Error text styles - Style 10
    const errorStyles: React.CSSProperties = {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-error)',
      marginTop: 'var(--space-2)',
      fontFamily: 'var(--font-body)',
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={id} style={labelStyles}>
            {label}
            {props.required && (
              <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }}>
                *
              </span>
            )}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={id}
          className={baseClasses}
          style={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(errorId, helpId)}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Help Text */}
        {helpText && !error && (
          <p id={helpId} style={helpStyles}>
            {helpText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} style={errorStyles} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
