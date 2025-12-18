import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { PACKAGE_ID, MGC_TREASURY_ID } from '@/consts';
import { MOCK_ENABLED, MOCK_DATA } from '@/config/mock';

// Clock 物件的固定地址
const CLOCK_ID = '0x6';

export interface UseCheckInReturn {
  /** 首次簽到函數 */
  firstCheckIn: () => Promise<void>;
  /** 每日簽到函數 */
  checkIn: (recordId: string) => Promise<void>;
  /** 交易執行中 */
  isPending: boolean;
  /** 錯誤訊息 */
  error: Error | null;
}

/**
 * 執行簽到操作
 *
 * @returns 簽到操作函數和狀態
 *
 * @example
 * ```tsx
 * function CheckInButton() {
 *   const { hasRecord, recordObjectId } = useCheckInState(address);
 *   const { firstCheckIn, checkIn, isPending } = useCheckIn();
 *
 *   const handleClick = async () => {
 *     if (!hasRecord) {
 *       await firstCheckIn();
 *     } else {
 *       await checkIn(recordObjectId!);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isPending}>
 *       {isPending ? '簽到中...' : '簽到'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCheckIn(): UseCheckInReturn {
  const { mutateAsync, isPending: txPending, error: txError } = useSignAndExecuteTransaction();

  // Mock 模式下的狀態
  const [mockPending, setMockPending] = useState(false);
  const [mockError, setMockError] = useState<Error | null>(null);

  /**
   * 首次簽到
   *
   * 創建 UserCheckInRecord 並獲得 100 MGC 獎勵（新用戶禮包）
   */
  const firstCheckIn = async () => {
    // === MOCK 模式 ===
    if (MOCK_ENABLED) {
      console.log('[useCheckIn] Mock 模式：模擬首次簽到');
      setMockPending(true);
      setMockError(null);

      try {
        // 模擬交易延遲
        await new Promise((resolve) => setTimeout(resolve, MOCK_DATA.checkIn.delayMs));
        console.log('[useCheckIn] Mock 首次簽到成功');
      } catch (err) {
        setMockError(err instanceof Error ? err : new Error('Mock check-in failed'));
        throw err;
      } finally {
        setMockPending(false);
      }
      return;
    }

    // === 真實模式 ===
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::check_in::first_check_in`,
      arguments: [
        tx.object(MGC_TREASURY_ID), // treasury: &mut MGCTreasury
        tx.object(CLOCK_ID),         // clock: &Clock
      ],
    });

    await mutateAsync({
      transaction: tx as unknown as Parameters<typeof mutateAsync>[0]['transaction'],
    });
  };

  /**
   * 每日簽到
   *
   * 更新記錄並獲得 20 MGC 獎勵
   *
   * @param recordId - 使用者的 UserCheckInRecord Object ID
   */
  const checkIn = async (recordId: string) => {
    // === MOCK 模式 ===
    if (MOCK_ENABLED) {
      console.log('[useCheckIn] Mock 模式：模擬每日簽到', { recordId });
      setMockPending(true);
      setMockError(null);

      try {
        // 模擬交易延遲
        await new Promise((resolve) => setTimeout(resolve, MOCK_DATA.checkIn.delayMs));
        console.log('[useCheckIn] Mock 每日簽到成功');
      } catch (err) {
        setMockError(err instanceof Error ? err : new Error('Mock check-in failed'));
        throw err;
      } finally {
        setMockPending(false);
      }
      return;
    }

    // === 真實模式 ===
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::check_in::check_in`,
      arguments: [
        tx.object(recordId),         // record: &mut UserCheckInRecord
        tx.object(MGC_TREASURY_ID), // treasury: &mut MGCTreasury
        tx.object(CLOCK_ID),         // clock: &Clock
      ],
    });

    await mutateAsync({
      transaction: tx as unknown as Parameters<typeof mutateAsync>[0]['transaction'],
    });
  };

  return {
    firstCheckIn,
    checkIn,
    isPending: MOCK_ENABLED ? mockPending : txPending,
    error: MOCK_ENABLED ? mockError : (txError as Error | null),
  };
}
