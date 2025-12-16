import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input 元件的 Props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 標籤文字 */
  label?: string;
  /** 錯誤訊息 */
  error?: string;
}

/**
 * Input 元件
 *
 * 可重用的輸入框元件，支援標籤、錯誤狀態和完整的無障礙設計。
 *
 * @example
 * ```tsx
 * // 基本使用
 * <Input placeholder="請輸入..." />
 *
 * // 帶標籤
 * <Input label="電子郵件" type="email" />
 *
 * // 錯誤狀態
 * <Input error="此欄位為必填" />
 *
 * // 受控元件
 * <Input value={value} onChange={(e) => setValue(e.target.value)} />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id: providedId, ...props }, ref) => {
    // 生成唯一 ID（用於 label 和 error 的關聯）
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = error ? `${id}-error` : undefined;

    // 基礎樣式
    const baseStyles = cn(
      // 通用樣式
      'w-full px-4 py-2 rounded-lg',
      'border-2 border-gray-300',
      'bg-white text-gray-900',
      'placeholder:text-gray-400',
      // Focus 狀態
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      // Transition
      'transition-all duration-200',
      // 禁用狀態
      props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
      // 錯誤狀態
      error && 'border-red-500 focus:ring-red-500',
      // 自訂 className
      className
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={id}
          className={baseStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
