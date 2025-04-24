// Type Definitions for the Swap page
export interface Currency {
  id: string;
  name: string;
  symbol: string;
  network: string;
  networkName?: string; // Display name for the network
  imageUrl?: string;
  extraIdName?: string;
  contractAddress?: string;
}

export interface SwapWidgetProps {
  fromCurrency: Currency | null;
  toCurrency: Currency | null;
  setFromModalOpen: (isOpen: boolean) => void;
  setToModalOpen: (isOpen: boolean) => void;
  swapCurrencies: () => void;
  isConnected: boolean;
  connectWallet: () => Promise<string | null>;
  userAccount: string;
  setWalletVisible: (visible: boolean) => void;
}

export interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  onSelect: (currency: Currency) => void;
  title: string;
}

// API types
export interface ApiCurrencyPair {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
}

export interface ApiPairsResponse {
  pairs: ApiCurrencyPair[];
}

// Swap Quote types
export interface SwapQuoteRequest {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  fromAmount: string;
  fromWalletAddress: string;
  flow: 'standard';
}

export interface SwapQuoteResponse {
  id: string;
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  fromAmount: string;
  toAmount: string;
  signature: string;
  networkFee: string;
  expiry: number;
}

export interface CurrencyInfo {
  id: string;
  code: string;
  name: string;
  isEnabled: boolean;
  imageUrl?: string;
  requiresExtraTag?: boolean;
  networks?: Network[];
}

export interface Network {
  id: string;
  code: string;
  name: string;
  imageUrl: string | null;
  transactionUrl: string | null;
  addressUrl: string | null;
  addressRegex: string | null;
  addressTagRegex: string | null;
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAYOUT_CREATED = 'payout_created',
}

export interface TransactionData {
  // Identifiers
  id: string;
  externalId: string;

  // From (Source) details
  fromCurrency: string;
  fromNetwork: string;
  fromAmount: string;
  fromWalletAddress: string;
  fromWalletAddressExtra: string;

  // To (Destination) details
  toCurrency: string;
  toNetwork: string;
  toAmount: string;
  toWalletAddress: string;
  toWalletAddressExtra: string;

  // Status information
  status: TransactionStatus;
  completedAt: string; // ISO 8601 date-time string

  // Deposit information
  depositAddress: string;
  depositExtraId: string;
}
