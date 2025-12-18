import { useIotaClientQuery } from '@iota/dapp-kit';
import { MGC_COIN_TYPE } from '@/consts';
import { MOCK_ENABLED, MOCK_DATA } from '@/config/mock';

/**
 * MGC Coin 資訊
 */
export interface MGCCoin {
  /** Coin Object ID */
  objectId: string;
  /** 餘額（bigint）*/
  balance: bigint;
}

export interface UseMGCCoinsReturn {
  /** MGC Coins 列表 */
  coins: MGCCoin[];
  /** 是否載入中 */
  isLoading: boolean;
  /** 重新查詢 */
  refetch: () => void;
  /** 取得第一個有足夠餘額的 Coin ID */
  getCoinWithBalance: (minBalance: bigint) => string | null;
}

/**
 * 取得使用者的 MGC Coins
 *
 * @param address - 使用者錢包地址
 * @returns MGC Coins 資訊
 *
 * @example
 * ```tsx
 * const { coins, getCoinWithBalance } = useMGCCoins(address);
 * const coinId = getCoinWithBalance(10n); // 10 MGC (decimals = 0)
 * ```
 */
export function useMGCCoins(address: string | null): UseMGCCoinsReturn {
  const { data, isLoading, refetch } = useIotaClientQuery(
    'getCoins',
    {
      owner: address!,
      coinType: MGC_COIN_TYPE,
    },
    {
      enabled: !!address && !MOCK_ENABLED,
    }
  );

  // === MOCK 模式 ===
  if (MOCK_ENABLED) {
    const mockCoins: MGCCoin[] = [
      { objectId: MOCK_DATA.coins.coinId, balance: MOCK_DATA.coins.balance },
    ];

    return {
      coins: mockCoins,
      isLoading: false,
      refetch: () => console.log('[Mock] refetch coins'),
      getCoinWithBalance: (minBalance: bigint) =>
        MOCK_DATA.coins.balance >= minBalance ? MOCK_DATA.coins.coinId : null,
    };
  }

  // === 真實模式 ===
  // 解析 coins
  const coins: MGCCoin[] =
    data?.data.map((coin) => ({
      objectId: coin.coinObjectId,
      balance: BigInt(coin.balance),
    })) || [];

  /**
   * 取得第一個有足夠餘額的 Coin
   */
  const getCoinWithBalance = (minBalance: bigint): string | null => {
    const coin = coins.find((c) => c.balance >= minBalance);
    return coin?.objectId || null;
  };

  return {
    coins,
    isLoading,
    refetch,
    getCoinWithBalance,
  };
}
