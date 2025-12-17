import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnswers } from '@/hooks/use-answers';

// Mock answers data
const mockAnswers = [
  {
    id: 0,
    en: 'The journey of a thousand miles begins with a single step.',
    zh: '千里之行，始於足下。',
    rarity: 0,
    category: 'wisdom',
  },
  {
    id: 1,
    en: 'When one door closes, another opens.',
    zh: '當一扇門關閉，另一扇門會開啟。',
    rarity: 0,
    category: 'hope',
  },
  {
    id: 30,
    en: 'The only true wisdom is in knowing you know nothing.',
    zh: '唯一真正的智慧是知道自己一無所知。',
    rarity: 1,
    category: 'philosophy',
  },
  {
    id: 45,
    en: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    zh: '在一個不斷試圖改變你的世界裡做自己，是最偉大的成就。',
    rarity: 2,
    category: 'self',
  },
  {
    id: 49,
    en: 'The unexamined life is not worth living.',
    zh: '未經審視的人生不值得活。',
    rarity: 3,
    category: 'philosophy',
  },
];

describe('useAnswers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnswers,
    });
  });

  test('初始狀態為載入中', () => {
    const { result } = renderHook(() => useAnswers());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.answers).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('成功載入答案列表', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.answers).toEqual(mockAnswers);
    expect(result.current.error).toBeNull();
  });

  test('getAnswerById 回傳正確答案', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const answer = result.current.getAnswerById(49);
    expect(answer).toEqual(mockAnswers[4]);
    expect(answer?.rarity).toBe(3);
  });

  test('getAnswerById 找不到時回傳 undefined', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const answer = result.current.getAnswerById(999);
    expect(answer).toBeUndefined();
  });

  test('getRandomAnswerId 回傳有效範圍', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test multiple times to ensure randomness is within bounds
    for (let i = 0; i < 100; i++) {
      const answerId = result.current.getRandomAnswerId();
      expect(answerId).toBeGreaterThanOrEqual(0);
      expect(answerId).toBeLessThanOrEqual(49);
    }
  });

  test('getWeightedRandomAnswerId 依機率分布', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Run many times and check distribution
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const answerId = result.current.getWeightedRandomAnswerId();
      const answer = result.current.getAnswerById(answerId);
      if (answer) {
        if (answer.rarity === 0) counts.common++;
        else if (answer.rarity === 1) counts.rare++;
        else if (answer.rarity === 2) counts.epic++;
        else if (answer.rarity === 3) counts.legendary++;
      }
    }

    // Common should be most frequent (60%)
    // Rare should be second (30%)
    // Epic should be less (8%)
    // Legendary should be least (2%)
    // Due to randomness, just check relative ordering
    expect(counts.common).toBeGreaterThan(counts.rare);
    expect(counts.rare).toBeGreaterThan(counts.epic);
  });

  test('getRarityLabel 回傳正確標籤', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getRarityLabel(0)).toBe('common');
    expect(result.current.getRarityLabel(1)).toBe('rare');
    expect(result.current.getRarityLabel(2)).toBe('epic');
    expect(result.current.getRarityLabel(3)).toBe('legendary');
  });

  test('getRarityColor 回傳正確顏色', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getRarityColor(0)).toBe('gray');
    expect(result.current.getRarityColor(1)).toBe('blue');
    expect(result.current.getRarityColor(2)).toBe('purple');
    expect(result.current.getRarityColor(3)).toBe('gold');
  });

  test('處理載入錯誤', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.answers).toEqual([]);
  });

  test('處理 HTTP 錯誤', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain('Failed to load answers');
  });

  test('filterByRarity 過濾正確', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const legendaryAnswers = result.current.filterByRarity(3);
    expect(legendaryAnswers.every((a) => a.rarity === 3)).toBe(true);

    const commonAnswers = result.current.filterByRarity(0);
    expect(commonAnswers.every((a) => a.rarity === 0)).toBe(true);
  });

  test('filterByCategory 過濾正確', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const wisdomAnswers = result.current.filterByCategory('wisdom');
    expect(wisdomAnswers.every((a) => a.category === 'wisdom')).toBe(true);
  });

  test('答案資料結構正確', async () => {
    const { result } = renderHook(() => useAnswers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.answers.forEach((answer) => {
      expect(answer).toHaveProperty('id');
      expect(answer).toHaveProperty('en');
      expect(answer).toHaveProperty('zh');
      expect(answer).toHaveProperty('rarity');
      expect(answer).toHaveProperty('category');
      expect(typeof answer.id).toBe('number');
      expect(typeof answer.en).toBe('string');
      expect(typeof answer.zh).toBe('string');
      expect([0, 1, 2, 3]).toContain(answer.rarity);
    });
  });
});
