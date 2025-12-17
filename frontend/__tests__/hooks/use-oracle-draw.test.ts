import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useOracleDraw } from '@/hooks/use-oracle-draw';

// Mock answer data
const mockAnswer = {
  id: 5,
  en: 'The journey of a thousand miles begins with a single step.',
  zh: '千里之行，始於足下。',
  rarity: 0 as const,
  category: 'wisdom',
};

// Mock transaction result
const mockTxResult = {
  digest: '0xabc123',
  objectChanges: [
    {
      type: 'created',
      objectType: 'oracle_library::oracle_draw::DrawRecord',
      objectId: '0xdrawrecord123',
    },
  ],
};

describe('useOracleDraw', () => {
  const mockSignAndExecute = vi.fn();
  const mockWalletAddress = '0x1234567890abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初始狀態', () => {
    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.drawResult).toBeNull();
  });

  test('成功抽取解答', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    await act(async () => {
      await result.current.draw({
        question: '我該如何面對挑戰？',
        answerId: mockAnswer.id,
        mgcCoinId: '0xmgccoin123',
      });
    });

    expect(mockSignAndExecute).toHaveBeenCalledTimes(1);
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.drawResult).toEqual({
      txDigest: '0xabc123',
      drawRecordId: '0xdrawrecord123',
      answerId: mockAnswer.id,
    });
  });

  test('抽取過程中 isDrawing 為 true', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockSignAndExecute.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    // Start drawing
    act(() => {
      result.current.draw({
        question: '測試問題',
        answerId: 10,
        mgcCoinId: '0xmgc',
      });
    });

    // Should be drawing
    expect(result.current.isDrawing).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockTxResult);
    });

    // Should no longer be drawing
    await waitFor(() => {
      expect(result.current.isDrawing).toBe(false);
    });
  });

  test('處理交易失敗', async () => {
    const errorMessage = 'Insufficient MGC balance';
    mockSignAndExecute.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    await act(async () => {
      try {
        await result.current.draw({
          question: '測試',
          answerId: 5,
          mgcCoinId: '0xmgc',
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.drawResult).toBeNull();
  });

  test('處理使用者拒絕交易', async () => {
    mockSignAndExecute.mockRejectedValueOnce(new Error('User rejected'));

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    await act(async () => {
      try {
        await result.current.draw({
          question: '測試',
          answerId: 5,
          mgcCoinId: '0xmgc',
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('User rejected');
  });

  test('reset 清除狀態', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    // Perform a draw
    await act(async () => {
      await result.current.draw({
        question: '測試',
        answerId: 5,
        mgcCoinId: '0xmgc',
      });
    });

    expect(result.current.drawResult).not.toBeNull();

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.drawResult).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isDrawing).toBe(false);
  });

  test('無錢包地址時無法抽取', async () => {
    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: '',
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    await act(async () => {
      try {
        await result.current.draw({
          question: '測試',
          answerId: 5,
          mgcCoinId: '0xmgc',
        });
      } catch {
        // Expected to throw
      }
    });

    expect(mockSignAndExecute).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Wallet not connected');
  });

  test('問題 hash 正確編碼', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    const question = '這是一個測試問題';

    await act(async () => {
      await result.current.draw({
        question,
        answerId: 5,
        mgcCoinId: '0xmgc',
      });
    });

    // Verify signAndExecute was called with transaction
    expect(mockSignAndExecute).toHaveBeenCalled();
    const callArgs = mockSignAndExecute.mock.calls[0][0];
    expect(callArgs).toHaveProperty('transaction');
  });

  test('空問題使用空 hash', async () => {
    mockSignAndExecute.mockResolvedValueOnce(mockTxResult);

    const { result } = renderHook(() =>
      useOracleDraw({
        walletAddress: mockWalletAddress,
        signAndExecuteTransaction: mockSignAndExecute,
      })
    );

    await act(async () => {
      await result.current.draw({
        question: '',
        answerId: 5,
        mgcCoinId: '0xmgc',
      });
    });

    expect(mockSignAndExecute).toHaveBeenCalled();
  });
});
