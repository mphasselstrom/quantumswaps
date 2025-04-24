// Base connector interface that all wallet connectors must implement
export interface WalletConnector {
  isConnected: boolean;
  userAccount: string;
  chainId?: number;

  // Core methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendTransaction(amount: number, txData: WalletTransaction): Promise<void>;
  switchNetwork(chainId: number): Promise<void>;
}

// Context type for the wallet provider
export interface WalletContextType {
  connector: WalletConnector | null;
  network: string;
  isConnecting: boolean;
  error: Error | null;

  // Actions
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  setNetwork(network: string): Promise<void>;
}

// Chain configuration type
export interface ChainConfig {
  chainId: number;
  name: string;
  network: string;
  currency: string;
  explorer: string;
  rpcUrl: string;
}

export interface WalletTransaction {
  id: string;
  fromAmount: string;
  depositAddress: string;
  data?: string; // For smart contract interactions
  network: string;
}
