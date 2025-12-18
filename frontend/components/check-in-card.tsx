'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { useCheckInState } from '@/hooks/use-check-in-state';
import { useCheckIn } from '@/hooks/use-check-in';
import { formatCountdown } from '@/lib/time';
import { FIRST_CHECK_IN_REWARD, DAILY_CHECK_IN_REWARD } from '@/consts';

/**
 * Style 10 樣式定義
 */
const styles = {
  card: {
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-background-surface)',
    border: '1px solid var(--color-border-default)',
    padding: 'var(--space-6)',
  } as React.CSSProperties,

  skeleton: {
    height: '1rem',
    background: 'var(--color-background-elevated)',
    borderRadius: 'var(--radius-md)',
    animation: 'pulse 2s infinite',
  } as React.CSSProperties,

  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-xl)',
    fontWeight: 'var(--font-weight-normal)',
    color: 'var(--color-primary)',
    letterSpacing: '0.02em',
  } as React.CSSProperties,

  statsText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,

  highlight: {
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-primary)',
  } as React.CSSProperties,

  successHighlight: {
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-success)',
  } as React.CSSProperties,

  errorBox: {
    borderRadius: 'var(--radius-md)',
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid var(--color-error)',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-error)',
  } as React.CSSProperties,

  bodyText: {
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-4)',
  } as React.CSSProperties,

  mutedText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  } as React.CSSProperties,
};

/**
 * CheckInCard 元件 - Style 10 高端奢華設計
 *
 * 顯示簽到功能，包含：
 * - 首次簽到按鈕（無記錄時）
 * - 每日簽到按鈕（有記錄時）
 * - 簽到統計資訊
 * - 倒計時顯示（已簽到時）
 */
export function CheckInCard() {
  const { address, isConnected } = useWalletConnection();
  const {
    hasRecord,
    recordObjectId,
    lastCheckInDay,
    totalCheckIns,
    consecutiveDays,
    canCheckIn,
    nextCheckInTime,
    isLoading: stateLoading,
    refetch,
  } = useCheckInState(address);

  const { firstCheckIn, checkIn, isPending, error } = useCheckIn();

  // 倒計時狀態
  const [countdown, setCountdown] = useState('');

  // 更新倒計時
  useEffect(() => {
    if (!nextCheckInTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = nextCheckInTime.getTime() - now;
      if (remaining > 0) {
        setCountdown(formatCountdown(remaining));
      } else {
        setCountdown('可以簽到了！');
        refetch(); // 重新查詢狀態
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextCheckInTime, refetch]);

  // 處理簽到
  const handleCheckIn = async () => {
    try {
      if (!hasRecord) {
        await firstCheckIn();
      } else if (recordObjectId) {
        await checkIn(recordObjectId);
      }
      // 簽到成功後重新查詢狀態
      setTimeout(() => refetch(), 2000);
    } catch (err) {
      console.error('簽到失敗:', err);
    }
  };

  // 未連接錢包
  if (!isConnected) {
    return (
      <div style={styles.card} data-testid="check-in-card">
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>請先連接錢包</p>
      </div>
    );
  }

  // 載入中
  if (stateLoading) {
    return (
      <div style={styles.card} data-testid="skeleton">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ ...styles.skeleton, width: '75%' }} />
          <div style={{ ...styles.skeleton, width: '50%' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card} data-testid="check-in-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* 標題 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={styles.title}>每日簽到</h2>
          {hasRecord && (
            <div style={styles.statsText}>
              累積簽到 <span style={styles.highlight}>{totalCheckIns}</span> 次
              {consecutiveDays > 0 && (
                <span style={{ marginLeft: 'var(--space-2)' }}>
                  連續 <span style={styles.successHighlight}>{consecutiveDays}</span> 天
                </span>
              )}
            </div>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div style={styles.errorBox}>
            錯誤: {error.message}
          </div>
        )}

        {/* 內容區 */}
        {!hasRecord ? (
          // 首次簽到
          <div style={{ textAlign: 'center' }}>
            <p style={styles.bodyText}>
              歡迎！首次簽到獲得 <span style={styles.highlight}>{FIRST_CHECK_IN_REWARD} MGC</span> 新用戶禮包
            </p>
            <Button
              onClick={handleCheckIn}
              loading={isPending}
              disabled={isPending}
              aria-label="首次簽到"
            >
              {isPending ? '簽到中...' : '首次簽到'}
            </Button>
          </div>
        ) : canCheckIn ? (
          // 可以簽到
          <div style={{ textAlign: 'center' }}>
            <p style={styles.bodyText}>
              今天還沒簽到，獲得 <span style={styles.highlight}>+{DAILY_CHECK_IN_REWARD} MGC</span> 獎勵！
            </p>
            <Button
              onClick={handleCheckIn}
              loading={isPending}
              disabled={isPending}
              aria-label="簽到"
            >
              {isPending ? '簽到中...' : '簽到'}
            </Button>
          </div>
        ) : (
          // 已簽到
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...styles.bodyText, marginBottom: 'var(--space-2)' }}>
              今日已簽到 ✓
            </p>
            {nextCheckInTime && (
              <p style={styles.mutedText}>
                下次簽到: {countdown}
              </p>
            )}
            <Button
              disabled
              aria-disabled="true"
              style={{ marginTop: 'var(--space-4)' }}
            >
              明天再來
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
