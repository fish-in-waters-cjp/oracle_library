import { useState, useCallback } from 'react';
import { hashQuestion } from '@/lib/random';

/**
 * Draw parameters
 */
export interface DrawParams {
  question: string;
  answerId: number;
  mgcCoinId: string;
}

/**
 * Draw result
 */
export interface DrawResult {
  txDigest: string;
  drawRecordId: string;
  answerId: number;
}

/**
 * Hook configuration
 */
export interface UseOracleDrawConfig {
  walletAddress: string;
  signAndExecuteTransaction: (params: { transaction: unknown }) => Promise<{
    digest: string;
    objectChanges?: Array<{
      type: string;
      objectType?: string;
      objectId?: string;
    }>;
  }>;
}

/**
 * Return type for useOracleDraw hook
 */
export interface UseOracleDrawReturn {
  isDrawing: boolean;
  error: string | null;
  drawResult: DrawResult | null;
  draw: (params: DrawParams) => Promise<void>;
  reset: () => void;
}

// Constants - should match contract
const DRAW_COST = 10;
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x0';
const MGC_TREASURY_ID = process.env.NEXT_PUBLIC_MGC_TREASURY_ID || '0x0';

/**
 * Hook to handle oracle draw transactions
 *
 * Provides:
 * - Draw function to execute oracle draw transaction
 * - Transaction state management (isDrawing, error, result)
 * - Question hashing for privacy
 * - Reset function to clear state
 *
 * @param config - Hook configuration with wallet address and transaction signer
 * @returns Draw function and state
 */
export function useOracleDraw({
  walletAddress,
  signAndExecuteTransaction,
}: UseOracleDrawConfig): UseOracleDrawReturn {
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);

  /**
   * Execute oracle draw transaction
   */
  const draw = useCallback(
    async ({ question, answerId, mgcCoinId }: DrawParams): Promise<void> => {
      // Validate wallet connection
      if (!walletAddress) {
        setError('Wallet not connected');
        throw new Error('Wallet not connected');
      }

      setIsDrawing(true);
      setError(null);

      try {
        // Hash the question for privacy
        const questionHash = hashQuestion(question);

        // Build transaction
        // Note: This is a simplified version. In production, use @iota/iota-sdk Transaction class
        const transaction = {
          kind: 'moveCall',
          target: `${PACKAGE_ID}::oracle_draw::draw`,
          arguments: [
            { type: 'u8', value: answerId },
            { type: 'vector<u8>', value: Array.from(questionHash) },
            { type: 'object', value: mgcCoinId }, // payment coin
            { type: 'object', value: MGC_TREASURY_ID },
          ],
          typeArguments: [],
        };

        // Execute transaction
        const result = await signAndExecuteTransaction({ transaction });

        // Extract DrawRecord ID from object changes
        const createdDrawRecord = result.objectChanges?.find(
          (change) =>
            change.type === 'created' &&
            change.objectType?.includes('DrawRecord')
        );

        if (!createdDrawRecord?.objectId) {
          throw new Error('DrawRecord not found in transaction result');
        }

        setDrawResult({
          txDigest: result.digest,
          drawRecordId: createdDrawRecord.objectId,
          answerId,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsDrawing(false);
      }
    },
    [walletAddress, signAndExecuteTransaction]
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setIsDrawing(false);
    setError(null);
    setDrawResult(null);
  }, []);

  return {
    isDrawing,
    error,
    drawResult,
    draw,
    reset,
  };
}

/**
 * Get the draw cost constant
 */
export function getDrawCost(): number {
  return DRAW_COST;
}
