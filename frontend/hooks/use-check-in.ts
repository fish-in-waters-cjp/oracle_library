import { useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { PACKAGE_ID, MGC_TREASURY_ID } from '@/consts';

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
  const { mutateAsync, isPending, error } = useSignAndExecuteTransaction();

  /**
   * 首次簽到
   *
   * 創建 UserCheckInRecord 並獲得 5 MGC 獎勵
   */
  const firstCheckIn = async () => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::check_in::first_check_in`,
      arguments: [
        tx.object(MGC_TREASURY_ID), // treasury: &mut MGCTreasury
        tx.object(CLOCK_ID),         // clock: &Clock
      ],
    });

    await mutateAsync({
      transaction: tx,
    });
  };

  /**
   * 每日簽到
   *
   * 更新記錄並獲得 5 MGC 獎勵
   *
   * @param recordId - 使用者的 UserCheckInRecord Object ID
   */
  const checkIn = async (recordId: string) => {
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
      transaction: tx,
    });
  };

  return {
    firstCheckIn,
    checkIn,
    isPending,
    error: error as Error | null,
  };
}
