'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import SwapPageContent from './components/SwapPageContent';

export default function SwapPage() {
  const endpoint = useMemo(
    () =>
      'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d',
    []
  );
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SwapPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
