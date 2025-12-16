import { useState, useEffect } from 'react';
import type { Rarity } from './use-oracle-nfts';

export interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  question: string;
  answerEn: string;
  answerZh: string;
  answerId: number;
  drawnAt: string;
  mintedAt: string;
}

export interface UseNFTMetadataReturn {
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: string | null;
  rarityLabel: string;
}

const RARITY_LABELS: Record<Rarity, string> = {
  legendary: '傳說',
  epic: '史詩',
  rare: '稀有',
  common: '普通',
};

/**
 * Hook to fetch NFT metadata by ID
 *
 * @param nftId - The NFT ID to fetch metadata for
 * @returns Metadata, loading state, error state, and formatted rarity label
 */
export function useNFTMetadata(nftId: string): UseNFTMetadataReturn {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if NFT ID is empty
    if (!nftId) {
      setIsLoading(false);
      setMetadata(null);
      setError(null);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual metadata source
        // For now, use mock API endpoint or static files
        const response = await fetch(`/api/nfts/metadata/${nftId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setMetadata(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [nftId]);

  const rarityLabel = metadata ? RARITY_LABELS[metadata.rarity] : '';

  return {
    metadata,
    isLoading,
    error,
    rarityLabel,
  };
}
