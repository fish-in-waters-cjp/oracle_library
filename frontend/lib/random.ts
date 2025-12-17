/**
 * 隨機工具函數
 * 用於前端生成隨機答案 ID 和其他隨機值
 */

/**
 * 生成隨機答案 ID (0-49)
 * 使用 crypto.getRandomValues 確保隨機性
 */
export function generateRandomAnswerId(): number {
  const maxAnswerId = 49;
  const randomBuffer = new Uint8Array(1);
  crypto.getRandomValues(randomBuffer);

  // 將 0-255 映射到 0-49
  return randomBuffer[0] % (maxAnswerId + 1);
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
