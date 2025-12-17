/**
 * 隨機工具函數
 * 用於前端生成隨機答案 ID 和其他隨機值
 */

// 答案 ID 範圍
const MIN_ANSWER_ID = 0;
const MAX_ANSWER_ID = 49;
const TOTAL_ANSWERS = 50;

// 稀有度機率分布
const RARITY_PROBABILITIES = {
  common: 0.6,    // 60%
  rare: 0.3,      // 30%
  epic: 0.08,     // 8%
  legendary: 0.02 // 2%
} as const;

// 稀有度對應的答案 ID 範圍
const RARITY_RANGES = {
  common: { start: 0, end: 29 },      // 30 個答案
  rare: { start: 30, end: 44 },       // 15 個答案
  epic: { start: 45, end: 48 },       // 4 個答案
  legendary: { start: 49, end: 49 },  // 1 個答案
} as const;

export type RarityLevel = keyof typeof RARITY_PROBABILITIES;

/**
 * 生成隨機答案 ID (0-49)
 * 使用 crypto.getRandomValues 確保隨機性
 */
export function generateRandomAnswerId(): number {
  const randomBuffer = new Uint8Array(1);
  crypto.getRandomValues(randomBuffer);

  // 將 0-255 映射到 0-49
  return randomBuffer[0] % TOTAL_ANSWERS;
}

/**
 * 從指定範圍生成隨機整數 [min, max]
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }

  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);

  return min + (randomBuffer[0] % range);
}

/**
 * 從陣列中隨機選擇一個元素
 * @param array 來源陣列
 * @returns 隨機選中的元素
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot choose from an empty array');
  }

  const index = randomInt(0, array.length - 1);
  return array[index];
}

/**
 * 打亂陣列順序（Fisher-Yates shuffle）
 * @param array 原始陣列
 * @returns 打亂後的新陣列
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 生成隨機浮點數 [0, 1)
 */
export function randomFloat(): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);

  // 將 32 位整數轉換為 [0, 1) 的浮點數
  return randomBuffer[0] / (0xFFFFFFFF + 1);
}

/**
 * 根據權重隨機選擇索引
 * @param weights 權重陣列
 * @returns 選中的索引
 * @example
 * // 70% 機率選擇 0, 20% 選擇 1, 10% 選擇 2
 * weightedRandom([70, 20, 10])
 */
export function weightedRandom(weights: number[]): number {
  if (weights.length === 0) {
    throw new Error('weights array cannot be empty');
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    throw new Error('total weight must be positive');
  }

  const random = randomFloat() * total;
  let sum = 0;

  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return i;
    }
  }

  // 備援（理論上不應該到達這裡）
  return weights.length - 1;
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
  const roll = randomFloat();

  let cumulative = 0;

  // Common: 0 - 0.6
  cumulative += RARITY_PROBABILITIES.common;
  if (roll < cumulative) {
    const range = RARITY_RANGES.common;
    return randomInt(range.start, range.end);
  }

  // Rare: 0.6 - 0.9
  cumulative += RARITY_PROBABILITIES.rare;
  if (roll < cumulative) {
    const range = RARITY_RANGES.rare;
    return randomInt(range.start, range.end);
  }

  // Epic: 0.9 - 0.98
  cumulative += RARITY_PROBABILITIES.epic;
  if (roll < cumulative) {
    const range = RARITY_RANGES.epic;
    return randomInt(range.start, range.end);
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
 * 使用 FNV-1a hash 函數，主要用於隱私保護
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
