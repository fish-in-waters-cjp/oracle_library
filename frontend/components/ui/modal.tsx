import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  /** 是否顯示 modal */
  open: boolean;
  /** 關閉回調 */
  onClose: () => void;
  /** 標題 */
  title?: string;
  /** 內容 */
  children: ReactNode;
  /** 自訂 className */
  className?: string;
}

/**
 * Modal 元件 (Style 10 - 高端奢華)
 *
 * 優雅的對話框元件，深色背景配合金色邊框。
 * 支援 overlay 點擊關閉和 Escape 鍵關閉。
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  // ESC 鍵關閉
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        data-testid="modal-overlay"
        className="absolute inset-0"
        style={{ background: 'var(--color-background-overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn('relative z-10 w-full', className)}
        style={{
          maxWidth: '600px',
          background: 'var(--color-background-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-glow-gold)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-8)',
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          {title && (
            <h2
              id="modal-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-normal)',
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color var(--transition-normal)',
              padding: 'var(--space-2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
            aria-label="關閉對話框"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-8)' }}>{children}</div>
      </div>
    </div>
  );
}
