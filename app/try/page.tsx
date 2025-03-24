'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ChangeHeroCurrency, ChangeHeroResponse } from '../types/changeHero'
import * as changeHeroService from '../services/changeHeroService'
import { Currency, SwapWidgetProps, CurrencySelectorProps } from './interfaces'
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
  
  // Fetch currencies on component mount
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await changeHeroService.getCurrencies();
        
        if (response.error) {
          setError(response.error.message || 'Failed to fetch currencies');
          return;
        }
        
        // Map ChangeHero currencies to our format
        const mappedCurrencies = response.result
          .filter((currency: ChangeHeroCurrency) => currency.enabled)
          .map((currency: ChangeHeroCurrency) => ({
            id: currency.name,
            name: currency.fullName,
            symbol: currency.name.toUpperCase(),
            icon: currency.image || `/images/currencies/${currency.name}.svg`,
            network: currency.blockchain || 'Unknown',
            extraIdName: currency.extraIdName,
            contractAddress: currency.contractAddress
          }));
        
        setCurrencies(mappedCurrencies);
        
        // Find SOL and ETH currencies
        const solCurrency = mappedCurrencies.find(c => c.symbol.toLowerCase() === 'sol');
        const ethCurrency = mappedCurrencies.find(c => c.symbol.toLowerCase() === 'eth');
        
        // Set default from currency to SOL if available
        if (solCurrency) {
          setFromCurrency(solCurrency);
        }
        
        // Set default to currency to ETH if available and not the same as from currency
        if (ethCurrency && (!solCurrency || ethCurrency.id !== solCurrency.id)) {
          setToCurrency(ethCurrency);
        }
        
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError('Failed to load currencies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCurrencies();
  }, []);
  
  // Update available "to" currencies when "from" currency changes
  useEffect(() => {
    if (fromCurrency) {
      // In a real implementation, we would fetch the valid pairs here
      // For now, we'll just filter out the currently selected "from" currency
      const availableToList = currencies.filter((c: any) => c.id !== fromCurrency.id);
      setAvailableToCurrencies(availableToList);
      
      // If toCurrency is null or the same as fromCurrency, try to set ETH as default
      if (!toCurrency || toCurrency.id === fromCurrency.id) {
        const ethCurrency = availableToList.find(c => c.symbol.toLowerCase() === 'eth');
        if (ethCurrency) {
          setToCurrency(ethCurrency);
        } else if (availableToList.length > 0) {
          // If ETH is not available, set the first available currency
          setToCurrency(availableToList[0]);
        }
      }
    } else {
      setAvailableToCurrencies([]);
    }
  }, [fromCurrency, currencies, toCurrency]);

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
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [needsExtraId, setNeedsExtraId] = useState(false);
  const [extraId, setExtraId] = useState('');
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Get Solana wallet and connection
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  // Get minimum exchange amount when currencies change
  useEffect(() => {
    async function getMinExchangeAmount() {
      if (!fromCurrency || !toCurrency) return;
      
      try {
        const response = await changeHeroService.getMinAmount(
          fromCurrency.id,
          toCurrency.id
        );
        
        if (response.error) {
          console.error('Min amount error:', response.error);
          setErrorMessage(`Error: ${response.error.message}`);
          return;
        }
        
        setMinAmount(response.result);
        // Clear any previous error
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching minimum amount:', error);
        setErrorMessage('Failed to get minimum exchange amount');
      }
    }
    
    getMinExchangeAmount();
  }, [fromCurrency, toCurrency]);
  
  // Check if the selected currency needs an extra ID
  useEffect(() => {
    if (toCurrency && toCurrency.extraIdName) {
      setNeedsExtraId(true);
    } else {
      setNeedsExtraId(false);
      setExtraId('');
    }
  }, [toCurrency]);

  const calculateEstimate = async () => {
    if (!fromCurrency || !toCurrency || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setExchangeRate('');
      return;
    }

    // Check if amount is less than minimum
    if (minAmount && parseFloat(fromAmount) < parseFloat(minAmount)) {
      setErrorMessage(`Minimum amount is ${minAmount} ${fromCurrency.symbol}`);
      setToAmount('');
      setExchangeRate('');
      return;
    }

    try {
      setIsCalculating(true);
      setErrorMessage('');
      
      const response = await changeHeroService.getExchangeAmount(
        fromCurrency.id,
        toCurrency.id,
        fromAmount
      );
      
      if (response.error) {
        console.error('Exchange amount error:', response.error);
        setErrorMessage(`Error: ${response.error.message}`);
        return;
      }
      
      const estimatedAmount = response.result;
      setToAmount(estimatedAmount);
      
      // Calculate the exchange rate
      const rate = parseFloat(estimatedAmount) / parseFloat(fromAmount);
      setExchangeRate(`1 ${fromCurrency.symbol} ≈ ${rate.toFixed(6)} ${toCurrency.symbol}`);
      
    } catch (error) {
      console.error('Error calculating estimate:', error);
      setErrorMessage('Failed to calculate exchange estimate');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (fromCurrency && toCurrency && fromAmount && parseFloat(fromAmount) > 0) {
      calculateEstimate();
    }
  }, [fromCurrency, toCurrency, fromAmount]);

  const useConnectedWallet = () => {
    if (userAccount) {
      setRecipientAddress(userAccount);
    } else {
      alert("Please connect your wallet first.");
    }
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value);
  };

  const initiateSwap = async () => {
    if (!isConnected) {
      setWalletVisible(true);
      return;
    }

    if (!fromCurrency || !toCurrency) {
      setErrorMessage('Please select tokens');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    if (!recipientAddress) {
      setErrorMessage('Please enter a recipient address');
      return;
    }
    
    if (needsExtraId && !extraId) {
      setErrorMessage(`Please enter a ${toCurrency.extraIdName || 'destination tag'}`);
      return;
    }
    
    // Check if amount is less than minimum
    if (minAmount && parseFloat(fromAmount) < parseFloat(minAmount)) {
      setErrorMessage(`Minimum amount is ${minAmount} ${fromCurrency.symbol}`);
      return;
    }

    try {
      setIsCreatingTransaction(true);
      setErrorMessage('');
      
      const response = await changeHeroService.createTransaction(
        fromCurrency.id,
        toCurrency.id,
        recipientAddress,
        fromAmount,
        needsExtraId ? extraId : undefined
      );
      
      if (response.error) {
        console.error('Transaction creation error:', response.error);
        setErrorMessage(`Error: ${response.error.message}`);
        return;
      }
      
      setTransactionDetails(response.result);
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      setErrorMessage('Failed to create exchange transaction');
    } finally {
      setIsCreatingTransaction(false);
    }
  };
  
  // Reset the transaction when currencies or amounts change
  useEffect(() => {
    if (transactionDetails) {
      setTransactionDetails(null);
    }
  }, [fromCurrency, toCurrency, fromAmount, toAmount]);

  // Function to send transaction using browser wallet
  const sendTransactionFromWallet = async () => {
    if (!transactionDetails || !fromCurrency) {
      setErrorMessage('Transaction details not available');
      return;
    }

    try {
      setIsSendingTransaction(true);
      setErrorMessage('');
      
      // Check if wallet is available and connected
      if (!wallet || !publicKey) {
        setErrorMessage('Wallet not connected. Please connect your wallet first.');
        return;
      }
      
      try {
        // Check if we're dealing with Solana
        if (fromCurrency.network.toLowerCase().includes('solana')) {
          // Create a Solana transaction
          const transaction = new Transaction();
          
          // Add the transfer instruction
          const transferInstruction = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(transactionDetails.payinAddress),
            lamports: parseFloat(transactionDetails.amountExpectedFrom) * LAMPORTS_PER_SOL
          });
          
          transaction.add(transferInstruction);
          
          try {
            // Get the latest blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;
            
            // Try to send using the wallet adapter first
            console.log('Sending transaction...');
            let signature;
            
            // Try with direct Phantom connection if available (this will prompt for approval)
            if (window.solana && window.solana.isPhantom) {
              console.log('Using direct Phantom connection');
              // Sign and send transaction using Phantom
              signature = await window.solana.signAndSendTransaction(transaction);
            } 
            // Fall back to wallet adapter
            else {
              console.log('Using wallet adapter');
              signature = await wallet.adapter.sendTransaction(transaction, connection);
            }
            
            console.log('Transaction sent with signature:', signature);
            setTransactionHash(signature);
            setErrorMessage(''); // Clear any previous errors
          } catch (blockhashError: any) {
            console.error('Error getting blockhash or sending transaction:', blockhashError);
            setErrorMessage(`Transaction error: ${blockhashError.message || 'Failed to send transaction'}`);
          }
        }
        // If not Solana, we need a different approach (for future implementations)
        else {
          setErrorMessage('Only Solana transactions are currently supported through this interface.');
        }
      } catch (walletError: any) {
        console.error('Wallet error:', walletError);
        setErrorMessage(`Wallet error: ${walletError.message || 'Could not send transaction'}`);
      }
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      setErrorMessage(`Failed to send transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSendingTransaction(false);
    }
  };

  return (
    <>
      {transactionDetails ? (
        // Transaction created successfully - show transaction details
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Send:</span>
                <span className="text-slate-300">{transactionDetails.amountExpectedFrom} {fromCurrency?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receive:</span>
                <span className="text-slate-300">{transactionDetails.amountExpectedTo} {toCurrency?.symbol}</span>
              </div>
              <div className="mt-4">
                <span className="text-slate-400 block mb-1">Address:</span>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
                  {transactionDetails.payinAddress}
                </div>
                
                {transactionDetails.payinExtraId && (
                  <>
                    <span className="text-slate-400 block mb-1 mt-3">{toCurrency?.extraIdName || 'Extra ID'}:</span>
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
                      {transactionDetails.payinExtraId}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Transaction hash display */}
          {transactionHash && (
            <div className="bg-slate-900 rounded-lg p-4 border border-green-700">
              <div className="flex items-center space-x-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-medium">Transaction Sent</span>
              </div>
              
              {fromCurrency && fromCurrency.network.toLowerCase().includes('solana') && (
                <a 
                  href={`https://solscan.io/tx/${transactionHash}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm">View on Solscan</span>
                </a>
              )}
              
              {fromCurrency && fromCurrency.network.toLowerCase().includes('ethereum') && (
                <a 
                  href={`https://etherscan.io/tx/${transactionHash}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm">View on Etherscan</span>
                </a>
              )}
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-3 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* Transaction buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            {!transactionHash && (
              <button 
                onClick={sendTransactionFromWallet}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out flex items-center justify-center"
                disabled={isSendingTransaction}
              >
                {isSendingTransaction ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span>Send {fromCurrency?.symbol} with Wallet</span>
                )}
              </button>
            )}
            
            <button 
              onClick={() => setTransactionDetails(null)}
              className="w-full bg-slate-700 text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-600 transition duration-150 ease-in-out"
            >
              {transactionHash ? 'New Exchange' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        // Normal swap interface
        <>
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
                        <div className="w-5 h-5 mr-2 rounded-full bg-slate-700 flex items-center justify-center">
                          {fromCurrency.icon ? (
                            <img 
                              src={fromCurrency.icon} 
                              alt={fromCurrency.symbol} 
                              className="w-4 h-4 object-contain filter invert brightness-100" 
                            />
                          ) : (
                            <span className="text-xs font-bold">{fromCurrency.symbol.charAt(0)}</span>
                          )}
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
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                />
              </div>
            </div>
          </div>

          {/* Swap button container - positioned absolutely to center between boxes */}
          <div className="relative h-8 z-30">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-6">
              <button 
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full p-2 shadow-lg hover:shadow-xl transition duration-150 ease-in-out cursor-pointer transform hover:scale-105 focus:outline-none"
                onClick={swapCurrencies}
                disabled={!fromCurrency || !toCurrency}
                aria-label="Swap direction"
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
                {isCalculating ? 'Calculating...' : ''}
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
                        <div className="w-5 h-5 mr-2 rounded-full bg-slate-700 flex items-center justify-center">
                          {toCurrency.icon ? (
                            <img 
                              src={toCurrency.icon} 
                              alt={toCurrency.symbol} 
                              className="w-4 h-4 object-contain filter invert brightness-100" 
                            />
                          ) : (
                            <span className="text-xs font-bold">{toCurrency.symbol.charAt(0)}</span>
                          )}
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
                  value={toAmount}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {exchangeRate && (
            <div className="bg-slate-900/50 rounded-lg p-3 mb-5">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-400">Rate</span>
                <span className="text-slate-300">{exchangeRate}</span>
              </div>
              {/* Other details could be added here */}
            </div>
          )}

          {/* Recipient Address Section */}
          {fromCurrency && toCurrency && fromAmount && toAmount && (
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400 font-medium">Recipient Address</label>
              </div>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-l-lg text-sm text-slate-200"
                  placeholder="Enter recipient address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <button 
                  onClick={useConnectedWallet}
                  className="p-2 bg-slate-800 border border-slate-700 border-l-0 rounded-r-lg hover:bg-slate-700 transition-colors"
                  title="Use connected wallet address"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </button>
              </div>
              
              {/* Extra ID field (for currencies that need it) */}
              {needsExtraId && (
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-slate-400 font-medium">
                      {toCurrency.extraIdName || 'Destination Tag'}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200"
                    placeholder={`Enter ${toCurrency.extraIdName || 'destination tag'}`}
                    value={extraId}
                    onChange={(e) => setExtraId(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-5 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Button shows Swap or requirements */}
          <button 
            className="btn text-sm text-white bg-purple-500 hover:bg-purple-600 w-full shadow-xs group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            disabled={!fromCurrency || !toCurrency || !fromAmount || parseFloat(fromAmount) <= 0 || isCalculating || isCreatingTransaction}
            onClick={initiateSwap}
          >
            {isCreatingTransaction ? 'Creating Transaction...' :
              !isConnected ? 'Connect Wallet' : 
              (!fromCurrency || !toCurrency) ? 'Select tokens' : 
              (!fromAmount || parseFloat(fromAmount) <= 0) ? 'Enter amount' : 
              !recipientAddress ? 'Enter recipient address' :
              (needsExtraId && !extraId) ? `Enter ${toCurrency?.extraIdName || 'destination tag'}` :
              'Swap'} 
            <span className="tracking-normal text-purple-300 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
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
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                  {currency.icon ? (
                    <img 
                      src={currency.icon} 
                      alt={currency.symbol} 
                      className="w-5 h-5 object-contain filter invert brightness-100" 
                    />
                  ) : (
                    <span className="text-xs font-bold">{currency.symbol.charAt(0)}</span>
                  )}
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