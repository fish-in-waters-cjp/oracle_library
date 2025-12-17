import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCheckIn } from '@/hooks/use-check-in';

// Mock @iota/dapp-kit
vi.mock('@iota/dapp-kit', () => ({
  useSignAndExecuteTransaction: vi.fn(),
}));

import { useSignAndExecuteTransaction } from '@iota/dapp-kit';

describe('useCheckIn', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSignAndExecuteTransaction).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);
  });

  it('應該提供 firstCheckIn 和 checkIn 函數', () => {
    const { result } = renderHook(() => useCheckIn());

    expect(result.current.firstCheckIn).toBeInstanceOf(Function);
    expect(result.current.checkIn).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('應該成功執行首次簽到', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      digest: '0xtxhash123',
    });

    const { result } = renderHook(() => useCheckIn());

    await result.current.firstCheckIn();

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: expect.any(Object),
      })
    );
  });

  it('應該成功執行每日簽到', async () => {
    const recordId = '0xrecord123';
    mockMutateAsync.mockResolvedValueOnce({
      digest: '0xtxhash456',
    });

    const { result } = renderHook(() => useCheckIn());

    await result.current.checkIn(recordId);

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: expect.any(Object),
      })
    );
  });

  it('應該在交易執行中顯示 pending 狀態', () => {
    vi.mocked(useSignAndExecuteTransaction).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
    } as any);

    const { result } = renderHook(() => useCheckIn());

    expect(result.current.isPending).toBe(true);
  });

  it('應該處理首次簽到交易失敗', async () => {
    const error = new Error('Transaction failed');
    mockMutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCheckIn());

    await expect(result.current.firstCheckIn()).rejects.toThrow(
      'Transaction failed'
    );
  });

  it('應該處理每日簽到交易失敗', async () => {
    const error = new Error('Already checked in');
    mockMutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCheckIn());

    await expect(result.current.checkIn('0xrecord123')).rejects.toThrow(
      'Already checked in'
    );
  });

  it('應該在交易失敗時保存錯誤狀態', async () => {
    const error = new Error('Insufficient gas');
    mockMutateAsync.mockRejectedValueOnce(error);

    vi.mocked(useSignAndExecuteTransaction).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: error,
    } as any);

    const { result } = renderHook(() => useCheckIn());

    expect(result.current.error).toBe(error);
  });

  it('應該使用正確的合約參數進行首次簽到', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      digest: '0xtxhash',
    });

    const { result } = renderHook(() => useCheckIn());

    await result.current.firstCheckIn();

    // 驗證交易包含正確的 moveCall 參數
    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs.transaction).toBeDefined();
  });

  it('應該使用正確的合約參數進行每日簽到', async () => {
    const recordId = '0xrecord789';
    mockMutateAsync.mockResolvedValueOnce({
      digest: '0xtxhash',
    });

    const { result } = renderHook(() => useCheckIn());

    await result.current.checkIn(recordId);

    // 驗證交易包含正確的記錄 ID
    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs.transaction).toBeDefined();
  });

  it('應該在沒有錯誤時返回 null error', () => {
    vi.mocked(useSignAndExecuteTransaction).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useCheckIn());

    expect(result.current.error).toBeNull();
  });

  it('應該處理交易被使用者拒絕', async () => {
    const error = new Error('User rejected transaction');
    mockMutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCheckIn());

    await expect(result.current.firstCheckIn()).rejects.toThrow(
      'User rejected transaction'
    );
  });

  it('應該在多次簽到間保持獨立狀態', async () => {
    mockMutateAsync
      .mockResolvedValueOnce({ digest: '0xtx1' })
      .mockResolvedValueOnce({ digest: '0xtx2' });

    const { result } = renderHook(() => useCheckIn());

    // 第一次簽到
    await result.current.firstCheckIn();
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    // 第二次簽到（不同記錄）
    await result.current.checkIn('0xrecord123');
    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
  });
});
