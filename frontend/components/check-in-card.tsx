'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { useCheckInState } from '@/hooks/use-check-in-state';
import { useCheckIn } from '@/hooks/use-check-in';
import { formatCountdown } from '@/lib/time';
import { CHECK_IN_REWARD } from '@/consts';

/**
 * CheckInCard 元件
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
      <div className="rounded-lg bg-white p-6 shadow" data-testid="check-in-card">
        <p className="text-center text-gray-500">請先連接錢包</p>
      </div>
    );
  }

  // 載入中
  if (stateLoading) {
    return (
      <div
        className="rounded-lg bg-white p-6 shadow"
        data-testid="skeleton"
      >
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow" data-testid="check-in-card">
      <div className="space-y-4">
        {/* 標題 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">每日簽到</h2>
          {hasRecord && (
            <div className="text-sm text-gray-500">
              累積簽到 <span className="font-bold text-indigo-600">{totalCheckIns}</span> 次
              {consecutiveDays > 0 && (
                <span className="ml-2">
                  連續 <span className="font-bold text-green-600">{consecutiveDays}</span> 天
                </span>
              )}
            </div>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">
            錯誤: {error.message}
          </div>
        )}

        {/* 內容區 */}
        {!hasRecord ? (
          // 首次簽到
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              歡迎！開始簽到之旅，每次簽到獲得 <span className="font-bold text-indigo-600">{CHECK_IN_REWARD} MGC</span>
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
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              今天還沒簽到，獲得 <span className="font-bold text-indigo-600">+{CHECK_IN_REWARD} MGC</span> 獎勵！
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
          <div className="text-center">
            <p className="mb-2 text-gray-600">今日已簽到 ✓</p>
            {nextCheckInTime && (
              <p className="text-sm text-gray-500">
                下次簽到: {countdown}
              </p>
            )}
            <Button
              disabled
              aria-disabled="true"
              className="mt-4"
            >
              明天再來
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
