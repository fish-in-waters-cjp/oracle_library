import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
} from '@iota/dapp-kit';
import { MOCK_ENABLED, MOCK_DATA, getMockTruncatedAddress } from '@/config/mock';

export interface UseWalletConnectionReturn {
  // 狀態
  isConnected: boolean;
  address: string | null;
  truncatedAddress: string | null;
  walletIcon: string | null;

  // 操作
  disconnect: () => void;
  isDisconnecting: boolean;
}

/**
 * 管理錢包連接狀態
 *
 * @returns 錢包連接狀態和操作
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, address, disconnect } = useWalletConnection();
 *
 *   if (!isConnected) {
 *     return <ConnectButton />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Connected: {address}</p>
 *       <button onClick={disconnect}>Disconnect</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletConnection(): UseWalletConnectionReturn {
  const currentAccount = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const { mutate: disconnect, isPending: isDisconnecting } =
    useDisconnectWallet();

  // === MOCK 模式 ===
  if (MOCK_ENABLED) {
    return {
      isConnected: true,
      address: MOCK_DATA.wallet.address,
      truncatedAddress: getMockTruncatedAddress(),
      walletIcon: null,
      disconnect: () => console.log('[Mock] disconnect called'),
      isDisconnecting: false,
    };
  }

  // === 真實模式 ===
  const address = currentAccount?.address ?? null;
  const isConnected = !!address;

  // 截斷地址：前6後4
  const truncatedAddress = address
    ? address.length <= 12
      ? address
      : `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  // 取得錢包圖示（只在連接時可用）
  const walletIcon = currentWallet.isConnected
    ? (currentWallet.currentWallet?.icon ?? null)
    : null;

  return {
    isConnected,
    address,
    truncatedAddress,
    walletIcon,
    disconnect,
    isDisconnecting,
  };
}
