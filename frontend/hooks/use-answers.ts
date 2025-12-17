import { useState, useEffect } from 'react';

/**
 * 答案稀有度
 */
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

/**
 * 答案資料結構
 */
export interface Answer {
  id: number;
  text_zh: string;
  text_en: string;
  rarity: Rarity;
}

/**
 * 稀有度對應數值（用於合約）
 */
export const RARITY_TO_NUMBER: Record<Rarity, number> = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
};

/**
 * 數值對應稀有度（用於從合約讀取）
 */
export const NUMBER_TO_RARITY: Record<number, Rarity> = {
  0: 'Common',
  1: 'Rare',
  2: 'Epic',
  3: 'Legendary',
};

/**
 * 稀有度顏色配置
 */
export const RARITY_COLORS: Record<Rarity, string> = {
  Common: '#9CA3AF',     // 灰色
  Rare: '#3B82F6',       // 藍色
  Epic: '#A855F7',       // 紫色
  Legendary: '#F59E0B',  // 金色
};

/**
 * Hook 回傳值
 */
interface UseAnswersReturn {
  /** 所有答案列表 */
  answers: Answer[];
  /** 根據 ID 取得答案（0-based index，對應合約的 answer_id） */
  getAnswerById: (id: number) => Answer | undefined;
  /** 根據稀有度篩選答案 */
  getAnswersByRarity: (rarity: Rarity) => Answer[];
  /** 取得隨機答案 */
  getRandomAnswer: () => Answer;
  /** 載入狀態 */
  isLoading: boolean;
  /** 錯誤訊息 */
  error: string | null;
}

/**
 * useAnswers Hook
 *
 * 載入並管理答案資料
 *
 * @example
 * ```tsx
 * const { answers, getAnswerById, isLoading } = useAnswers();
 *
 * if (isLoading) return <div>載入中...</div>;
 *
 * const answer = getAnswerById(25);
 * console.log(answer.text_zh); // "你的答案"
 * ```
 */
export function useAnswers(): UseAnswersReturn {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/data/answers.json');

        if (!response.ok) {
          throw new Error(`Failed to load answers: ${response.statusText}`);
        }

        const data = await response.json();

        // 驗證資料格式
        if (!Array.isArray(data)) {
          throw new Error('Invalid answers data format: expected an array');
        }

        // 驗證每個答案的結構
        const validAnswers = data.filter((answer): answer is Answer => {
          return (
            typeof answer.id === 'number' &&
            typeof answer.text_zh === 'string' &&
            typeof answer.text_en === 'string' &&
            typeof answer.rarity === 'string' &&
            ['Common', 'Rare', 'Epic', 'Legendary'].includes(answer.rarity)
          );
        });

        if (validAnswers.length !== data.length) {
          console.warn(
            `Filtered out ${data.length - validAnswers.length} invalid answers`
          );
        }

        setAnswers(validAnswers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to load answers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnswers();
  }, []);

  /**
   * 根據 ID 取得答案
   * 注意：合約使用 0-based index，所以 answer_id 0 對應 id 1 的答案
   */
  const getAnswerById = (id: number): Answer | undefined => {
    // 合約的 answer_id 是 0-49，對應陣列 index
    return answers[id];
  };

  /**
   * 根據稀有度篩選答案
   */
  const getAnswersByRarity = (rarity: Rarity): Answer[] => {
    return answers.filter((answer) => answer.rarity === rarity);
  };

  /**
   * 取得隨機答案
   */
  const getRandomAnswer = (): Answer => {
    if (answers.length === 0) {
      throw new Error('No answers available');
    }

    const randomIndex = Math.floor(Math.random() * answers.length);
    return answers[randomIndex];
  };

  return {
    answers,
    getAnswerById,
    getAnswersByRarity,
    getRandomAnswer,
    isLoading,
    error,
  };
}

/**
 * 取得稀有度的顯示名稱（中文）
 */
export function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    Common: '普通',
    Rare: '稀有',
    Epic: '史詩',
    Legendary: '傳說',
  };
  return labels[rarity];
}

/**
 * 取得稀有度的顏色
 */
export function getRarityColor(rarity: Rarity): string {
  return RARITY_COLORS[rarity];
}
