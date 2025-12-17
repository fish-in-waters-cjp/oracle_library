import { useState } from 'react';
import { useSignAndExecuteTransaction, useIotaClient } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { PACKAGE_ID, MGC_TREASURY_ID, NFT_CONFIG_ID, MINT_COST } from '@/consts';

/**
 * 鑄造結果
 */
export interface MintResult {
  /** NFT Object ID */
  nftId: string;
  /** 答案 ID */
  answerId: number;
  /** 稀有度 (0-3) */
  rarity: number;
  /** 交易摘要 */
  digest: string;
  /** 時間戳記 */
  timestamp: number;
}

/**
 * 鑄造狀態
 */
type MintStatus = 'idle' | 'preparing' | 'minting' | 'success' | 'error';

/**
 * Hook 回傳值
 */
interface UseMintNFTReturn {
  /** 執行鑄造 */
  mint: (recordId: string, rarity: number, mgcCoinId: string) => Promise<MintResult | null>;
  /** 當前狀態 */
  status: MintStatus;
  /** 是否正在鑄造 */
  isMinting: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 最近的鑄造結果 */
  lastResult: MintResult | null;
  /** 重置狀態 */
  reset: () => void;
}

/**
 * useMintNFT Hook
 *
 * 執行 NFT 鑄造交易
 *
 * @example
 * ```tsx
 * const { mint, isMinting, error, lastResult } = useMintNFT();
 *
 * const handleMint = async () => {
 *   const result = await mint(drawRecordId, 1, mgcCoinId);
 *   if (result) {
 *     console.log("鑄造成功:", result.nftId);
 *   }
 * };
 * ```
 */
export function useMintNFT(): UseMintNFTReturn {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<MintResult | null>(null);

  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const iotaClient = useIotaClient();

  /**
   * 執行鑄造
   *
   * @param recordId DrawRecord Object ID
   * @param rarity 稀有度 (0-3)
   * @param mgcCoinId MGC Coin Object ID（用於支付 5 MGC）
   * @returns 鑄造結果，失敗時回傳 null
   */
  const mint = async (
    recordId: string,
    rarity: number,
    mgcCoinId: string
  ): Promise<MintResult | null> => {
    try {
      setStatus('preparing');
      setError(null);

      // 驗證稀有度
      if (rarity < 0 || rarity > 3) {
        throw new Error('Invalid rarity: must be 0-3');
      }

      // 建立交易
      const tx = new Transaction();

      // 分割 5 MGC 作為支付（假設 decimals = 9）
      const MINT_COST_MIST = MINT_COST * 1_000_000_000; // 5 MGC
      const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [MINT_COST_MIST]);

      // 調用 mint 函數
      tx.moveCall({
        target: `${PACKAGE_ID}::oracle_nft::mint`,
        arguments: [
          tx.object(recordId), // DrawRecord
          tx.pure.u8(rarity), // rarity
          paymentCoin, // payment
          tx.object(NFT_CONFIG_ID), // config
          tx.object(MGC_TREASURY_ID), // mgc_treasury
        ],
      });

      setStatus('minting');

      // 簽署並執行交易
      const result = await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            console.log('Mint transaction submitted');
          },
        }
      );

      // 等待交易確認並取得 NFT
      const txResult = await iotaClient.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // 從交易結果中找到 OracleNFT Object ID
      const nftObject = txResult.objectChanges?.find(
        (change) =>
          change.type === 'created' &&
          change.objectType.includes('oracle_nft::OracleNFT')
      );

      if (!nftObject || nftObject.type !== 'created') {
        throw new Error('Failed to find OracleNFT in transaction result');
      }

      // 取得 NFT 詳細資料
      const nftDetails = await iotaClient.getObject({
        id: nftObject.objectId,
        options: {
          showContent: true,
        },
      });

      // 解析 NFT 內容
      const content = nftDetails.data?.content;
      const fields = content?.dataType === 'moveObject' ? content.fields : null;

      const answerId = fields?.answer_id
        ? parseInt(fields.answer_id as string, 10)
        : 0;

      const mintResult: MintResult = {
        nftId: nftObject.objectId,
        answerId,
        rarity,
        digest: result.digest,
        timestamp: Date.now(),
      };

      setLastResult(mintResult);
      setStatus('success');

      return mintResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mint failed';
      setError(errorMessage);
      setStatus('error');
      console.error('Mint error:', err);
      return null;
    }
  };

  /**
   * 重置狀態
   */
  const reset = () => {
    setStatus('idle');
    setError(null);
    setLastResult(null);
  };

  return {
    mint,
    status,
    isMinting: status === 'preparing' || status === 'minting',
    error,
    lastResult,
    reset,
  };
}
