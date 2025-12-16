import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOracleNFTs } from '@/hooks/use-oracle-nfts';

// Mock wallet address
const mockWalletAddress = '0x1234567890abcdef';

// Mock NFT data
const mockNFTs = [
  {
    id: '1',
    rarity: 'legendary' as const,
    question: '我該如何面對生活的挑戰？',
    answerEn: 'The unexamined life is not worth living.',
    answerZh: '未經審視的人生不值得活。',
    mintedAt: '2025-12-16T14:30:45Z',
  },
  {
    id: '2',
    rarity: 'epic' as const,
    question: '什麼是真正的智慧？',
    answerEn: 'Know thyself.',
    answerZh: '認識你自己。',
    mintedAt: '2025-12-15T10:20:30Z',
  },
  {
    id: '3',
    rarity: 'rare' as const,
    question: '如何找到人生的意義？',
    answerEn: 'The journey is the destination.',
    answerZh: '旅程即目的地。',
    mintedAt: '2025-12-14T08:15:00Z',
  },
];

describe('useOracleNFTs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初始狀態為載入中', () => {
    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.nfts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('成功載入 NFT 列表', async () => {
    // Mock fetch implementation
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nfts: mockNFTs }),
    });

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nfts).toEqual(mockNFTs);
    expect(result.current.error).toBeNull();
  });

  test('處理空的 NFT 列表', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nfts: [] }),
    });

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nfts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('處理載入錯誤', async () => {
    const errorMessage = 'Failed to fetch NFTs';
    global.fetch = vi.fn().mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nfts).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  test('當錢包地址為空時不載入', () => {
    const { result } = renderHook(() => useOracleNFTs(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.nfts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('當錢包地址改變時重新載入', async () => {
    const newAddress = '0xabcdef1234567890';
    const newMockNFTs = [{ ...mockNFTs[0], id: '999' }];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ nfts: mockNFTs }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ nfts: newMockNFTs }),
      });

    const { result, rerender } = renderHook(
      ({ address }) => useOracleNFTs(address),
      { initialProps: { address: mockWalletAddress } }
    );

    await waitFor(() => {
      expect(result.current.nfts).toEqual(mockNFTs);
    });

    // 改變錢包地址
    rerender({ address: newAddress });

    await waitFor(() => {
      expect(result.current.nfts).toEqual(newMockNFTs);
    });
  });

  test('提供 refetch 函數重新載入資料', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ nfts: mockNFTs }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ nfts: [...mockNFTs, mockNFTs[0]] }),
      });

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.nfts).toHaveLength(3);
    });

    // 呼叫 refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.nfts).toHaveLength(4);
    });
  });

  test('計算統計資料', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nfts: mockNFTs }),
    });

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual({
      total: 3,
      legendary: 1,
      epic: 1,
      rare: 1,
      common: 0,
    });
  });
});
