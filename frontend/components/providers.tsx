"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { registerIotaSnapWallet } from "@liquidlink-lab/iota-snap-for-metamask";
import { useState } from "react";

// 註冊 IOTA Snap 錢包（讓 MetaMask 可以連接 IOTA）
registerIotaSnapWallet();

const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [network] = useState<"testnet" | "mainnet">(
    (process.env.NEXT_PUBLIC_NETWORK as "testnet" | "mainnet") || "testnet"
  );

  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networks} defaultNetwork={network}>
        <WalletProvider theme={darkTheme} autoConnect>{children}</WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}
