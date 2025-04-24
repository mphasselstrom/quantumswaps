import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { WalletContextType, WalletConnector } from '../types/wallet';
import { WalletConnectConnector } from './WalletConnectConnector';

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<WalletConnector | null>(null);
  const [network, setNetwork] = useState<string>('ethereum');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const walletConnector = new WalletConnectConnector();
    setConnector(walletConnector);
  }, []);

  const value = {
    connector,
    network,
    isConnecting,
    error,
    setNetwork: async (newNetwork: string) => {
      if (connector && connector.isConnected) {
        // Map network names to chain IDs
        const chainIds: { [key: string]: number } = {
          ethereum: 1,
          polygon: 137,
          solana: 245022934, // Solana's chainId in WalletConnect
          // Add other networks as needed
        };

        try {
          setIsConnecting(true);
          await connector.switchNetwork(chainIds[newNetwork]);
          setNetwork(newNetwork);
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error('Failed to switch network')
          );
        } finally {
          setIsConnecting(false);
        }
      }
    },
    connect: async () => {
      if (connector) {
        try {
          setIsConnecting(true);
          await connector.connect();
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error('Failed to connect wallet')
          );
        } finally {
          setIsConnecting(false);
        }
      }
    },
    disconnect: async () => {
      if (connector) {
        try {
          setIsConnecting(true);
          await connector.disconnect();
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to disconnect wallet')
          );
        } finally {
          setIsConnecting(false);
        }
      }
    },
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
