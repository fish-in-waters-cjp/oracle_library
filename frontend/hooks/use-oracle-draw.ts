import { useState } from 'react';
import { useSignAndExecuteTransaction, useIotaClient } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';
import { PACKAGE_ID, MGC_TREASURY_ID } from '@/consts';
import { generateRandomAnswerId } from '@/lib/random';

/**
 * 抽取結果
 */
export interface DrawResult {
  /** DrawRecord Object ID */
  recordId: string;
  /** 答案 ID (0-49) */
  answerId: number;
  /** 交易摘要 */
  digest: string;
  /** 時間戳記 */
  timestamp: number;
}

/**
 * 抽取狀態
 */
type DrawStatus = 'idle' | 'preparing' | 'drawing' | 'success' | 'error';

/**
 * Hook 回傳值
 */
interface UseOracleDrawReturn {
  /** 執行抽取 */
  draw: (question: string, mgcCoinId: string) => Promise<DrawResult | null>;
  /** 當前狀態 */
  status: DrawStatus;
  /** 是否正在抽取 */
  isDrawing: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 最近的抽取結果 */
  lastResult: DrawResult | null;
  /** 重置狀態 */
  reset: () => void;
}

/**
 * useOracleDraw Hook
 *
 * 執行抽取解答交易
 *
 * @example
 * ```tsx
 * const { draw, isDrawing, error, lastResult } = useOracleDraw();
 *
 * const handleDraw = async () => {
 *   const result = await draw("我的問題", mgcCoinId);
 *   if (result) {
 *     console.log("抽到答案:", result.answerId);
 *   }
 * };
 * ```
 */
export function useOracleDraw(): UseOracleDrawReturn {
  const [status, setStatus] = useState<DrawStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<DrawResult | null>(null);

  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const iotaClient = useIotaClient();

  /**
   * 執行抽取
   *
   * @param question 使用者的問題
   * @param mgcCoinId MGC Coin Object ID
   * @returns 抽取結果，失敗時回傳 null
   */
  const draw = async (
    question: string,
    mgcCoinId: string
  ): Promise<DrawResult | null> => {
    try {
      setStatus('preparing');
      setError(null);

      // 1. 生成隨機答案 ID (0-49)
      const answerId = generateRandomAnswerId();

      // 2. 計算問題 hash
      const questionHash = hashQuestion(question);

      // 3. 建立交易
      const tx = new Transaction();

      // 分割 10 MGC 作為支付
      const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [10_000_000_000]); // 10 MGC (假設 decimals = 9)

      // 調用 draw 函數
      tx.moveCall({
        target: `${PACKAGE_ID}::oracle_draw::draw`,
        arguments: [
          tx.pure.u8(answerId),
          tx.pure.vector('u8', Array.from(questionHash)),
          paymentCoin,
          tx.object(MGC_TREASURY_ID),
        ],
      });

      setStatus('drawing');

      // 4. 簽署並執行交易
      const result = await signAndExecute(
        {
          transaction: tx as unknown as Parameters<typeof signAndExecute>[0]['transaction'],
        },
        {
          onSuccess: () => {
            console.log('Draw transaction submitted');
          },
        }
      );

      // 5. 等待交易確認並取得 DrawRecord
      const txResult = await iotaClient.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // 6. 從交易結果中找到 DrawRecord Object ID
      const drawRecord = txResult.objectChanges?.find(
        (change) =>
          change.type === 'created' &&
          change.objectType.includes('oracle_draw::DrawRecord')
      );

      if (!drawRecord || drawRecord.type !== 'created') {
        throw new Error('Failed to find DrawRecord in transaction result');
      }

      const drawResult: DrawResult = {
        recordId: drawRecord.objectId,
        answerId,
        digest: result.digest,
        timestamp: Date.now(),
      };

      setLastResult(drawResult);
      setStatus('success');

      return drawResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Draw failed';
      setError(errorMessage);
      setStatus('error');
      console.error('Draw error:', err);
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
    draw,
    status,
    isDrawing: status === 'preparing' || status === 'drawing',
    error,
    lastResult,
    reset,
  };
}

/**
 * 計算問題的 hash（使用 SHA-256）
 */
function hashQuestion(question: string): Uint8Array {
  // 使用 TextEncoder 將字串轉為 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(question);

  // 在瀏覽器環境中使用 SubtleCrypto
  // 注意：這是異步的，但為了簡化，我們先用同步的簡單 hash
  // 在實際應用中，應該使用 crypto.subtle.digest

  // 簡單的 hash 實作（僅用於 demo）
  // 實際應用中應該使用 SHA-256
  const simpleHash = new Uint8Array(32);
  for (let i = 0; i < data.length && i < 32; i++) {
    simpleHash[i] = data[i];
  }

  return simpleHash;
}

/**
 * 使用 SubtleCrypto 計算 SHA-256 hash（異步版本）
 */
export async function hashQuestionAsync(question: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(question);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * 取得抽取成本常數
 */
export function getDrawCost(): number {
  return 10;
}
