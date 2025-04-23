import { useState, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const useWallet = () => {
  const { wallet, disconnect, connected, publicKey } = useSolanaWallet();
  const { visible, setVisible } = useWalletModal();
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      if (window.solana?.isPhantom) {
        setVisible(true);
        return publicKey?.toString() || null;
      } else {
        setError('Please install Phantom wallet for the best experience.');
        window.open('https://phantom.app/', '_blank');
        return null;
      }
    } catch (err) {
      setError(
        'Failed to connect Phantom wallet. Please make sure your wallet is unlocked.'
      );
      return null;
    }
  }, [publicKey, setVisible]);

  return {
    wallet,
    isConnected: connected,
    userAccount: publicKey?.toString() || '',
    error,
    connectWallet,
    disconnectWallet: disconnect,
    showWalletModal: () => setVisible(true),
    hideWalletModal: () => setVisible(false),
    isWalletModalOpen: visible,
  };
};
