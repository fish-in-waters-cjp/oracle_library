import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMintNFT } from '@/hooks/use-mint-nft';

// Mock transaction result
const mockTxResult = {
  digest: '0xmint123digest',
  objectChanges: [
    {
      type: 'created',
      objectType: 'oracle_library::oracle_nft::OracleNFT',
      objectId: '0xnft123',
    },
  ],
};

// Mock NFT details
const mockNftDetails = {
  data: {
    content: {
      dataType: 'moveObject',
      fields: {
        id: { id: '0xnft123' },
        answer_id: '5',
        rarity: '1',
      },
    },
  },
};

describe('useMintNFT', () => {
  const mockSignAndExecute = vi.fn();
  const mockWaitForTransaction = vi.fn();
  const mockGetObject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初始狀態', () => {
    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    expect(result.current.isMinting).toBe(false);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.lastResult).toBeNull();
  });

  test('成功鑄造 NFT', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);
    mockWaitForTransaction.mockResolvedValueOnce({
      ...mockTxResult,
      objectChanges: mockTxResult.objectChanges,
    });
    mockGetObject.mockResolvedValueOnce(mockNftDetails);

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    await act(async () => {
      await result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    expect(mockSignAndExecute).toHaveBeenCalledTimes(1);
    expect(result.current.isMinting).toBe(false);
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.lastResult).toEqual({
      nftId: '0xnft123',
      answerId: 5,
      rarity: 1,
      digest: '0xmint123digest',
      timestamp: expect.any(Number),
    });
  });

  test('鑄造過程中 isMinting 為 true', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockSignAndExecute.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    // Start minting
    act(() => {
      result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    // Should be minting
    expect(result.current.isMinting).toBe(true);
    expect(result.current.status).toBe('preparing');

    // Resolve the promise
    await act(async () => {
      mockWaitForTransaction.mockResolvedValueOnce({
        ...mockTxResult,
        objectChanges: mockTxResult.objectChanges,
      });
      mockGetObject.mockResolvedValueOnce(mockNftDetails);
      resolvePromise!(mockTxResult);
    });

    // Should no longer be minting
    await waitFor(() => {
      expect(result.current.isMinting).toBe(false);
    });
  });

  test('處理交易失敗', async () => {
    const errorMessage = 'Insufficient MGC balance';
    mockSignAndExecute.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    await act(async () => {
      await result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    expect(result.current.isMinting).toBe(false);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.lastResult).toBeNull();
  });

  test('處理使用者拒絕交易', async () => {
    mockSignAndExecute.mockRejectedValueOnce(new Error('User rejected'));

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    await act(async () => {
      await result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    expect(result.current.error).toBe('User rejected');
    expect(result.current.status).toBe('error');
  });

  test('驗證稀有度範圍 (0-3)', async () => {
    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    // Invalid rarity: -1
    await act(async () => {
      await result.current.mint('0xrecord123', -1, '0xmgccoin123');
    });

    expect(result.current.error).toBe('Invalid rarity: must be 0-3');
    expect(mockSignAndExecute).not.toHaveBeenCalled();

    // Reset and test invalid rarity: 4
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.mint('0xrecord123', 4, '0xmgccoin123');
    });

    expect(result.current.error).toBe('Invalid rarity: must be 0-3');
  });

  test('reset 清除狀態', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);
    mockWaitForTransaction.mockResolvedValueOnce({
      ...mockTxResult,
      objectChanges: mockTxResult.objectChanges,
    });
    mockGetObject.mockResolvedValueOnce(mockNftDetails);

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    // Perform a mint
    await act(async () => {
      await result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    expect(result.current.lastResult).not.toBeNull();
    expect(result.current.status).toBe('success');

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.isMinting).toBe(false);
  });

  test('處理找不到 NFT 物件的情況', async () => {
    mockSignAndExecute.mockResolvedValueOnce({ digest: '0xabc' });
    mockWaitForTransaction.mockResolvedValueOnce({
      digest: '0xabc',
      objectChanges: [], // Empty - no NFT created
    });

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    await act(async () => {
      await result.current.mint('0xrecord123', 1, '0xmgccoin123');
    });

    expect(result.current.error).toBe('Failed to find OracleNFT in transaction result');
    expect(result.current.status).toBe('error');
  });

  test('各稀有度鑄造 (Common=0, Rare=1, Epic=2, Legendary=3)', async () => {
    const rarities = [0, 1, 2, 3];

    for (const rarity of rarities) {
      vi.clearAllMocks();
      mockSignAndExecute.mockResolvedValueOnce(mockTxResult);
      mockWaitForTransaction.mockResolvedValueOnce({
        ...mockTxResult,
        objectChanges: mockTxResult.objectChanges,
      });
      mockGetObject.mockResolvedValueOnce({
        data: {
          content: {
            dataType: 'moveObject',
            fields: {
              id: { id: '0xnft123' },
              answer_id: '5',
              rarity: String(rarity),
            },
          },
        },
      });

      const { result } = renderHook(() =>
        useMintNFT({
          signAndExecuteTransaction: mockSignAndExecute,
          waitForTransaction: mockWaitForTransaction,
          getObject: mockGetObject,
        })
      );

      await act(async () => {
        await result.current.mint('0xrecord123', rarity, '0xmgccoin123');
      });

      expect(result.current.status).toBe('success');
      expect(result.current.lastResult?.rarity).toBe(rarity);
    }
  });

  test('交易參數正確傳遞', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);
    mockWaitForTransaction.mockResolvedValueOnce({
      ...mockTxResult,
      objectChanges: mockTxResult.objectChanges,
    });
    mockGetObject.mockResolvedValueOnce(mockNftDetails);

    const { result } = renderHook(() =>
      useMintNFT({
        signAndExecuteTransaction: mockSignAndExecute,
        waitForTransaction: mockWaitForTransaction,
        getObject: mockGetObject,
      })
    );

    const recordId = '0xrecord123';
    const rarity = 2;
    const mgcCoinId = '0xmgccoin123';

    await act(async () => {
      await result.current.mint(recordId, rarity, mgcCoinId);
    });

    // Verify signAndExecute was called with transaction
    expect(mockSignAndExecute).toHaveBeenCalled();
    const callArgs = mockSignAndExecute.mock.calls[0][0];
    expect(callArgs).toHaveProperty('transaction');
  });
});
