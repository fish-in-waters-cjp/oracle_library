import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCheckInState } from '@/hooks/use-check-in-state';

// Mock @iota/dapp-kit
vi.mock('@iota/dapp-kit', () => ({
  useIotaClientQuery: vi.fn(),
}));

import { useIotaClientQuery } from '@iota/dapp-kit';

describe('useCheckInState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該在沒有地址時返回預設狀態', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState(null));

    expect(result.current.hasRecord).toBe(false);
    expect(result.current.recordObjectId).toBeNull();
    expect(result.current.lastCheckInDay).toBeNull();
    expect(result.current.totalCheckIns).toBe(0);
    expect(result.current.consecutiveDays).toBe(0);
    expect(result.current.canCheckIn).toBe(false);
    expect(result.current.nextCheckInTime).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('應該正確解析簽到記錄', () => {
    const today = Math.floor((Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000));
    const yesterday = today - 1;

    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        data: [
          {
            data: {
              objectId: '0xrecord123',
              content: {
                fields: {
                  last_check_in_day: yesterday.toString(),
                  total_check_ins: '5',
                },
              },
            },
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.hasRecord).toBe(true);
    expect(result.current.recordObjectId).toBe('0xrecord123');
    expect(result.current.lastCheckInDay).toBe(yesterday);
    expect(result.current.totalCheckIns).toBe(5);
    expect(result.current.canCheckIn).toBe(true); // 昨天簽到，今天可以簽
  });

  it('應該在今天已簽到時返回 canCheckIn = false', () => {
    const today = Math.floor((Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000));

    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        data: [
          {
            data: {
              objectId: '0xrecord123',
              content: {
                fields: {
                  last_check_in_day: today.toString(),
                  total_check_ins: '10',
                },
              },
            },
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.canCheckIn).toBe(false);
    expect(result.current.nextCheckInTime).not.toBeNull();
  });

  it('應該處理載入狀態', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.isLoading).toBe(true);
  });

  it('應該在沒有記錄時返回 hasRecord = false', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        data: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.hasRecord).toBe(false);
    expect(result.current.canCheckIn).toBe(false);
  });

  it('應該提供 refetch 功能', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    result.current.refetch();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('應該計算正確的 nextCheckInTime（UTC+8 午夜）', () => {
    const today = Math.floor((Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000));

    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        data: [
          {
            data: {
              objectId: '0xrecord123',
              content: {
                fields: {
                  last_check_in_day: today.toString(),
                  total_check_ins: '1',
                },
              },
            },
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.nextCheckInTime).toBeInstanceOf(Date);

    // 驗證 nextCheckInTime 是未來的時間
    const nextTime = result.current.nextCheckInTime!;
    expect(nextTime.getTime()).toBeGreaterThan(Date.now());

    // 驗證是 UTC+8 的午夜
    const utc8Midnight = new Date(nextTime);
    const offset = utc8Midnight.getTimezoneOffset() + 8 * 60;
    const localMidnight = new Date(utc8Midnight.getTime() - offset * 60 * 1000);
    expect(localMidnight.getHours()).toBe(0);
    expect(localMidnight.getMinutes()).toBe(0);
  });

  it('應該使用正確的查詢參數', () => {
    const testAddress = '0x1234567890abcdef';
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useCheckInState(testAddress));

    expect(useIotaClientQuery).toHaveBeenCalledWith(
      'getOwnedObjects',
      expect.objectContaining({
        owner: testAddress,
        filter: {
          StructType: expect.stringContaining('::check_in::UserCheckInRecord'),
        },
        options: {
          showContent: true,
        },
      }),
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it('應該在地址為 null 時禁用查詢', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useCheckInState(null));

    expect(useIotaClientQuery).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('應該處理錯誤情況並返回安全預設值', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
      error: new Error('Query failed'),
    } as any);

    const { result } = renderHook(() => useCheckInState('0x123'));

    expect(result.current.hasRecord).toBe(false);
    expect(result.current.canCheckIn).toBe(false);
  });

  it('應該正確處理從未簽到的新使用者', () => {
    vi.mocked(useIotaClientQuery).mockReturnValue({
      data: {
        data: [],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCheckInState('0xnewuser'));

    expect(result.current.hasRecord).toBe(false);
    expect(result.current.totalCheckIns).toBe(0);
    expect(result.current.consecutiveDays).toBe(0);
    expect(result.current.canCheckIn).toBe(false);
    expect(result.current.nextCheckInTime).toBeNull();
  });
});