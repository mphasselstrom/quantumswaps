'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Currency, SwapWidgetProps, CurrencySelectorProps, ApiCurrencyPair, ApiPairsResponse, SwapQuoteRequest, SwapQuoteResponse } from './interfaces'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
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
        
        // First set up Solana as the only FROM currency
        const solCurrency: Currency = {
          id: 'sol',
          name: 'Solana',
          symbol: 'SOL',
          network: 'sol',
        };
        
        // Set SOL as the only from currency
        setCurrencies([solCurrency]);
        setFromCurrency(solCurrency);
        
        // Fetch available TO currencies from the API
        try {
          const response = await fetch('/api/currency-pairs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromCurrencies: ['sol'],
              fromNetworks: ['sol']
            }),
          });
          
          if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
          }
          
          const data: ApiPairsResponse = await response.json();
          
          // Transform API response to our Currency interface
          if (data.pairs && Array.isArray(data.pairs)) {
            const toCurrenciesMap = new Map<string, Currency>();
            
            // Process each pair and extract unique to currencies
            data.pairs.forEach(pair => {
              const currencyId = `${pair.toCurrency.currency}-${pair.toCurrency.network}`;
              if (!toCurrenciesMap.has(currencyId)) {
                toCurrenciesMap.set(currencyId, {
                  id: currencyId,
                  name: pair.toCurrency.currency.toUpperCase(),
                  symbol: pair.toCurrency.currency.toUpperCase(),
                  network: pair.toCurrency.network,
                });
              }
            });
            
            const availableToCurrenciesList = Array.from(toCurrenciesMap.values());
            setAvailableToCurrencies(availableToCurrenciesList);
            
            // Set default to currency if available
            if (availableToCurrenciesList.length > 0) {
              // Try to find BTC as default TO currency, otherwise use the first one
              const btcCurrency = availableToCurrenciesList.find(c => c.symbol.toLowerCase() === 'btc');
              if (btcCurrency) {
                setToCurrency(btcCurrency);
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
        
      } catch (err) {
        console.error('Error loading currencies:', err);
        setError('Failed to load currencies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCurrencies();
  }, []);

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
    setFromCurrency(currency)
    setFromModalOpen(false)
    // Reset toCurrency if it's the same as the new fromCurrency
    if (toCurrency && toCurrency.id === currency.id) {
      setToCurrency(null);
    }
  }
  
  const handleSelectToCurrency = (currency: Currency) => {
    setToCurrency(currency)
    setToModalOpen(false)
  }
  
  const swapCurrencies = () => {
    // Since we only support SOL as the FROM currency,
    // we'll just log a message rather than actually swapping
    console.log('Cannot swap currencies: SOL is the only supported FROM currency');
    
    // Show an alert to the user
    alert('Currently Quantum only supports SOL as the source currency');
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
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition duration-150 ease-in-out flex items-center justify-center space-x-2"
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
                    className="text-sm px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition duration-150 ease-in-out"
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
                className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition duration-150 ease-in-out"
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
  const [rateType, setRateType] = useState<'standard' | 'fixed-rate'>('standard')
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  
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
        flow: rateType, // Use the selected rate type
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
      return connectWallet();
    }
    return Promise.resolve(userAccount);
  };
  
  // Handle input change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value);
  };
  
  // Handle toggle change
  const handleRateTypeChange = (newType: 'standard' | 'fixed-rate') => {
    setRateType(newType);
    // Re-fetch quote with new rate type if we have the necessary data
    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote(fromAmount);
    }
  };
  
  // Initiate the swap (using the quote data)
  const initiateSwap = async () => {
    try {
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
      
      setError(null);
      setIsLoading(true);
      setTransactionInProgress(true);
      
      // This would normally create a transaction with the exchange service
      // For demo purposes, we'll simulate a transaction
      
      // For Solana transactions from connected wallet
      if (fromCurrency.symbol === 'SOL' && isConnected) {
        await sendTransactionFromWallet();
      } else {
        // For other currencies or not connected to wallet
        // simulate a successful transaction
        setTimeout(() => {
          const mockTransactionId = 'demo-' + Math.random().toString(36).substring(2, 15);
          setTransactionId(mockTransactionId);
          setTransactionStatus('created');
          
          // After a delay, update status to simulate progress
          setTimeout(() => {
            setTransactionStatus('confirming');
            
            // After another delay, update to complete
            setTimeout(() => {
              setTransactionStatus('success');
              setIsLoading(false);
            }, 3000);
          }, 2000);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error initiating swap:', err);
      setError('Failed to create transaction. Please try again.');
      setTransactionInProgress(false);
      setIsLoading(false);
    }
  };
  
  // Send a Solana transaction from the connected wallet
  const sendTransactionFromWallet = async () => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not detected');
      }
      
      setTransactionStatus('creating');
      
      // Create a transaction ID for reference
      const mockTransactionId = 'phantom-' + Math.random().toString(36).substring(2, 15);
      setTransactionId(mockTransactionId);
      
      // This is a placeholder for a real Solana transaction
      // In a real app, you would construct a proper transaction
      // For demo purposes, we'll just simulate the process
      
      setTransactionStatus('waiting_for_confirmation');
      
      // Wait a bit to simulate user confirming in wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus('processing');
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the transaction
      setTransactionStatus('success');
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError('Failed to send transaction. Please try again.');
      setTransactionStatus('failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      {transactionStatus === 'created' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Send:</span>
                <span className="text-slate-300">{fromAmount} {fromCurrency?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receive:</span>
                <span className="text-slate-300">{toAmount} {toCurrency?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rate Type:</span>
                <span className="text-slate-300">{rateType === 'standard' ? 'Floating' : 'Fixed'}</span>
              </div>
              {quoteData && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Network Fee:</span>
                  <span className="text-slate-300">{quoteData.networkFee} {fromCurrency?.symbol}</span>
                </div>
              )}
              <div className="mt-4">
                <span className="text-slate-400 block mb-1">Address:</span>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
                  {transactionId}
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction hash display */}
          {transactionId && (
            <div className="bg-slate-900 rounded-lg p-4 border border-green-700">
              <div className="flex items-center space-x-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-medium">Transaction Sent</span>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {(error || quoteError) && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-3 text-red-400 text-sm">
              {error || quoteError}
            </div>
          )}
          
          {/* Transaction buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            {!transactionId && (
              <button 
                onClick={initiateSwap}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out flex items-center justify-center"
                disabled={isLoading || quoteLoading}
              >
                {isLoading || quoteLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLoading ? 'Processing...' : 'Getting Quote...'}
                  </span>
                ) : (
                  <span>Create Transaction</span>
                )}
              </button>
            )}
            
            <button 
              onClick={() => setTransactionStatus(null)}
              className="w-full bg-slate-700 text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-600 transition duration-150 ease-in-out"
            >
              {transactionId ? 'New Exchange' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {!transactionStatus && (
        <>
          {/* Rate Type Toggle */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">Rate Type</label>
              <div className="text-sm text-slate-500">
                {quoteLoading && 'Updating...'}
              </div>
            </div>
            <div className="flex p-1 bg-slate-900 rounded-lg">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-center transition-colors duration-200 text-sm font-medium ${
                  rateType === 'standard'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                onClick={() => handleRateTypeChange('standard')}
                disabled={quoteLoading}
                title="Floating rate: The exchange rate may change slightly between quote and execution. Usually offers better rates but with small market risk."
              >
                Floating
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-center transition-colors duration-200 text-sm font-medium ${
                  rateType === 'fixed-rate'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                onClick={() => handleRateTypeChange('fixed-rate')}
                disabled={quoteLoading}
                title="Fixed rate: The exchange rate is guaranteed not to change between quote and execution. May have slightly higher fees but eliminates market risk."
              >
                Fixed
              </button>
            </div>
          </div>

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
                    className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-2 rounded-full cursor-pointer"
                    onClick={() => setFromModalOpen(true)}
                  >
                    {fromCurrency ? (
                      <>
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
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-2 shadow-lg hover:shadow-xl transition duration-150 ease-in-out cursor-not-allowed opacity-50"
                onClick={swapCurrencies}
                disabled={true}
                aria-label="Swap direction"
                title="Only SOL is supported as the source currency"
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
                    className="flex items-center bg-slate-800 hover:bg-slate-700 transition duration-150 ease-in-out py-1 px-2 rounded-full cursor-pointer"
                    onClick={() => setToModalOpen(true)}
                  >
                    {toCurrency ? (
                      <>
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

          {/* Rate Display */}
          {fromCurrency && toCurrency && fromAmount && toAmount && (
            <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">
                  Rate ({rateType === 'standard' ? 'Floating' : 'Fixed'})
                </span>
                <span className="text-slate-300">
                  1 {fromCurrency.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toCurrency.symbol}
                </span>
              </div>
              {quoteData && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-400">Network Fee</span>
                  <span className="text-slate-300">{quoteData.networkFee} {fromCurrency.symbol}</span>
                </div>
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
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out flex items-center justify-center"
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
    currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
            placeholder="Search by name or symbol"
            className="form-input w-full bg-slate-900 mb-4 sticky top-[65px] z-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-[50vh] overflow-y-auto pb-2">
            {filteredCurrencies.map((currency) => (
              <button
                key={currency.id}
                className="w-full text-left p-3 hover:bg-slate-700 rounded-lg mb-2 flex items-center transition duration-150 ease-in-out cursor-pointer"
                onClick={() => onSelect(currency)}
              >
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