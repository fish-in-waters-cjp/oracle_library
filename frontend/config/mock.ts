/**
 * Mock 模式配置
 *
 * 在開發階段統一控制所有 mock 資料
 * 正式上線前將 MOCK_ENABLED 設為 false
 */

// ===== 全域 Mock 開關 =====
export const MOCK_ENABLED = true;

// ===== Mock 資料 =====
export const MOCK_DATA = {
  // 錢包
  wallet: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
  },

  // MGC 餘額
  balance: {
    amount: BigInt(100_000_000_000), // 100 MGC
    decimals: 9,
  },

  // MGC Coins
  coins: {
    coinId: 'mock-mgc-coin-0x1234567890',
    balance: BigInt(100_000_000_000), // 100 MGC
  },

  // 抽取交易
  draw: {
    delayMs: 800, // 模擬交易延遲
  },

  // NFT 鑄造
  mint: {
    delayMs: 1200, // 模擬鑄造延遲
  },
} as const;

// ===== 工具函數 =====

/**
 * 取得 mock 餘額的顯示字串
 */
export function getMockDisplayBalance(): string {
  return (Number(MOCK_DATA.balance.amount) / Math.pow(10, MOCK_DATA.balance.decimals)).toString();
}

/**
 * 取得截斷的 mock 錢包地址
 */
export function getMockTruncatedAddress(): string {
  const addr = MOCK_DATA.wallet.address;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
