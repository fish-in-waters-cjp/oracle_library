import { useIotaClientQuery } from '@iota/dapp-kit';
import { MGC_COIN_TYPE } from '@/consts';
import { MOCK_ENABLED, MOCK_DATA, getMockDisplayBalance } from '@/config/mock';

export interface UseMGCBalanceReturn {
  /** MGC 餘額（bigint） */
  balance: bigint;
  /** 格式化後的餘額字串 */
  displayBalance: string;
  /** 載入中 */
  isLoading: boolean;
  /** 重新查詢 */
  refetch: () => void;
}

/**
 * 取得使用者 MGC 餘額
 *
 * @param address - 使用者錢包地址，null 時不查詢
 * @returns MGC 餘額資訊
 *
 * @example
 * ```tsx
 * function BalanceDisplay() {
 *   const { address } = useWalletConnection();
 *   const { balance, displayBalance, isLoading } = useMGCBalance(address);
 *
 *   if (isLoading) return <div>載入中...</div>;
 *   return <div>{displayBalance} MGC</div>;
 * }
 * ```
 */
export function useMGCBalance(address: string | null): UseMGCBalanceReturn {
  const { data, isLoading, refetch } = useIotaClientQuery(
    'getBalance',
    {
      owner: address!,
      coinType: MGC_COIN_TYPE,
    },
    {
      enabled: !!address && !MOCK_ENABLED,
      refetchInterval: 10000, // 每 10 秒自動重新查詢
    }
  );

  // === MOCK 模式 ===
  if (MOCK_ENABLED) {
    return {
      balance: MOCK_DATA.balance.amount,
      displayBalance: getMockDisplayBalance(),
      isLoading: false,
      refetch: () => console.log('[Mock] refetch balance'),
    };
  }

  // === 真實模式 ===
  // 解析餘額
  const balance = data?.totalBalance ? BigInt(data.totalBalance) : BigInt(0);
  const displayBalance = balance.toString();

  return {
    balance,
    displayBalance,
    isLoading,
    refetch,
  };
}
