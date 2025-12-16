// Contract IDs
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x0";
export const MGC_TREASURY_ID = process.env.NEXT_PUBLIC_MGC_TREASURY_ID || "0x0";
export const NFT_CONFIG_ID = process.env.NEXT_PUBLIC_NFT_CONFIG_ID || "0x0";

// IPFS Gateway
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Game Constants
export const CHECK_IN_REWARD = 5;
export const DRAW_COST = 10;
export const MINT_COST = 5;

// Coin Types
export const MGC_COIN_TYPE = `${PACKAGE_ID}::mgc::MGC`;

// Object Types
export const CHECK_IN_RECORD_TYPE = `${PACKAGE_ID}::check_in::UserCheckInRecord`;
export const DRAW_RECORD_TYPE = `${PACKAGE_ID}::oracle_draw::DrawRecord`;
export const ORACLE_NFT_TYPE = `${PACKAGE_ID}::oracle_nft::OracleNFT`;

// Time Constants (UTC+8)
export const UTC8_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
export const SECONDS_PER_DAY = 86400;

// Answer Constants
export const MAX_ANSWER_ID = 49;
export const TOTAL_ANSWERS = 50;

// Rarity Constants
export const RARITY_INFO = {
  0: { name: "Common", color: "gray", probability: 0.6 },
  1: { name: "Rare", color: "blue", probability: 0.3 },
  2: { name: "Epic", color: "purple", probability: 0.08 },
  3: { name: "Legendary", color: "gold", probability: 0.02 },
} as const;

export type Rarity = 0 | 1 | 2 | 3;
