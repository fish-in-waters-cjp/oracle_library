import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNFTMetadata } from '@/hooks/use-nft-metadata';

// Mock NFT metadata
const mockMetadata = {
  id: '1',
  name: 'Oracle Answer #1',
  description: '來自永恆圖書館的神諭解答',
  rarity: 'legendary' as const,
  question: '我該如何面對生活的挑戰？',
  answerEn: 'The unexamined life is not worth living.',
  answerZh: '未經審視的人生不值得活。',
  answerId: 42,
  drawnAt: '2025-12-16T14:30:45Z',
  mintedAt: '2025-12-16T14:35:00Z',
};

describe('useNFTMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('初始狀態為載入中', () => {
    const { result } = renderHook(() => useNFTMetadata('1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('成功載入 NFT metadata', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetadata,
    });

    const { result } = renderHook(() => useNFTMetadata('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockMetadata);
    expect(result.current.error).toBeNull();
  });

  test('處理載入錯誤', async () => {
    const errorMessage = 'Failed to fetch metadata';
    global.fetch = vi.fn().mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useNFTMetadata('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  test('當 NFT ID 為空時不載入', () => {
    const { result } = renderHook(() => useNFTMetadata(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('當 NFT ID 改變時重新載入', async () => {
    const metadata2 = { ...mockMetadata, id: '2', name: 'Oracle Answer #2' };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetadata,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => metadata2,
      });

    const { result, rerender } = renderHook(
      ({ nftId }) => useNFTMetadata(nftId),
      { initialProps: { nftId: '1' } }
    );

    await waitFor(() => {
      expect(result.current.metadata?.id).toBe('1');
    });

    // 改變 NFT ID
    rerender({ nftId: '2' });

    await waitFor(() => {
      expect(result.current.metadata?.id).toBe('2');
    });
  });

  test('處理 404 Not Found', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useNFTMetadata('999'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toContain('Not Found');
  });

  test('提供格式化的稀有度文字', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockMetadata,
    });

    const { result } = renderHook(() => useNFTMetadata('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rarityLabel).toBe('傳說');
  });

  test('處理不同稀有度的標籤', async () => {
    const rarityTests = [
      { rarity: 'legendary', expected: '傳說' },
      { rarity: 'epic', expected: '史詩' },
      { rarity: 'rare', expected: '稀有' },
      { rarity: 'common', expected: '普通' },
    ];

    for (const { rarity, expected } of rarityTests) {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockMetadata, rarity }),
      });

      const { result } = renderHook(() => useNFTMetadata('1'));

      await waitFor(() => {
        expect(result.current.rarityLabel).toBe(expected);
      });
    }
  });
});
