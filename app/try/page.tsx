'use client';

import { useMemo } from 'react';
import SwapPageContent from './components/SwapPageContent';
import { WalletProvider } from './context/WalletProvider';

declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
    web3?: any;
    solana?: any;
  }
}

export default function SwapPage() {
  const endpoint = useMemo(
    () =>
      'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d',
    []
  );
  const wallets = useMemo(() => [], []);

  return (
    <WalletProvider>
      <SwapPageContent />
    </WalletProvider>
  );
}
