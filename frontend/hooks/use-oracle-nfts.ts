import { useState, useEffect, useCallback } from 'react';

export type Rarity = 'legendary' | 'epic' | 'rare' | 'common';

export interface OracleNFT {
  id: string;
  rarity: Rarity;
  question: string;
  answerEn: string;
  answerZh: string;
  mintedAt: string;
}

export interface NFTStats {
  total: number;
  legendary: number;
  epic: number;
  rare: number;
  common: number;
}

export interface UseOracleNFTsReturn {
  nfts: OracleNFT[];
  isLoading: boolean;
  error: string | null;
  stats: NFTStats;
  refetch: () => void;
}

/**
 * Hook to fetch and manage Oracle NFTs for a wallet address
 *
 * @param walletAddress - The wallet address to fetch NFTs for
 * @returns NFT data, loading state, error state, stats, and refetch function
 */
export function useOracleNFTs(walletAddress: string): UseOracleNFTsReturn {
  const [nfts, setNfts] = useState<OracleNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    // Don't fetch if wallet address is empty
    if (!walletAddress) {
      setIsLoading(false);
      setNfts([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call to oracle_nft contract
      // For now, use mock API endpoint
      const response = await fetch(`/api/nfts/${walletAddress}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
      }

      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Calculate stats from NFTs
  const stats: NFTStats = {
    total: nfts.length,
    legendary: nfts.filter((nft) => nft.rarity === 'legendary').length,
    epic: nfts.filter((nft) => nft.rarity === 'epic').length,
    rare: nfts.filter((nft) => nft.rarity === 'rare').length,
    common: nfts.filter((nft) => nft.rarity === 'common').length,
  };

  return {
    nfts,
    isLoading,
    error,
    stats,
    refetch: fetchNFTs,
  };
}
