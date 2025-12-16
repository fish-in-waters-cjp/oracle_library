import { describe, test, expect } from 'vitest';
import answers from '@/public/data/answers.json';

describe('answers.json 資料驗證', () => {
  test('包含恰好 50 個答案', () => {
    expect(answers).toHaveLength(50);
  });

  test('每個答案有必要欄位', () => {
    answers.forEach((answer) => {
      expect(answer).toHaveProperty('id');
      expect(answer).toHaveProperty('text_zh');
      expect(answer).toHaveProperty('text_en');
      expect(answer).toHaveProperty('rarity');
    });
  });

  test('ID 連續且無重複 (1-50)', () => {
    const ids = answers.map((a) => a.id);
    const uniqueIds = new Set(ids);

    // ID 無重複
    expect(uniqueIds.size).toBe(50);

    // ID 範圍 1-50
    ids.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(50);
    });

    // ID 連續
    const sortedIds = [...ids].sort((a, b) => a - b);
    for (let i = 0; i < sortedIds.length; i++) {
      expect(sortedIds[i]).toBe(i + 1);
    }
  });

  test('稀有度分布符合設計 (18/15/10/7)', () => {
    const rarityCount = {
      Common: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0,
    };

    answers.forEach((answer) => {
      if (answer.rarity in rarityCount) {
        rarityCount[answer.rarity as keyof typeof rarityCount]++;
      }
    });

    expect(rarityCount.Common).toBe(18); // 36%
    expect(rarityCount.Rare).toBe(15); // 30%
    expect(rarityCount.Epic).toBe(10); // 20%
    expect(rarityCount.Legendary).toBe(7); // 14%
  });

  test('中英文內容非空', () => {
    answers.forEach((answer) => {
      expect(answer.text_zh.trim()).not.toBe('');
      expect(answer.text_en.trim()).not.toBe('');
    });
  });

  test('稀有度值正確', () => {
    const validRarities = ['Common', 'Rare', 'Epic', 'Legendary'];

    answers.forEach((answer) => {
      expect(validRarities).toContain(answer.rarity);
    });
  });

  test('ID 為正整數', () => {
    answers.forEach((answer) => {
      expect(Number.isInteger(answer.id)).toBe(true);
      expect(answer.id).toBeGreaterThan(0);
    });
  });
});
