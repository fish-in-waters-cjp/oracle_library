import { useState, useEffect, useCallback } from 'react';
import { useIotaClient } from '@iota/dapp-kit';
import { ORACLE_NFT_TYPE } from '@/consts';
import type { OracleNFT, NFTStats, Rarity } from './use-oracle-nfts';

/**
 * OracleNFT Move Object 的 fields 類型
 */
interface OracleNFTFields {
  id: { id: string };
  answer_id: string;
  rarity: string;
  question: string;
  minted_at: string;
}

/**
 * 稀有度數字轉換為字串
 */
const RARITY_MAP: Record<number, Rarity> = {
  0: 'common',
  1: 'rare',
  2: 'epic',
  3: 'legendary',
};

/**
 * Hook 回傳值
 */
export interface UseOwnedOracleNFTsReturn {
  /** 使用者擁有的 NFT */
  nfts: OracleNFT[];
  /** 是否正在載入 */
  isLoading: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** NFT 統計 */
  stats: NFTStats;
  /** 重新取得 */
  refetch: () => void;
}

/**
 * useOwnedOracleNFTs Hook
 *
 * 從鏈上取得使用者擁有的 OracleNFT
 *
 * @param ownerAddress 擁有者地址
 * @returns NFT 列表、統計、載入狀態
 */
export function useOwnedOracleNFTs(ownerAddress: string | null): UseOwnedOracleNFTsReturn {
  const [nfts, setNfts] = useState<OracleNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iotaClient = useIotaClient();

  const fetchNFTs = useCallback(async () => {
    if (!ownerAddress) {
      setNfts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 使用 getOwnedObjects 取得使用者擁有的 OracleNFT
      const response = await iotaClient.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: ORACLE_NFT_TYPE,
        },
        options: {
          showContent: true,
        },
      });

      // 解析 NFT 資料
      const parsedNFTs: OracleNFT[] = response.data
        .map((obj) => {
          const content = obj.data?.content;
          if (content?.dataType !== 'moveObject') {
            return null;
          }

          const fields = content.fields as unknown as OracleNFTFields;
          const answerId = parseInt(fields.answer_id, 10);
          const rarityNum = parseInt(fields.rarity, 10);
          const rarity = RARITY_MAP[rarityNum] || 'common';

          // 從 answers.json 取得對應的答案（這裡先用空字串，之後可以整合）
          return {
            id: fields.id.id,
            rarity,
            question: fields.question || '',
            answerEn: '', // 可以之後從 answers.json 取得
            answerZh: '', // 可以之後從 answers.json 取得
            answerId,
            mintedAt: new Date(parseInt(fields.minted_at, 10)).toISOString(),
          } as OracleNFT;
        })
        .filter((nft): nft is OracleNFT => nft !== null);

      setNfts(parsedNFTs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs';
      setError(errorMessage);
      console.error('[useOwnedOracleNFTs] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress, iotaClient]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // 計算統計
  const stats: NFTStats = {
    total: nfts.length,
    legendary: nfts.filter((nft) => nft.rarity === 'legendary').length,
    epic: nfts.filter((nft) => nft.rarity === 'epic').length,
    rare: nfts.filter((nft) => nft.rarity === 'rare').length,
    common: nfts.filter((nft) => nft.rarity === 'common').length,
  };

  return {
    nfts,
    isLoading,
    error,
    stats,
    refetch: fetchNFTs,
  };
}
