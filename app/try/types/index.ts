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
  networks?: string[]; // Make networks optional since it's not present in the response
}
