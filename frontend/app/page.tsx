'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/animated/page-transition';
import { ConnectWallet } from '@/components/connect-wallet';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

/**
 * Style 10 樣式定義
 */
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-background-main)',
    padding: '0 var(--space-4)',
    position: 'relative' as const,
    overflow: 'hidden',
  },

  content: {
    marginBottom: 'var(--space-12)',
    textAlign: 'center' as const,
  },

  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(3rem, 10vw, 4.5rem)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
    marginBottom: 'var(--space-4)',
    letterSpacing: '0.05em',
    textShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
  },

  subtitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
    fontWeight: 'var(--font-weight-normal)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.1em',
  },

  description: {
    marginTop: 'var(--space-8)',
    maxWidth: '28rem',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.8,
  },

  highlight: {
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-medium)',
  },

  walletSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-4)',
  },

  networkHint: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },

  decorContainer: {
    position: 'absolute' as const,
    inset: 0,
    zIndex: -1,
    overflow: 'hidden',
    pointerEvents: 'none' as const,
  },

  glowTopLeft: {
    position: 'absolute' as const,
    left: '10%',
    top: '20%',
    width: '24rem',
    height: '24rem',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.05)',
    filter: 'blur(100px)',
  },

  glowBottomRight: {
    position: 'absolute' as const,
    right: '10%',
    bottom: '20%',
    width: '24rem',
    height: '24rem',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.08)',
    filter: 'blur(100px)',
  },

  glowCenter: {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '32rem',
    height: '32rem',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
  },

  decorLine: {
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, var(--color-border-default), transparent)',
  },
};

/**
 * 登入頁面 - Style 10 高端奢華設計
 *
 * 未連接錢包時顯示圖書館入口視覺和連接按鈕。
 * 已連接時自動跳轉到主頁面。
 */
export default function LoginPage() {
  const router = useRouter();
  const { isConnected } = useWalletConnection();

  // 已連接時自動跳轉到主頁
  useEffect(() => {
    if (isConnected) {
      router.push('/home');
    }
  }, [isConnected, router]);

  // 未連接時顯示登入頁面
  return (
    <PageTransition variant="fade">
      <div style={styles.container}>
        {/* 圖書館入口視覺 */}
        <div style={styles.content}>
          {/* Logo/Title */}
          <h1 style={styles.title}>
            永恆圖書館
          </h1>
          <h2 style={styles.subtitle}>
            Eternal Library
          </h2>

          {/* 描述 */}
          <p style={styles.description}>
            探索<span style={styles.highlight}>智慧之源</span>，每日簽到獲得智慧碎片
            <br />
            提出問題，抽取<span style={styles.highlight}>神諭解答</span>
            <br />
            將答案鑄造成永恆的 <span style={styles.highlight}>NFT</span> 收藏
          </p>
        </div>

        {/* 連接錢包按鈕 */}
        <div style={styles.walletSection}>
          <ConnectWallet />

          {/* 網路提示 */}
          <p style={styles.networkHint}>
            使用 IOTA {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </p>
        </div>

        {/* 裝飾性元素 */}
        <div style={styles.decorContainer}>
          {/* 金色光暈效果 */}
          <div style={styles.glowTopLeft} />
          <div style={styles.glowBottomRight} />
          <div style={styles.glowCenter} />

          {/* 裝飾線 */}
          <div style={{ ...styles.decorLine, top: 0, height: '20%' }} />
          <div style={{ ...styles.decorLine, bottom: 0, height: '20%' }} />
        </div>
      </div>
    </PageTransition>
  );
}
