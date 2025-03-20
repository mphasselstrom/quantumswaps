'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'

// Dynamically import components to avoid SSR issues
const DynamicCurrencySelector = dynamic(() => Promise.resolve(CurrencySelector), { ssr: false })
const DynamicSwapWidget = dynamic(() => Promise.resolve(SwapWidget), { ssr: false })

// Configure wagmi and create a query client
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export default function TryPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <SwapPageContent />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function SwapPageContent() {
  const [fromModalOpen, setFromModalOpen] = useState(false)
  const [toModalOpen, setToModalOpen] = useState(false)
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null)
  const [toCurrency, setToCurrency] = useState<Currency | null>(null)
  
  // Dummy currency data
  const currencies: Currency[] = [
    { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '/images/currencies/solana.svg', network: 'Solana' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '/images/currencies/ethereum.svg', network: 'Ethereum' },
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '/images/currencies/bitcoin.svg', network: 'Bitcoin' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '/images/currencies/usdc.svg', network: 'Solana' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '/images/currencies/tether.svg', network: 'Ethereum' },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', icon: '/images/currencies/binance.svg', network: 'BNB Chain' },
  ]

  const handleSelectFromCurrency = (currency: Currency) => {
    setFromCurrency(currency)
    setFromModalOpen(false)
  }
  
  const handleSelectToCurrency = (currency: Currency) => {
    setToCurrency(currency)
    setToModalOpen(false)
  }
  
  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  return (
    <section className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-slate-900 pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute bottom-0 left-0 right-0 h-full bg-slate-900 z-10"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-b from-slate-800/0 via-slate-800/50 to-slate-900 h-[25rem]"></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10" aria-hidden="true">
          <div className="h-[40rem] w-[40rem] bg-slate-800 blur-[10rem] opacity-20 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <h1 className="h1 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Try Quantum</h1>
            <p className="text-lg text-slate-400">Swap between any chain at lightning speed and low cost</p>
          </div>

          {/* Swap Widget */}
          <div className="max-w-lg mx-auto mt-6">
            <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-xl shadow-lg">
              {/* Widget Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Swap</h2>
                <ConnectKitButton.Custom>
                  {({ isConnected, isConnecting, show, address, ensName }) => {
                    return (
                      <button 
                        onClick={show}
                        className="bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition duration-150 ease-in-out"
                      >
                        {isConnected ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-slate-300">{ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-300">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                          </div>
                        )}
                      </button>
                    )
                  }}
                </ConnectKitButton.Custom>
              </div>

              <SwapWidget 
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                setFromModalOpen={setFromModalOpen}
                setToModalOpen={setToModalOpen}
                swapCurrencies={swapCurrencies}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Currency Modals */}
      {fromModalOpen && (
        <CurrencySelector
          isOpen={fromModalOpen}
          onClose={() => setFromModalOpen(false)}
          currencies={currencies}
          onSelect={handleSelectFromCurrency}
          title="Select a token"
        />
      )}

      {toModalOpen && (
        <CurrencySelector
          isOpen={toModalOpen}
          onClose={() => setToModalOpen(false)}
          currencies={currencies}
          onSelect={handleSelectToCurrency}
          title="Select a token"
        />
      )}
    </section>
  )
}

// SwapWidget Component
function SwapWidget({ 
  fromCurrency, 
  toCurrency, 
  setFromModalOpen, 
  setToModalOpen,
  swapCurrencies
}: SwapWidgetProps) {
  
  return (
    <>
      {/* From Section */}
      <div className="mb-2">
        <div className="flex justify-between mb-2">
          <label className="text-sm text-slate-400 font-medium">From</label>
          <span className="text-sm text-slate-500">Balance: 0</span>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-2 rounded-full cursor-pointer"
                onClick={() => setFromModalOpen(true)}
              >
                {fromCurrency ? (
                  <>
                    <div className="w-5 h-5 mr-2 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-xs font-bold">{fromCurrency.symbol.charAt(0)}</span>
                    </div>
                    <span className="mr-1 text-slate-300">{fromCurrency.symbol}</span>
                  </>
                ) : (
                  <span className="mr-1 text-slate-300">Select</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>
            <input
              type="text"
              className="w-1/2 text-right bg-transparent form-input border-none text-xl text-slate-200 focus:ring-0"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button 
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-2 shadow-md transition duration-150 ease-in-out cursor-pointer"
          onClick={swapCurrencies}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>

      {/* To Section */}
      <div className="mb-5 mt-2">
        <div className="flex justify-between mb-2">
          <label className="text-sm text-slate-400 font-medium">To</label>
          <span className="text-sm text-slate-500">Balance: 0</span>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-2 rounded-full cursor-pointer"
                onClick={() => setToModalOpen(true)}
              >
                {toCurrency ? (
                  <>
                    <div className="w-5 h-5 mr-2 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-xs font-bold">{toCurrency.symbol.charAt(0)}</span>
                    </div>
                    <span className="mr-1 text-slate-300">{toCurrency.symbol}</span>
                  </>
                ) : (
                  <span className="mr-1 text-slate-300">Select</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>
            <input
              type="text"
              className="w-1/2 text-right bg-transparent form-input border-none text-xl text-slate-200 focus:ring-0"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      {/* Swap Details */}
      <div className="bg-slate-900/50 rounded-lg p-3 mb-5">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="text-slate-400">Rate</span>
          <span className="text-slate-300">
            {fromCurrency && toCurrency ? 
              `1 ${fromCurrency.symbol} = ${(Math.random() * 100).toFixed(4)} ${toCurrency.symbol}` : 
              '1 ? = ? ?'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="text-slate-400">Network Fee</span>
          <span className="text-slate-300">~ $0.00</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Estimated Time</span>
          <span className="text-slate-300">~ 2 min</span>
        </div>
      </div>

      {/* Button shows Swap or requirements */}
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show }) => {
          return isConnected ? (
            <button 
              className="btn text-sm text-white bg-purple-500 hover:bg-purple-600 w-full shadow-xs group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              disabled={!fromCurrency || !toCurrency}
            >
              {!fromCurrency || !toCurrency ? 'Select tokens' : 'Swap'} {fromCurrency && toCurrency && <span className="tracking-normal text-purple-300 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>}
            </button>
          ) : (
            <button 
              onClick={show}
              className="btn text-sm text-white bg-purple-500 hover:bg-purple-600 w-full shadow-xs group cursor-pointer"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'} <span className="tracking-normal text-purple-300 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  )
}

// CurrencySelector Modal Component
function CurrencySelector({ isOpen, onClose, currencies, onSelect, title }: CurrencySelectorProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-32 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          <button 
            className="text-slate-400 hover:text-slate-200 cursor-pointer" 
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by name or address"
            className="form-input w-full bg-slate-900 mb-4 sticky top-[65px] z-10"
          />
          <div className="max-h-[50vh] overflow-y-auto pb-2">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                className="w-full text-left p-3 hover:bg-slate-700 rounded-lg mb-2 flex items-center transition duration-150 ease-in-out cursor-pointer"
                onClick={() => onSelect(currency)}
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">{currency.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium">{currency.name}</div>
                  <div className="text-slate-400 text-sm">{currency.symbol} • {currency.network}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Type Definitions
interface Currency {
  id: string
  name: string
  symbol: string
  icon: string
  network: string
}

interface SwapWidgetProps {
  fromCurrency: Currency | null
  toCurrency: Currency | null
  setFromModalOpen: (open: boolean) => void
  setToModalOpen: (open: boolean) => void
  swapCurrencies: () => void
}

interface CurrencySelectorProps {
  isOpen: boolean
  onClose: () => void
  currencies: Currency[]
  onSelect: (currency: Currency) => void
  title: string
}