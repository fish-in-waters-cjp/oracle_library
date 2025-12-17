import { useIotaClientQuery } from '@iota/dapp-kit';
import { CHECK_IN_RECORD_TYPE } from '@/consts';
import {
  getCurrentDayNumber,
  canCheckIn as canCheckInToday,
  getNextMidnight,
} from '@/lib/time';

/**
 * CheckInRecord Move Object 的 fields 類型
 */
interface CheckInRecordFields {
  id: { id: string };
  last_check_in_day: string;
  total_check_ins: string;
}

export interface UseCheckInStateReturn {
  /** 是否有簽到記錄 */
  hasRecord: boolean;
  /** 簽到記錄 Object ID */
  recordObjectId: string | null;
  /** 最後簽到的日期編號 */
  lastCheckInDay: number | null;
  /** 累積簽到次數 */
  totalCheckIns: number;
  /** 連續簽到天數（TODO: 從 Events 計算） */
  consecutiveDays: number;
  /** 今天是否可以簽到 */
  canCheckIn: boolean;
  /** 下次可簽到時間 */
  nextCheckInTime: Date | null;
  /** 載入中 */
  isLoading: boolean;
  /** 重新查詢 */
  refetch: () => void;
}

/**
 * 取得使用者簽到狀態
 *
 * @param address - 使用者錢包地址，null 時不查詢
 * @returns 簽到狀態資訊
 *
 * @example
 * ```tsx
 * function CheckInCard() {
 *   const { address } = useWalletConnection();
 *   const { hasRecord, canCheckIn, totalCheckIns } = useCheckInState(address);
 *
 *   if (!hasRecord) {
 *     return <button>首次簽到</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>累積簽到: {totalCheckIns} 次</p>
 *       <button disabled={!canCheckIn}>簽到</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCheckInState(
  address: string | null
): UseCheckInStateReturn {
  const { data, isLoading, refetch } = useIotaClientQuery(
    'getOwnedObjects',
    {
      owner: address!,
      filter: {
        StructType: CHECK_IN_RECORD_TYPE,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!address,
    }
  );

  // 解析簽到記錄
  const records = data?.data || [];
  const hasRecord = records.length > 0;

  if (!hasRecord) {
    return {
      hasRecord: false,
      recordObjectId: null,
      lastCheckInDay: null,
      totalCheckIns: 0,
      consecutiveDays: 0,
      canCheckIn: false,
      nextCheckInTime: null,
      isLoading,
      refetch,
    };
  }

  // 取得第一筆記錄（假設使用者只有一筆）
  const record = records[0];
  const recordObjectId = record.data?.objectId || null;

  // 解析記錄內容
  const content = record.data?.content;
  const fields = content?.dataType === 'moveObject'
    ? (content.fields as unknown as CheckInRecordFields)
    : null;

  const lastCheckInDay = fields?.last_check_in_day
    ? parseInt(fields.last_check_in_day, 10)
    : null;

  const totalCheckIns = fields?.total_check_ins
    ? parseInt(fields.total_check_ins, 10)
    : 0;

  // 判斷是否可以簽到
  const canCheckIn = lastCheckInDay !== null && canCheckInToday(lastCheckInDay);

  // 計算下次簽到時間
  const nextCheckInTime =
    lastCheckInDay !== null && !canCheckIn ? getNextMidnight() : null;

  // TODO: 從 Events 計算連續簽到天數
  const consecutiveDays = 0;

  return {
    hasRecord: true,
    recordObjectId,
    lastCheckInDay,
    totalCheckIns,
    consecutiveDays,
    canCheckIn,
    nextCheckInTime,
    isLoading,
    refetch,
  };
}
