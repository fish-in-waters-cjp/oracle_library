/**
 * Random utility functions for oracle draw
 *
 * 提供答案抽取所需的隨機數生成功能
 */

// 答案 ID 範圍
const MIN_ANSWER_ID = 0;
const MAX_ANSWER_ID = 49;
const TOTAL_ANSWERS = 50;

// 稀有度機率分布
const RARITY_PROBABILITIES = {
  common: 0.6, // 60%
  rare: 0.3, // 30%
  epic: 0.08, // 8%
  legendary: 0.02, // 2%
} as const;

// 稀有度對應的答案 ID 範圍
const RARITY_RANGES = {
  common: { start: 0, end: 29 }, // 30 個答案
  rare: { start: 30, end: 44 }, // 15 個答案
  epic: { start: 45, end: 48 }, // 4 個答案
  legendary: { start: 49, end: 49 }, // 1 個答案
} as const;

export type RarityLevel = keyof typeof RARITY_PROBABILITIES;

/**
 * 生成指定範圍內的隨機整數
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 隨機整數
 */
export function getRandomInt(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * 生成隨機答案 ID（均勻分布）
 * @returns 0-49 之間的隨機整數
 */
export function getRandomAnswerId(): number {
  return getRandomInt(MIN_ANSWER_ID, MAX_ANSWER_ID);
}

/**
 * 根據稀有度機率分布生成加權隨機答案 ID
 *
 * 機率分布：
 * - Common (60%): ID 0-29
 * - Rare (30%): ID 30-44
 * - Epic (8%): ID 45-48
 * - Legendary (2%): ID 49
 *
 * @returns 加權隨機的答案 ID
 */
export function getWeightedRandomAnswerId(): number {
  const roll = Math.random();

  let cumulative = 0;

  // Common: 0 - 0.6
  cumulative += RARITY_PROBABILITIES.common;
  if (roll < cumulative) {
    const range = RARITY_RANGES.common;
    return getRandomInt(range.start, range.end);
  }

  // Rare: 0.6 - 0.9
  cumulative += RARITY_PROBABILITIES.rare;
  if (roll < cumulative) {
    const range = RARITY_RANGES.rare;
    return getRandomInt(range.start, range.end);
  }

  // Epic: 0.9 - 0.98
  cumulative += RARITY_PROBABILITIES.epic;
  if (roll < cumulative) {
    const range = RARITY_RANGES.epic;
    return getRandomInt(range.start, range.end);
  }

  // Legendary: 0.98 - 1.0
  return RARITY_RANGES.legendary.start; // ID 49
}

/**
 * 根據答案 ID 取得稀有度
 * @param answerId 答案 ID (0-49)
 * @returns 稀有度數值 (0-3)
 */
export function getRarityFromAnswerId(answerId: number): number {
  if (answerId >= RARITY_RANGES.legendary.start) return 3;
  if (answerId >= RARITY_RANGES.epic.start) return 2;
  if (answerId >= RARITY_RANGES.rare.start) return 1;
  return 0;
}

/**
 * 根據答案 ID 取得稀有度標籤
 * @param answerId 答案 ID (0-49)
 * @returns 稀有度標籤
 */
export function getRarityLabelFromAnswerId(answerId: number): RarityLevel {
  if (answerId >= RARITY_RANGES.legendary.start) return 'legendary';
  if (answerId >= RARITY_RANGES.epic.start) return 'epic';
  if (answerId >= RARITY_RANGES.rare.start) return 'rare';
  return 'common';
}

/**
 * 將問題字串 hash 為 bytes（用於鏈上記錄）
 *
 * 使用簡單的 hash 函數，主要用於隱私保護
 * 注意：這不是密碼學安全的 hash
 *
 * @param question 問題字串
 * @returns hash bytes 的 Uint8Array
 */
export function hashQuestion(question: string): Uint8Array {
  if (!question || question.trim() === '') {
    return new Uint8Array(0);
  }

  // 簡單的 hash 實作（非密碼學安全）
  const encoder = new TextEncoder();
  const data = encoder.encode(question);

  // 使用 FNV-1a hash 變體
  let hash = 2166136261;
  for (const byte of data) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }

  // 轉換為 32-bit bytes
  const result = new Uint8Array(4);
  result[0] = (hash >>> 24) & 0xff;
  result[1] = (hash >>> 16) & 0xff;
  result[2] = (hash >>> 8) & 0xff;
  result[3] = hash & 0xff;

  return result;
}

/**
 * 使用 Web Crypto API 生成更安全的隨機答案 ID
 * 適用於需要更高隨機性的場景
 *
 * @returns Promise<number> 0-49 之間的安全隨機整數
 */
export async function getSecureRandomAnswerId(): Promise<number> {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % TOTAL_ANSWERS;
}

/**
 * 驗證答案 ID 是否有效
 * @param answerId 待驗證的答案 ID
 * @returns 是否有效
 */
export function isValidAnswerId(answerId: number): boolean {
  return (
    Number.isInteger(answerId) &&
    answerId >= MIN_ANSWER_ID &&
    answerId <= MAX_ANSWER_ID
  );
}

/**
 * 取得稀有度的顯示資訊
 */
export const RARITY_INFO = {
  0: { label: 'common', name: '普通', color: 'gray' },
  1: { label: 'rare', name: '稀有', color: 'blue' },
  2: { label: 'epic', name: '史詩', color: 'purple' },
  3: { label: 'legendary', name: '傳說', color: 'gold' },
} as const;

export type RarityValue = 0 | 1 | 2 | 3;
