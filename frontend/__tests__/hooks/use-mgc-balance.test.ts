import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMGCBalance } from '@/hooks/use-mgc-balance';

// Mock @iota/dapp-kit
vi.mock('@iota/dapp-kit', () => ({
  useIotaClientQuery: vi.fn(),
}));

import { useIotaClientQuery } from '@iota/dapp-kit';

describe('useMGCBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該在沒有地址時返回 0 餘額', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMGCBalance(null));

    expect(result.current.balance).toBe(0n);
    expect(result.current.displayBalance).toBe('0');
    expect(result.current.isLoading).toBe(false);
  });

  it('應該顯示正確的 MGC 餘額', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        totalBalance: '100',
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    expect(result.current.balance).toBe(100n);
    expect(result.current.displayBalance).toBe('100');
    expect(result.current.isLoading).toBe(false);
  });

  it('應該處理載入狀態', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.balance).toBe(0n);
  });

  it('應該使用正確的查詢參數', () => {
    const mockRefetch = vi.fn();
    const testAddress = '0x1234567890abcdef';

    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    renderHook(() => useMGCBalance(testAddress));

    // 驗證 useIotaClientQuery 被正確呼叫
    expect(useIotaClientQuery).toHaveBeenCalledWith(
      'getBalance',
      expect.objectContaining({
        owner: testAddress,
        coinType: expect.stringContaining('::mgc::MGC'),
      }),
      expect.objectContaining({
        enabled: true,
        refetchInterval: 10000,
      })
    );
  });

  it('應該在地址為 null 時禁用查詢', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useMGCBalance(null));

    expect(useIotaClientQuery).toHaveBeenCalledWith(
      'getBalance',
      expect.any(Object),
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('應該提供 refetch 功能', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: { totalBalance: '50' },
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    result.current.refetch();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('應該正確格式化大數字', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        totalBalance: '1234567890',
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    expect(result.current.balance).toBe(1234567890n);
    expect(result.current.displayBalance).toBe('1234567890');
  });

  it('應該處理 totalBalance 為 0 的情況', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        totalBalance: '0',
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    expect(result.current.balance).toBe(0n);
    expect(result.current.displayBalance).toBe('0');
  });

  it('應該處理查詢錯誤情況', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
      error: new Error('Query failed'),
    } as any);

    const { result } = renderHook(() => useMGCBalance('0x123'));

    // 即使查詢失敗，也應該返回安全的預設值
    expect(result.current.balance).toBe(0n);
    expect(result.current.displayBalance).toBe('0');
  });

  it('應該每 10 秒自動重新查詢', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: { totalBalance: '100' },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useMGCBalance('0x123'));

    // 驗證設定了 10 秒的重新查詢間隔
    expect(useIotaClientQuery).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        refetchInterval: 10000,
      })
    );
  });
});
