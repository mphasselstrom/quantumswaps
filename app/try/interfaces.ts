// Type Definitions for the Swap page
export interface Currency {
  id: string
  name: string
  symbol: string
  network: string
  extraIdName?: string
  contractAddress?: string
}

export interface SwapWidgetProps {
  fromCurrency: Currency | null
  toCurrency: Currency | null
  setFromModalOpen: (open: boolean) => void
  setToModalOpen: (open: boolean) => void
  swapCurrencies: () => void
  isConnected: boolean
  connectWallet: () => Promise<string | null>
  userAccount: string
  setWalletVisible: (visible: boolean) => void
}

export interface CurrencySelectorProps {
  isOpen: boolean
  onClose: () => void
  currencies: Currency[]
  onSelect: (currency: Currency) => void
  title: string
}

// API types
export interface ApiCurrencyPair {
  fromCurrency: {
    currency: string
    network: string
  }
  toCurrency: {
    currency: string
    network: string
  }
}

export interface ApiPairsResponse {
  pairs: ApiCurrencyPair[]
}

// Swap Quote types
export interface SwapQuoteRequest {
  fromCurrency: string;
  fromNetwork?: string;
  toCurrency: string;
  toNetwork?: string;
  fromAmount?: string;
  toAmount?: string;
  flow?: string;
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
}

export interface SwapQuoteResponse {
  fromAmount: string;
  toAmount: string;
  networkFee: string;
  fromCurrency: string;
  fromNetwork?: string;
  toCurrency: string;
  toNetwork?: string;
  expiresIn?: string;
  rateId: string;
  flow?: string;
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
  signature: string;
} 