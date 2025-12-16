import { IPFS_GATEWAY } from "@/consts";

/**
 * Convert IPFS CID to HTTP URL using configured gateway
 */
export function ipfsToHttp(cid: string): string {
  if (!cid) return "";

  // Remove ipfs:// prefix if present
  const cleanCid = cid.replace(/^ipfs:\/\//, "");

  return `${IPFS_GATEWAY}${cleanCid}`;
}

/**
 * Upload JSON to IPFS (placeholder - requires IPFS client)
 * In production, this would use a service like web3.storage or nft.storage
 */
export async function uploadJsonToIPFS(data: Record<string, unknown>): Promise<string> {
  // TODO: Implement actual IPFS upload
  // For now, return a placeholder CID
  console.warn("IPFS upload not implemented - using placeholder CID");
  return "QmPlaceholder";
}

/**
 * Upload file to IPFS (placeholder - requires IPFS client)
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  // TODO: Implement actual IPFS upload
  console.warn("IPFS upload not implemented - using placeholder CID");
  return "QmPlaceholder";
}

/**
 * Fetch JSON from IPFS
 */
export async function fetchFromIPFS<T = unknown>(cid: string): Promise<T> {
  const url = ipfsToHttp(cid);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Generate NFT metadata JSON
 */
export function generateNFTMetadata(params: {
  name: string;
  description: string;
  imageUrl: string;
  answerEn: string;
  answerZh: string;
  answerId: number;
  rarity: number;
  drawnAt: number;
}): Record<string, unknown> {
  return {
    name: params.name,
    description: params.description,
    image: params.imageUrl,
    attributes: [
      {
        trait_type: "Answer ID",
        value: params.answerId,
      },
      {
        trait_type: "Rarity",
        value: params.rarity,
      },
      {
        trait_type: "Drawn At",
        value: params.drawnAt,
      },
    ],
    answer_en: params.answerEn,
    answer_zh: params.answerZh,
  };
}
