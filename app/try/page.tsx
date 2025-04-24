'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import SwapPageContent from './components/SwapPageContent';
import '@solana/wallet-adapter-react-ui/styles.css';

declare global {
  interface Window {
    ethereum?: any;
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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SwapPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
