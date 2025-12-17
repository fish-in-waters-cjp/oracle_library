'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { ConnectWallet } from '@/components/connect-wallet';

/**
 * 應用佈局 - Style 10 高端奢華設計
 *
 * 已登入使用者的主要佈局，包含導航列和內容區域。
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isConnected } = useWalletConnection();

  // 未連接時跳轉到登入頁
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // 未連接時不渲染內容（等待跳轉）
  if (!isConnected) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-main)' }}>
      {/* 導航列 */}
      <nav
        style={{
          borderBottom: '1px solid var(--color-border-default)',
          background: 'var(--color-background-surface)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 var(--space-6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              height: '64px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo 和導航連結 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              {/* Logo */}
              <Link
                href="/home"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                永恆圖書館
              </Link>

              {/* 導航連結 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <NavLink href="/home">主頁</NavLink>
                <NavLink href="/collection">收藏</NavLink>
              </div>
            </div>

            {/* 右側：錢包連接狀態 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容區域 */}
      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        {children}
      </main>
    </div>
  );
}

/**
 * 導航連結元件 - Style 10 設計
 */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        transition: 'var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-primary)';
        e.currentTarget.style.background = 'var(--color-background-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}
