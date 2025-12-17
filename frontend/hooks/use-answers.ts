import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getWeightedRandomAnswerId,
  getRandomAnswerId,
  getRarityFromAnswerId,
  RARITY_INFO,
  type RarityValue,
} from '@/lib/random';

/**
 * Answer data structure
 */
export interface Answer {
  id: number;
  en: string;
  zh: string;
  rarity: RarityValue;
  category: string;
}

/**
 * Return type for useAnswers hook
 */
export interface UseAnswersReturn {
  answers: Answer[];
  isLoading: boolean;
  error: string | null;
  getAnswerById: (id: number) => Answer | undefined;
  getRandomAnswerId: () => number;
  getWeightedRandomAnswerId: () => number;
  getRarityLabel: (rarity: RarityValue) => string;
  getRarityColor: (rarity: RarityValue) => string;
  filterByRarity: (rarity: RarityValue) => Answer[];
  filterByCategory: (category: string) => Answer[];
}

/**
 * Rarity labels mapping
 */
const RARITY_LABELS: Record<RarityValue, string> = {
  0: 'common',
  1: 'rare',
  2: 'epic',
  3: 'legendary',
};

/**
 * Rarity colors mapping
 */
const RARITY_COLORS: Record<RarityValue, string> = {
  0: 'gray',
  1: 'blue',
  2: 'purple',
  3: 'gold',
};

/**
 * Hook to load and manage oracle answers
 *
 * Provides:
 * - Loading answers from static JSON file
 * - Answer lookup by ID
 * - Random answer selection (uniform and weighted)
 * - Filtering by rarity and category
 * - Rarity label and color utilities
 *
 * @returns Answer data and utility functions
 */
export function useAnswers(): UseAnswersReturn {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load answers from static JSON file
  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/data/answers.json');

        if (!response.ok) {
          throw new Error(`Failed to load answers: ${response.statusText}`);
        }

        const data = await response.json();
        setAnswers(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setAnswers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnswers();
  }, []);

  // Create answer lookup map for O(1) access
  const answerMap = useMemo(() => {
    return new Map(answers.map((answer) => [answer.id, answer]));
  }, [answers]);

  // Get answer by ID
  const getAnswerById = useCallback(
    (id: number): Answer | undefined => {
      return answerMap.get(id);
    },
    [answerMap]
  );

  // Get random answer ID (uniform distribution)
  const getRandomId = useCallback((): number => {
    return getRandomAnswerId();
  }, []);

  // Get weighted random answer ID based on rarity distribution
  const getWeightedRandomId = useCallback((): number => {
    return getWeightedRandomAnswerId();
  }, []);

  // Get rarity label
  const getRarityLabel = useCallback((rarity: RarityValue): string => {
    return RARITY_LABELS[rarity] || 'common';
  }, []);

  // Get rarity color
  const getRarityColor = useCallback((rarity: RarityValue): string => {
    return RARITY_COLORS[rarity] || 'gray';
  }, []);

  // Filter answers by rarity
  const filterByRarity = useCallback(
    (rarity: RarityValue): Answer[] => {
      return answers.filter((answer) => answer.rarity === rarity);
    },
    [answers]
  );

  // Filter answers by category
  const filterByCategory = useCallback(
    (category: string): Answer[] => {
      return answers.filter((answer) => answer.category === category);
    },
    [answers]
  );

  return {
    answers,
    isLoading,
    error,
    getAnswerById,
    getRandomAnswerId: getRandomId,
    getWeightedRandomAnswerId: getWeightedRandomId,
    getRarityLabel,
    getRarityColor,
    filterByRarity,
    filterByCategory,
  };
}

/**
 * Get display information for a rarity value
 */
export function getRarityDisplayInfo(rarity: RarityValue) {
  return RARITY_INFO[rarity];
}
