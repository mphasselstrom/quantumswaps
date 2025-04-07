'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Currency, SwapWidgetProps, CurrencySelectorProps, ApiCurrencyPair, ApiPairsResponse, SwapQuoteRequest, SwapQuoteResponse, CurrencyInfo } from './interfaces'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'

// Dynamically import components to avoid SSR issues
const DynamicCurrencySelector = dynamic(() => Promise.resolve(CurrencySelector), { ssr: false })
const DynamicSwapWidget = dynamic(() => Promise.resolve(SwapWidget), { ssr: false })

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
    solana?: any;
  }
}

export default function TryPage() {
  // Set up Solana network and wallet
  const network = WalletAdapterNetwork.Mainnet
  // Use a more reliable RPC endpoint with the user's Helius API key
  const endpoint = useMemo(() => 'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d', [])
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SwapPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

function SwapPageContent() {
  const [fromModalOpen, setFromModalOpen] = useState(false)
  const [toModalOpen, setToModalOpen] = useState(false)
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null)
  const [toCurrency, setToCurrency] = useState<Currency | null>(null)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [availableToCurrencies, setAvailableToCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use Solana wallet adapter hooks
  const { wallet, connect, disconnect, connected, publicKey, select } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const isConnected = connected
  const userAccount = publicKey?.toString() || ''
  
  // Log wallet information for debugging
  useEffect(() => {
    console.log('Wallet adapter status:', {
      connected,
      wallet: wallet ? 'Available' : 'Not available',
      publicKey: publicKey?.toString() || 'None',
      windowSolana: window.solana ? 'Available' : 'Not available',
      isPhantom: window.solana?.isPhantom ? 'Yes' : 'No'
    });
  }, [connected, wallet, publicKey]);
  
  // Load currency data from API
  useEffect(() => {
    async function loadCurrencies() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all available currencies
        try {
          const currenciesResponse = await fetch('/api/currencies', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!currenciesResponse.ok) {
            throw new Error(`Currencies API request failed with status: ${currenciesResponse.status}`);
          }
          
          const currenciesData: CurrencyInfo[] = await currenciesResponse.json();
          
          // Log the response for debugging
          console.log('Currencies API response:', {
            count: currenciesData.length,
            sample: currenciesData.slice(0, 3)
          });
          
          // Transform API response to our Currency interface
          const fromCurrenciesMap = new Map<string, Currency>();
          
          // Process each currency - this API doesn't provide networks info
          // so we'll create a single entry for each currency
          currenciesData.forEach(currencyInfo => {
            if (currencyInfo.isEnabled) {
              // For now, assume a default network based on the currency code
              // In a real app, you'd likely get this from another API or have it configured
              let defaultNetwork = 'ethereum';
              
              // Special cases for common cryptocurrencies
              const code = currencyInfo.code.toLowerCase();
              if (code === 'sol') defaultNetwork = 'sol';
              else if (code === 'btc') defaultNetwork = 'bitcoin';
              else if (code === 'eth') defaultNetwork = 'ethereum';
              else if (code === 'matic') defaultNetwork = 'polygon';
              else if (code === 'avax') defaultNetwork = 'avalanche';
              
              // Ensure we have an imageUrl - use fallback if needed
              let imageUrl = currencyInfo.imageUrl || '';
              
              // Set fallback image URLs for common cryptocurrencies
              if (!imageUrl) {
                // Use the cryptocurrency-icons library for reliable icons
                if (code === 'sol') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png';
                else if (code === 'btc') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png'; 
                else if (code === 'eth') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/eth.png';
                else if (code === 'usdt') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdt.png';
                else if (code === 'usdc') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdc.png';
                else if (code === 'bnb') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/bnb.png';
                else if (code === 'xrp') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/xrp.png';
                else if (code === 'ada') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/ada.png';
                else if (code === 'avax') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/avax.png';
                else if (code === 'doge') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/doge.png';
                else if (code === 'dot') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/dot.png';
                else if (code === 'matic') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/matic.png';
                else if (code === 'link') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/link.png';
                else {
                  // Try to form a generic URL for other tokens
                  imageUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code}.png`;
                }
              }
              
              const currencyId = `${currencyInfo.code}-${defaultNetwork}`;
              fromCurrenciesMap.set(currencyId, {
                id: currencyId,
                name: currencyInfo.name,
                symbol: currencyInfo.code.toUpperCase(),
                network: defaultNetwork,
                imageUrl: imageUrl,
              });
            }
          });
          
          const availableFromCurrencies = Array.from(fromCurrenciesMap.values());
          setCurrencies(availableFromCurrencies);
          
          // Set SOL as the default FROM currency if available
          const solCurrency = availableFromCurrencies.find(c => 
            c.symbol.toLowerCase() === 'sol' && c.network === 'sol'
          );
          
          if (solCurrency) {
            setFromCurrency(solCurrency);
          } else if (availableFromCurrencies.length > 0) {
            // Fallback to first currency if SOL isn't available
            setFromCurrency(availableFromCurrencies[0]);
          }
          
          // If we have a from currency set, fetch available TO currencies
          if (fromCurrency) {
            await fetchToCurrencies(fromCurrency);
          } else if (solCurrency) {
            await fetchToCurrencies(solCurrency);
          } else if (availableFromCurrencies.length > 0) {
            await fetchToCurrencies(availableFromCurrencies[0]);
          }
          
        } catch (currenciesApiError) {
          console.error('Error fetching available currencies:', currenciesApiError);
          setError('Failed to load available currencies. Please try again later.');
          
          // Fallback to just SOL as FROM currency
          const solCurrency: Currency = {
            id: 'sol-sol',
            name: 'Solana',
            symbol: 'SOL',
            network: 'sol',
            imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
          };
          
          setCurrencies([solCurrency]);
          setFromCurrency(solCurrency);
          await fetchToCurrencies(solCurrency);
        }
        
      } catch (err) {
        console.error('Error loading currencies:', err);
        setError('Failed to load currencies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCurrencies();
  }, []);
  
  // Fetch available TO currencies based on selected FROM currency
  const fetchToCurrencies = async (selectedFromCurrency: Currency) => {
    try {
      // Fetch available TO currencies from the API
      const response = await fetch('/api/currency-pairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrencies: [selectedFromCurrency.symbol.toLowerCase()],
          fromNetworks: [selectedFromCurrency.network]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data: ApiPairsResponse = await response.json();
      
      // Log the raw API response (first 5 items)
      console.log('Currency pairs API response:', {
        pairsCount: data.pairs?.length || 0,
        sample: data.pairs?.slice(0, 5) || []
      });
      
      // Transform API response to our Currency interface
      if (data.pairs && Array.isArray(data.pairs)) {
        const toCurrenciesMap = new Map<string, Currency>();
        
        // Process each pair and extract unique to currencies
        data.pairs.forEach(pair => {
          // Add null checks to prevent errors
          if (!pair.toCurrency) {
            console.warn('Received invalid pair without toCurrency data:', pair);
            return; // Skip this pair
          }
          
          const currencyId = `${pair.toCurrency}-${pair.toNetwork}`;
          if (!toCurrenciesMap.has(currencyId)) {
            // Find if we have any info about this currency in our FROM currencies map
            // to reuse image URL if available
            const existingCurrency = Array.from(currencies).find(c => 
              c.symbol.toLowerCase() === pair.toCurrency.toLowerCase()
            );
            
            // Set default image URLs for common currencies if we don't have one
            let imageUrl = existingCurrency?.imageUrl || '';
            
            // Fallback images for common cryptocurrencies
            const code = pair.toCurrency.toLowerCase();
            if (!imageUrl) {
              // The cdn.jsdelivr.net URLs are a reliable source for cryptocurrency icons
              if (code === 'sol') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png';
              else if (code === 'btc') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png'; 
              else if (code === 'eth') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/eth.png';
              else if (code === 'usdt') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdt.png';
              else if (code === 'usdc') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdc.png';
              else if (code === 'bnb') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/bnb.png';
              else if (code === 'xrp') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/xrp.png';
              else if (code === 'ada') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/ada.png';
              else if (code === 'avax') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/avax.png';
              else if (code === 'doge') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/doge.png';
              else if (code === 'dot') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/dot.png';
              else if (code === 'link') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/link.png';
              else if (code === 'matic') imageUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/matic.png';
              else {
                // Try to form a generic URL for other tokens
                imageUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code}.png`;
              }
            }
            
            toCurrenciesMap.set(currencyId, {
              id: currencyId,
              name: pair.toCurrency.toUpperCase(),
              symbol: pair.toCurrency.toUpperCase(),
              network: pair.toNetwork,
              imageUrl: imageUrl,
            });
          }
        });
        
        const availableToCurrenciesList = Array.from(toCurrenciesMap.values());
        
        // Log the processed TO currencies (first 5 items)
        console.log('Processed TO currencies:', {
          count: availableToCurrenciesList.length,
          sample: availableToCurrenciesList.slice(0, 5)
        });
        
        setAvailableToCurrencies(availableToCurrenciesList);
        
        // Set default to currency if available
        if (availableToCurrenciesList.length > 0) {
          // Try to find ETH as default TO currency, otherwise use the first one
          const ethCurrency = availableToCurrenciesList.find(c => c.symbol.toLowerCase() === 'eth');
          if (ethCurrency) {
            setToCurrency(ethCurrency);
          } else {
            setToCurrency(availableToCurrenciesList[0]);
          }
        }
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (apiError) {
      console.error('Error fetching currency pairs from API:', apiError);
      setError('Failed to load currency pairs. Please try again later.');
    }
  };

  const connectWallet = async () => {
    try {
      // Check if Phantom is available
      if (window.solana && window.solana.isPhantom) {
        // Open wallet modal to let the user connect
        setVisible(true);
        
        return publicKey?.toString() || null;
      } else {
        alert("Please install Phantom wallet for the best experience.");
        window.open('https://phantom.app/', '_blank');
        return null;
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      alert("Failed to connect Phantom wallet. Please make sure your wallet is unlocked.");
    }
    return null;
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const handleSelectFromCurrency = (currency: Currency) => {
    setFromCurrency(currency);
    setFromModalOpen(false);
    
    // Reset toCurrency
    setToCurrency(null);
    
    // Fetch available TO currencies based on the new FROM currency
    fetchToCurrencies(currency);
  }
  
  const handleSelectToCurrency = (currency: Currency) => {
    setToCurrency(currency)
    setToModalOpen(false)
  }
  
  const swapCurrencies = () => {
    // We now support multiple FROM currencies, so implement proper swapping
    if (fromCurrency && toCurrency) {
      // Check if the current TO currency is in our FROM currencies list
      const canSwap = currencies.some(c => c.id === toCurrency.id);
      
      if (canSwap) {
        // Store current FROM currency to assign as new TO currency
        const oldFromCurrency = fromCurrency;
        
        // Set new FROM currency (was previously TO currency)
        setFromCurrency(toCurrency);
        
        // Fetch available TO currencies based on the new FROM currency
        // This will reset toCurrency temporarily
        fetchToCurrencies(toCurrency);
        
        // After fetching, check if the old FROM currency can be a TO currency
        // Note: This is a bit of a hack since we can't await the fetchToCurrencies results easily
        setTimeout(() => {
          if (availableToCurrencies.some(c => c.id === oldFromCurrency.id)) {
            setToCurrency(oldFromCurrency);
          }
        }, 500);
      } else {
        alert(`${toCurrency.symbol} on ${toCurrency.network} is not available as a source currency`);
      }
    }
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

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <div className="inline-flex items-center justify-center p-1 mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <span className="bg-slate-900 rounded-full px-3 py-1 text-xs font-semibold text-slate-200">BETA</span>
            </div>
            <h1 className="h1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-4 font-bold">Try Quantum</h1>
            <p className="text-lg text-slate-400">Swap between any chain at lightning speed and low cost</p>
          </div>

          {/* Wallet Connection Button */}
          <div className="max-w-lg mx-auto mb-6">
            {!isConnected ? (
              <button 
                onClick={() => setVisible(true)}
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition duration-150 ease-in-out flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      {`${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`}
                    </span>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-sm px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition duration-150 ease-in-out cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="max-w-lg mx-auto p-6 text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-24 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-24 bg-slate-700 rounded-lg mb-4"></div>
              </div>
              <p className="text-slate-400 mt-4">Loading currencies...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="max-w-lg mx-auto p-6 bg-red-900/20 border border-red-700 rounded-lg text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition duration-150 ease-in-out cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Swap Widget */}
          {!isLoading && !error && (
            <div className="max-w-lg mx-auto mt-6">
              <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-xl shadow-lg">
                {/* Widget Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-slate-200">Swap</h2>
                  <div className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded-full">
                    Powered by Quantum
                  </div>
                </div>

                <SwapWidget 
                  fromCurrency={fromCurrency}
                  toCurrency={toCurrency}
                  setFromModalOpen={setFromModalOpen}
                  setToModalOpen={setToModalOpen}
                  swapCurrencies={swapCurrencies}
                  isConnected={isConnected}
                  connectWallet={connectWallet}
                  userAccount={userAccount}
                  setWalletVisible={setVisible}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Currency Modals */}
      {fromModalOpen && (
        <CurrencySelector
          isOpen={fromModalOpen}
          onClose={() => setFromModalOpen(false)}
          currencies={currencies}
          onSelect={handleSelectFromCurrency}
          title="Select From Token"
        />
      )}

      {toModalOpen && (
        <CurrencySelector
          isOpen={toModalOpen}
          onClose={() => setToModalOpen(false)}
          currencies={availableToCurrencies}
          onSelect={handleSelectToCurrency}
          title="Select To Token"
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
  swapCurrencies,
  isConnected,
  connectWallet,
  userAccount,
  setWalletVisible
}: SwapWidgetProps) {
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minAmount, setMinAmount] = useState<string>('0.04')
  const [transactionInProgress, setTransactionInProgress] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null)
  const [quoteData, setQuoteData] = useState<SwapQuoteResponse | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [quoteSignature, setQuoteSignature] = useState<string | null>(null)
  const [transactionData, setTransactionData] = useState<any>(null)
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize recipient address with the user's address when connected
  useEffect(() => {
    if (isConnected && userAccount) {
      // Removed setting default recipient address
    }
  }, [isConnected, userAccount]);
  
  // Get minimum exchange amount (dummy implementation)
  async function getMinExchangeAmount() {
    try {
      setError(null);
      
      if (!fromCurrency || !toCurrency) {
        return;
      }
      
      // Set a fixed min amount for demo purposes
      const minAmountValue = '0.04';
      setMinAmount(minAmountValue);
      
      // Set a default value if the input is empty
      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setFromAmount(minAmountValue);
        fetchQuote(minAmountValue);
      }
      
    } catch (err) {
      console.error('Error getting min amount:', err);
      setError('Failed to get minimum amount. Please try again.');
    }
  }
  
  // Update min amount when currencies change
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      getMinExchangeAmount();
    }
  }, [fromCurrency, toCurrency]);
  
  // Fetch quote from the API
  const fetchQuote = async (amount: string) => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setToAmount('');
      return;
    }
    
    // If user is not connected, we need to show a message but still allow them to see a quote
    // Use a dummy wallet address if not connected
    const walletAddress = isConnected ? userAccount : 'DummyUserAddress123456789';
    
    try {
      setQuoteLoading(true);
      setQuoteError(null);
      
      const quoteRequest: SwapQuoteRequest = {
        fromCurrency: fromCurrency.symbol.toLowerCase(),
        fromNetwork: fromCurrency.network,
        toCurrency: toCurrency.symbol.toLowerCase(),
        toNetwork: toCurrency.network,
        fromAmount: amount,
        fromWalletAddress: walletAddress,
        flow: 'standard'
      };
      
      console.log('Sending quote request:', quoteRequest);
      
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Quote error:', errorData);
        
        // Format error message for display
        let errorMessage = 'Failed to get exchange rate';
        
        if (errorData.message && Array.isArray(errorData.message)) {
          // Join multiple error messages with a semicolon
          errorMessage = errorData.message.join('; ');
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
      
      const data: SwapQuoteResponse = await response.json();
      console.log('Quote response:', data);
      
      // Store the signature from the quote response
      if (data.signature) {
        setQuoteSignature(data.signature);
        console.log('Stored quote signature:', data.signature);
      } else {
        console.warn('No signature found in quote response');
        setQuoteSignature(null);
      }
      
      // If networkFee is not provided, estimate it as a percentage of the fromAmount
      if (!data.networkFee || data.networkFee === '0' || data.networkFee === '') {
        // Estimate fee as 0.1% of the amount for demo purposes
        const estimatedFee = (parseFloat(amount) * 0.001).toFixed(8);
        data.networkFee = estimatedFee;
      }
      
      setQuoteData(data);
      setToAmount(data.toAmount);
      
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      setQuoteError(err.message || 'Failed to get exchange rate. Please try again.');
      
      // Fallback to the dummy calculation
      calculateDummyEstimate(amount);
    } finally {
      setQuoteLoading(false);
    }
  };
  
  // Calculate estimated output amount (fallback dummy implementation)
  const calculateDummyEstimate = (amount: string) => {
    try {
      if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) === 0) {
        setToAmount('');
        return;
      }
      
      // Simple dummy calculation for UI demo
      const fromValue = parseFloat(amount);
      let calculatedAmount = 0;
      
      if (fromCurrency.symbol === 'SOL' && toCurrency.symbol === 'ETH') {
        calculatedAmount = fromValue * 0.0175; // Example rate: 1 SOL = 0.0175 ETH
      } else if (fromCurrency.symbol === 'SOL' && toCurrency.symbol === 'BTC') {
        calculatedAmount = fromValue * 0.000435; // Example rate
      } else {
        // Default conversion (1:10 for demo)
        calculatedAmount = fromValue * 0.1;
      }
      
      // Format the result (up to 8 decimal places)
      setToAmount(calculatedAmount.toFixed(8));
      
    } catch (err) {
      console.error('Error calculating estimate:', err);
      setToAmount('');
    }
  };
  
  // Calculate estimate when the from amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        fetchQuote(fromAmount);
      } else {
        setToAmount('');
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromCurrency, toCurrency, userAccount]);
  
  // Handle wallet connection for the swap
  const useConnectedWallet = () => {
    if (!isConnected) {
      if (fromCurrency && fromCurrency.network === 'sol') {
        return connectWallet();
      } else {
        // For non-Solana currencies, we'd need different wallet connection logic
        // For now, just show an alert that this is not implemented
        alert(`Connection for ${fromCurrency?.symbol} on ${fromCurrency?.network} is not implemented yet.`);
        return null;
      }
    }
    return Promise.resolve(userAccount);
  };
  
  // Handle input change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value);
  };
  
  // Add logging to initiateSwap function to see when isLoading is set to true
  const initiateSwap = async () => {
    console.log('initiateSwap - start', { isLoading });
    try {
      // All the validation checks remain the same
      if (!fromCurrency || !toCurrency) {
        setError('Please select currencies');
        return;
      }
      
      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setError('Please enter an amount');
        return;
      }
      
      if (parseFloat(fromAmount) < parseFloat(minAmount)) {
        setError(`Minimum amount is ${minAmount} ${fromCurrency.symbol}`);
        return;
      }
      
      // Validate recipient address
      if (!recipientAddress || recipientAddress.trim() === '') {
        setError(`Please enter a recipient ${toCurrency.symbol} wallet address`);
        return;
      }
      
      // We need a wallet address to send funds to
      const walletAddress = await useConnectedWallet();
      if (!walletAddress) {
        setError('Please connect your wallet to continue');
        return;
      }
      
      // Check if we have a valid quote
      if (!quoteData) {
        setError('No valid quote available. Please try again.');
        return;
      }
      
      // Check if we have a signature from the quote
      if (!quoteSignature) {
        setError('No signature available. Please fetch a new quote.');
        return;
      }
      
      setError(null);
      console.log('Setting isLoading=true in initiateSwap');
      setIsLoading(true);
      
      // Execute the swap transaction
      try {
        const executeRequest = {
          signature: quoteSignature, // Use the signature from the quote
          toWalletAddress: recipientAddress, // Use the recipient address from the input field
          refundWalletAddress: walletAddress, // User's connected wallet address for refunds
        };
        
        console.log('Sending execute request:', executeRequest);
        
        // Use our API route that proxies to the external API
        const response = await fetch('/api/swap/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(executeRequest),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Execute error:', errorData);
          
          // Format error message for display
          let errorMessage = 'Failed to execute swap';
          
          if (errorData.message && Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join('; ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
          
          throw new Error(errorMessage);
        }
        
        const executeData = await response.json();
        console.log('Execute API response:', executeData);
        
        // Store all the execute data
        setTransactionData(executeData);
        
        // Set transaction details from the response
        setTransactionId(executeData.id);
        setTransactionStatus('created');
        setTransactionInProgress(true);
        
        // Critical fix: Set isLoading to false AFTER transaction data is set
        console.log('Setting isLoading=false in initiateSwap after success');
        setIsLoading(false);
        
      } catch (executeErr) {
        console.error('Error executing swap:', executeErr);
        setError(executeErr instanceof Error ? executeErr.message : 'Failed to execute swap. Please try again.');
        console.log('Setting isLoading=false in initiateSwap after error');
        setIsLoading(false);
        return;
      }
      
    } catch (err) {
      console.error('Error initiating swap:', err);
      setError('Failed to create transaction. Please try again.');
      setTransactionInProgress(false);
      console.log('Setting isLoading=false in initiateSwap after outer error');
      setIsLoading(false);
    }
  };
  
  // Send a Solana transaction from the connected wallet
  const sendTransactionFromPhantom = async () => {
    console.log('sendTransactionFromPhantom called');
    console.log('Current state:', {
      isLoading,
      transactionStatus,
      transactionData: !!transactionData,
      transactionId: transactionData?.id,
      depositAddress: transactionData?.depositAddress
    });
    
    try {
      if (!window.solana || !window.solana.isPhantom) {
        console.log('Phantom not detected');
        throw new Error('Phantom wallet not detected');
      }
      
      if (!transactionData) {
        console.log('No transaction data available');
        throw new Error('No transaction data available');
      }
      
      console.log('Setting status to waiting_for_confirmation and isLoading=true');
      setTransactionStatus('waiting_for_confirmation');
      setIsLoading(true);
      setError(null);
      
      // Use Helius endpoint with the API key that's already set up elsewhere in the app
      const heliusRpcEndpoint = 'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d';
      console.log('Using Helius RPC endpoint');
      const connection = new Connection(heliusRpcEndpoint, 'confirmed');
      
      // Parse the deposit address as a PublicKey
      const depositPubkey = new PublicKey(transactionData.depositAddress);
      const fromPubkey = new PublicKey(userAccount);
      
      // Create a simple SOL transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: depositPubkey,
          lamports: LAMPORTS_PER_SOL * parseFloat(transactionData.fromAmount), // Convert SOL to lamports
        })
      );
      
      // Set a recent blockhash
      try {
        console.log('Fetching recent blockhash from Helius...');
        const { blockhash } = await connection.getRecentBlockhash();
        console.log('Got blockhash from Helius:', blockhash);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;
      } catch (blockHashError) {
        console.error('Error getting recent blockhash from Helius:', blockHashError);
        
        // Fallback to using Phantom's getRecentBlockhash if connection fails
        console.log('Attempting to use Phantom to get recent blockhash...');
        try {
          // Phantom wallet can provide a recent blockhash directly
          const { blockhash } = await window.solana.request({
            method: 'getRecentBlockhash',
          });
          console.log('Got blockhash from Phantom:', blockhash);
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = fromPubkey;
        } catch (phantomBlockhashError) {
          console.error('Phantom blockhash error:', phantomBlockhashError);
          throw new Error('Failed to get recent blockhash from any source');
        }
      }
      
      console.log('Sending SOL transaction:', {
        from: fromPubkey.toString(),
        to: depositPubkey.toString(),
        amount: transactionData.fromAmount,
        lamports: LAMPORTS_PER_SOL * parseFloat(transactionData.fromAmount)
      });
      
      try {
        // Sign the transaction using Phantom
        console.log('Requesting transaction signature from Phantom...');
        const signedTransaction = await window.solana.signTransaction(transaction);
        
        console.log('Transaction signed successfully');
        
        // Set status to processing
        setTransactionStatus('processing');
        
        // Send the signed transaction to the Solana network through Helius
        console.log('Sending raw transaction to Solana network via Helius...');
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        console.log('Transaction sent with signature:', signature);
        
        // Update UI with transaction signature
        setTransactionSignature(signature);
        
        // Poll for confirmation using Helius connection
        console.log('Setting up confirmation polling with Helius...');
        const confirmInterval = setInterval(async () => {
          try {
            const confirmation = await connection.confirmTransaction(signature);
            if (confirmation) {
              clearInterval(confirmInterval);
              console.log('Transaction confirmed via Helius:', confirmation);
              setTransactionStatus('success');
              console.log('Setting isLoading=false in confirmation callback');
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Error checking confirmation via Helius:', err);
          }
        }, 2000);
        
        // Set a timeout in case confirmation takes too long
        setTimeout(() => {
          clearInterval(confirmInterval);
          console.log('Confirmation timeout - transaction may still be processing');
          setTransactionStatus('pending');
          console.log('Setting isLoading=false in confirmation timeout');
          setIsLoading(false);
        }, 60000); // 60 second timeout
        
      } catch (signError) {
        console.error('Error signing transaction:', signError);
        setError('User rejected transaction or signing failed');
        setTransactionStatus('failed');
        console.log('Setting isLoading=false in sign error');
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError('Failed to send transaction: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setTransactionStatus('failed');
      console.log('Setting isLoading=false in send error');
      setIsLoading(false);
    }
  };
  
  // Force isLoading to false when component renders - TEMPORARY FIX
  useEffect(() => {
    if (isLoading) {
      console.log('FORCING isLoading to false via useEffect');
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [isLoading]);

  // Also add this debugging display to the UI to see current state
  const debugInfo = {
    isLoading,
    transactionStatus,
    hasTransactionData: !!transactionData,
    buttonDisabled: isLoading || transactionStatus === 'processing' || transactionStatus === 'success',
  };
  
  console.log('Render state:', debugInfo);

  return (
    <>
      {/* Debug panel removed */}
    
      {transactionData && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex flex-col space-y-2">
              {/* Basic transaction info */}
              <div className="flex justify-between">
                <span className="text-slate-400">Send:</span>
                <span className="text-slate-300">{fromAmount} {fromCurrency?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receive:</span>
                <span className="text-slate-300">{toAmount} {toCurrency?.symbol}</span>
              </div>
              
              {/* Transaction and deposit information */}
              <div className="mt-4 mb-2">
                <span className="text-slate-400 block mb-1">Transaction ID:</span>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
                  {transactionData.id}
                </div>
              </div>
              
              <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700 mt-2">
                <h3 className="text-indigo-300 font-medium mb-2">Send Payment Instructions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Send Exactly:</span>
                    <span className="text-slate-300 font-medium">{transactionData.fromAmount} {transactionData.fromCurrency.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Deposit Address:</span>
                    <div className="bg-slate-800 p-2 rounded break-all font-mono text-xs text-slate-300">
                      {transactionData.depositAddress}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Always show Phantom send button when transaction data exists */}
              <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 p-[3px] rounded-lg shadow-lg">
                <button
                  onClick={sendTransactionFromPhantom}
                  className="w-full bg-slate-800 text-white py-3 px-6 rounded-md hover:bg-slate-700 transition duration-150 ease-in-out flex items-center justify-center cursor-pointer"
                  disabled={transactionStatus === 'processing' || transactionStatus === 'success'}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="font-medium">
                      Send with Phantom
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error display only - "New Exchange" button removed */}
          {(error || quoteError) && (
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-3 text-red-400 text-sm">
                {error || quoteError}
              </div>
            </div>
          )}
        </div>
      )}

      {!transactionData && !transactionStatus && (
        <>
          {/* Rate Type Indicator - removed completely */}

          {/* From Section */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">From</label>
              {minAmount && fromCurrency && (
                <span className="text-sm text-slate-500">Min: {minAmount} {fromCurrency.symbol}</span>
              )}
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-3 rounded-full cursor-pointer"
                    onClick={() => setFromModalOpen(true)}
                  >
                    {fromCurrency ? (
                      <>
                        {fromCurrency.imageUrl ? (
                          <img 
                            src={fromCurrency.imageUrl} 
                            alt={fromCurrency.symbol}
                            className="w-5 h-5 mr-2 rounded-full"
                            onError={(e) => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src = 'https://placehold.co/20x20/6b21a8/ffffff?text=' + fromCurrency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 mr-2 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {fromCurrency.symbol.charAt(0)}
                          </div>
                        )}
                        <span className="text-slate-300">{fromCurrency.symbol}</span>
                      </>
                    ) : (
                      <span className="mr-1 text-slate-300">Select</span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 ml-1">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                </div>
                <input
                  ref={fromInputRef}
                  type="text"
                  className="w-1/2 text-right bg-transparent text-xl text-slate-200 focus:outline-none border-none"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                />
              </div>
            </div>
          </div>

          {/* Swap button container - positioned relatively to center between boxes */}
          <div className="relative h-8 z-10">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 -mb-3">
              <button 
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-2 shadow-lg hover:shadow-xl transition duration-150 ease-in-out cursor-pointer"
                onClick={swapCurrencies}
                aria-label="Swap direction"
                title="Swap currencies when possible"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* To Section */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">To</label>
              <span className="text-sm text-slate-500">
                {isLoading ? 'Calculating...' : ''}
              </span>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-3 rounded-full cursor-pointer"
                    onClick={() => setToModalOpen(true)}
                  >
                    {toCurrency ? (
                      <>
                        {toCurrency.imageUrl ? (
                          <img 
                            src={toCurrency.imageUrl} 
                            alt={toCurrency.symbol}
                            className="w-5 h-5 mr-2 rounded-full"
                            onError={(e) => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src = 'https://placehold.co/20x20/6b21a8/ffffff?text=' + toCurrency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 mr-2 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {toCurrency.symbol.charAt(0)}
                          </div>
                        )}
                        <span className="text-slate-300">{toCurrency.symbol}</span>
                      </>
                    ) : (
                      <span className="mr-1 text-slate-300">Select</span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 ml-1">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                </div>
                <input
                  ref={toInputRef}
                  type="text"
                  className="w-1/2 text-right bg-transparent text-xl text-slate-200 focus:outline-none border-none"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Recipient Address Field */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">
                {toCurrency ? `${toCurrency.symbol} Recipient Address (${toCurrency.network})` : 'Recipient Address'}
              </label>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <input
                type="text"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none border-none font-mono"
                placeholder={toCurrency ? `Enter ${toCurrency.symbol} (${toCurrency.network}) wallet address` : 'Enter destination wallet address'}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Rate Display */}
          {fromCurrency && toCurrency && fromAmount && toAmount && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">
                  Rate
                </span>
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {fromCurrency.imageUrl ? (
                      <img 
                        src={fromCurrency.imageUrl} 
                        alt={fromCurrency.symbol}
                        className="w-4 h-4 mr-1" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/16x16/6b21a8/ffffff?text=' + fromCurrency.symbol.charAt(0);
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                        {fromCurrency.symbol.charAt(0)}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm">1 {fromCurrency.symbol}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 mx-1">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  <div className="flex items-center ml-1">
                    {toCurrency.imageUrl ? (
                      <img 
                        src={toCurrency.imageUrl} 
                        alt={toCurrency.symbol}
                        className="w-4 h-4 mr-1" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/16x16/6b21a8/ffffff?text=' + toCurrency.symbol.charAt(0);
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                        {toCurrency.symbol.charAt(0)}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm">{(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toCurrency.symbol}</span>
                  </div>
                </div>
              </div>
              {quoteData && (
                <>
                  <div className="flex justify-between items-center text-sm mt-2 pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Network Fee</span>
                    <span className="text-slate-300">{quoteData.networkFee} {fromCurrency.symbol}</span>
                  </div>
                  {quoteData.expiry && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-slate-400">Quote expires in</span>
                      <span className="text-slate-300">
                        {Math.max(0, Math.floor((quoteData.expiry - Date.now()/1000) / 60))} minutes
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {(error || quoteError) && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error || quoteError}
            </div>
          )}

          {/* Swap Button */}
          <button 
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out flex items-center justify-center cursor-pointer"
            disabled={isLoading || quoteLoading || !fromCurrency || !toCurrency || !fromAmount || parseFloat(fromAmount) === 0}
            onClick={!isConnected ? () => setWalletVisible(true) : initiateSwap}
          >
            {isLoading || quoteLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLoading ? 'Processing...' : 'Getting Quote...'}
              </span>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : (
              "Swap"
            )}
          </button>
        </>
      )}
    </>
  )
}

// CurrencySelector Modal Component
function CurrencySelector({ isOpen, onClose, currencies, onSelect, title }: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    
    // Add event listener for Escape key
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      setSearchQuery('');
    };
  }, [isOpen, onClose]);
  
  // Handle click outside modal
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  const handleModalClick = (e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const filteredCurrencies = currencies.filter(currency => 
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.network.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group currencies by symbol for better organization
  const groupedCurrencies = filteredCurrencies.reduce((acc, currency) => {
    const key = currency.symbol;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(currency);
    return acc;
  }, {} as Record<string, Currency[]>);
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-32 overflow-y-auto"
      onClick={handleModalClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] shadow-xl overflow-hidden"
      >
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
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, symbol or network"
            className="w-full bg-slate-900 rounded-lg border border-slate-700 px-4 py-2 mb-4 text-slate-200 focus:outline-none focus:border-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-[50vh] overflow-y-auto pb-2">
            {Object.entries(groupedCurrencies).map(([symbol, currenciesForSymbol]) => (
              <div key={symbol} className="mb-4">
                <div className="flex items-center px-1 mb-2">
                  <div className="text-sm text-purple-400 font-medium">{symbol}</div>
                  <div className="ml-2 text-xs text-slate-500">({currenciesForSymbol.length} {currenciesForSymbol.length === 1 ? 'network' : 'networks'})</div>
                  <div className="ml-auto flex-grow border-t border-slate-700 mx-3"></div>
                </div>
                {currenciesForSymbol.map((currency) => (
                  <button
                    key={currency.id}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg mb-2 flex items-center transition duration-150 ease-in-out cursor-pointer"
                    onClick={() => onSelect(currency)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {currency.imageUrl ? (
                          <img 
                            src={currency.imageUrl} 
                            alt={currency.symbol}
                            className="w-6 h-6 mr-3 rounded-full"
                            onError={(e) => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src = 'https://placehold.co/24x24/6b21a8/ffffff?text=' + currency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 mr-3 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {currency.symbol.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-slate-200 font-medium">{currency.name}</div>
                          <div className="text-slate-400 text-sm">{currency.symbol}</div>
                        </div>
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded-full text-xs text-slate-300">
                        {currency.network}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            
            {filteredCurrencies.length === 0 && (
              <div className="text-center text-slate-400 py-6">
                No currencies found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}