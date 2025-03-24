// Type Definitions for the Swap page
export interface Currency {
  id: string
  name: string
  symbol: string
  icon: string
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
}

export interface CurrencySelectorProps {
  isOpen: boolean
  onClose: () => void
  currencies: Currency[]
  onSelect: (currency: Currency) => void
  title: string
} 