import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片標題 */
  title?: string;
  /** 卡片內容 */
  children: ReactNode;
}

/**
 * Card 元件
 *
 * 卡片容器元件，用於包裹內容。
 */
export default function Card({
  title,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
