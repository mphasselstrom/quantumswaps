'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Currency,
  SwapWidgetProps,
  CurrencySelectorProps,
  ApiCurrencyPair,
  ApiPairsResponse,
  SwapQuoteRequest,
  SwapQuoteResponse,
  CurrencyInfo,
} from './types';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
} from '@solana/web3.js';
import {
  WalletModalProvider,
  useWalletModal,
} from '@solana/wallet-adapter-react-ui';

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
    solana?: any;
  }
}

export default function TryPage() {
  // Set up Solana network and wallet
  const network = WalletAdapterNetwork.Mainnet;
  // Use a more reliable RPC endpoint with the user's Helius API key
  const endpoint = useMemo(
    () =>
      'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d',
    []
  );
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SwapPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function SwapPageContent() {
  const [fromModalOpen, setFromModalOpen] = useState(false);
  const [toModalOpen, setToModalOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [fromCurrencies, setFromCurrencies] = useState<Currency[]>([]);
  const [toCurrencies, setToCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Solana wallet adapter hooks
  const { wallet, disconnect, connected, publicKey } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const isConnected = connected;
  const userAccount = publicKey?.toString() || '';

  const getNetworkDisplayName = (network: string): string => {
    const networkMap: { [key: string]: string } = {
      eth: 'Ethereum',
      btc: 'Bitcoin',
      matic: 'Polygon',
      avax: 'Avalanche',
      avaxc: 'Avalanche',
      bsc: 'BSC',
      sol: 'Solana',
    };
    return networkMap[network] || network;
  };

  const loadToCurrencies = async (
    pairs: {
      fromCurrency: string;
      fromNetwork: string;
      toCurrency: string;
      toNetwork: string;
    }[]
  ) => {
    if (pairs && Array.isArray(pairs)) {
      // Get unique currencies from pairs
      const uniqueCurrencies = new Set<string>();
      const uniqueNetworks = new Set<string>();

      pairs.forEach((pair: any) => {
        if (pair.toCurrency) {
          uniqueCurrencies.add(pair.toCurrency.toLowerCase());
          uniqueNetworks.add(pair.toNetwork);
        }
      });
      // Fetch detailed currency information
      const [currenciesResponse] = await Promise.all([
        fetch('/api/currencies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currencies: Array.from(uniqueCurrencies),
          }),
        }),
      ]);
      const [currenciesData] = await Promise.all([currenciesResponse.json()]);
      // Now create the currencies map using the detailed information
      const toCurrenciesMap = new Map<string, Currency>();

      pairs.forEach((pair: any) => {
        if (!pair.toCurrency) return;

        const currencyId = `${pair.toCurrency.toLowerCase()}-${pair.toNetwork}`;

        if (!toCurrenciesMap.has(currencyId)) {
          const code = pair.toCurrency.toLowerCase();
          const currencyInfo = currenciesData.find(
            (c: any) => c.code.toLowerCase() === code
          );

          toCurrenciesMap.set(currencyId, {
            id: currencyId,
            name: currencyInfo?.name || code.toUpperCase(),
            symbol: code.toUpperCase(),
            network: pair.toNetwork,
            networkName: getNetworkDisplayName(pair.toNetwork),
            imageUrl:
              currencyInfo?.imageUrl ||
              `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code}.png`,
            extraIdName: currencyInfo?.requiresExtraTag ? 'Tag' : undefined,
          });
        }
      });

      setToCurrencies(Array.from(toCurrenciesMap.values()));
      // set default to ETH if not, first in the list
      setToCurrency(
        Array.from(toCurrenciesMap.values()).find(
          c =>
            c.symbol.toLowerCase() === 'eth' &&
            c.network.toLowerCase() === 'eth'
        ) || Array.from(toCurrenciesMap.values())[0]
      );
    }
  };
  const loadCurrencies = async (currencies: string[], networks: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both currencies and pairs data in parallel
      const [currenciesResponse, networksResponse, pairsResponse] =
        await Promise.all([
          fetch('/api/currencies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currencies: currencies,
            }),
          }),
          fetch('/api/networks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              networks,
            }),
          }),
          fetch('/api/currency-pairs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromCurrencies: currencies,
              fromNetworks: networks,
            }),
          }),
        ]);

      const [currenciesData, networksData, pairsData] = await Promise.all([
        currenciesResponse.json(),
        networksResponse.json(),
        pairsResponse.json(),
      ]);

      // Transform currencies data
      const transformedCurrencies: Currency[] = currenciesData.map(
        (currencyInfo: any) => ({
          id: currencyInfo.id,
          name: currencyInfo.name || currencyInfo.code.toUpperCase(),
          symbol: currencyInfo.code.toUpperCase(),
          network: networksData[0].name || networksData[0].code,
          imageUrl:
            currencyInfo.imageUrl ||
            `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${currencyInfo.code.toLowerCase()}.png`,
          extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
        })
      );

      await loadToCurrencies(pairsData.pairs);
      return transformedCurrencies;
    } catch (err) {
      console.error('Error loading currencies:', err);
      setError('Failed to load currencies. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load from currencies data from API
  useEffect(() => {
    async function loadFromCurrencies() {
      const fromCurrencies = await loadCurrencies(['sol'], ['sol']);
      if (fromCurrencies) {
        setFromCurrencies(fromCurrencies);
        setFromCurrency(fromCurrencies[0]);
      }
    }
    loadFromCurrencies();
  }, []);

  const connectWallet = async () => {
    try {
      // Check if Phantom is available
      if (window.solana && window.solana.isPhantom) {
        // Open wallet modal to let the user connect
        setVisible(true);

        return publicKey?.toString() || null;
      } else {
        alert('Please install Phantom wallet for the best experience.');
        window.open('https://phantom.app/', '_blank');
        return null;
      }
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      alert(
        'Failed to connect Phantom wallet. Please make sure your wallet is unlocked.'
      );
    }
    return null;
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const handleSelectFromCurrency = async (currency: Currency) => {
    console.log('Selected FROM currency:', currency);

    // First close the modal
    setFromModalOpen(false);

    // Reset TO currency selection
    setToCurrency(null);

    // Set the new FROM currency
    loadCurrencies([currency.id], [currency.network]);

    // Set loading state while fetching TO currencies
    setIsLoading(true);
  };

  const handleSelectToCurrency = (currency: Currency) => {
    setToCurrency(currency);
    setToModalOpen(false);
  };

  const swapCurrencies = () => {
    // We now support multiple FROM currencies, so implement proper swapping
    if (fromCurrency && toCurrency) {
      // Check if the current TO currency is in our FROM currencies list
      const canSwap = fromCurrencies.some(c => c.id === toCurrency.id);

      if (canSwap) {
        // Store current FROM currency to assign as new TO currency
        const oldFromCurrency = fromCurrency;

        // Set new FROM currency (was previously TO currency)
        setFromCurrency(toCurrency);

        // After fetching, check if the old FROM currency can be a TO currency
        // Note: This is a bit of a hack since we can't await the fetchToCurrencies results easily
        setTimeout(() => {
          if (toCurrencies.some(c => c.id === oldFromCurrency.id)) {
            setToCurrency(oldFromCurrency);
          }
        }, 500);
      } else {
        alert(
          `${toCurrency.symbol} on ${toCurrency.network} is not available as a source currency`
        );
      }
    }
  };

  return (
    <section className="relative">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-slate-900 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <div className="absolute bottom-0 left-0 right-0 h-full bg-slate-900 z-10"></div>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-b from-slate-800/0 via-slate-800/50 to-slate-900 h-[25rem]"></div>
        </div>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="h-[40rem] w-[40rem] bg-slate-800 blur-[10rem] opacity-20 rounded-full"></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <div className="inline-flex items-center justify-center p-1 mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <span className="bg-slate-900 rounded-full px-3 py-1 text-xs font-semibold text-slate-200">
                Swaps.xyz
              </span>
            </div>
          </div>

          {/* Wallet Connection Button */}
          <div className="max-w-lg mx-auto mb-6">
            {!isConnected ? (
              <button
                onClick={() => setVisible(true)}
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition duration-150 ease-in-out flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
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
                    Powered by Swaps.xyz
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
          currencies={fromCurrencies}
          onSelect={handleSelectFromCurrency}
          title="Select From Token"
        />
      )}

      {toModalOpen && (
        <CurrencySelector
          isOpen={toModalOpen}
          onClose={() => setToModalOpen(false)}
          currencies={toCurrencies}
          onSelect={handleSelectToCurrency}
          title="Select To Token"
        />
      )}
    </section>
  );
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
  setWalletVisible,
}: SwapWidgetProps) {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedAmount, setRecommendedAmount] = useState<string>('0.1');
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const [quoteData, setQuoteData] = useState<SwapQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [quoteSignature, setQuoteSignature] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Initialize recipient address with the user's address when connected
  useEffect(() => {
    if (isConnected && userAccount) {
      // Removed setting default recipient address
    }
  }, [isConnected, userAccount]);

  // Get recommended amount based on currency (~$100 equivalent)
  async function getRecommendedAmount() {
    if (!fromCurrency) {
      return;
    }

    // Default values for common currencies (approximately $100 worth)
    let recommendedValue = '0.1'; // Default value

    if (fromCurrency.symbol === 'BTC') {
      recommendedValue = '0.0025'; // ~$100 in BTC
    } else if (fromCurrency.symbol === 'ETH') {
      recommendedValue = '0.04'; // ~$100 in ETH
    } else if (fromCurrency.symbol === 'SOL') {
      recommendedValue = '1'; // ~$100 in SOL
    } else if (
      fromCurrency.symbol === 'USDT' ||
      fromCurrency.symbol === 'USDC' ||
      fromCurrency.symbol === 'DAI'
    ) {
      recommendedValue = '100'; // Stable coins
    } else if (fromCurrency.symbol === 'AVAX') {
      recommendedValue = '3'; // ~$100 in AVAX
    } else if (fromCurrency.symbol === 'MATIC') {
      recommendedValue = '100'; // ~$100 in MATIC
    } else if (fromCurrency.symbol === 'BNB') {
      recommendedValue = '0.25'; // ~$100 in BNB
    } else {
      // Try to get the price from CoinGecko for other tokens
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency.symbol.toLowerCase()}&vs_currencies=usd`
        );

        if (response.ok) {
          const data = await response.json();
          const tokenId = fromCurrency.symbol.toLowerCase();

          if (data[tokenId] && data[tokenId].usd) {
            const tokenPriceInUsd = data[tokenId].usd;
            // Calculate amount for ~$100 worth
            recommendedValue = (100 / tokenPriceInUsd).toFixed(6);
          }
        }
      } catch (priceError) {
        // Silently fail and use default value
      }
    }

    setRecommendedAmount(recommendedValue);

    // Set a default value if the input is empty
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setFromAmount(recommendedValue);
      fetchQuote(recommendedValue);
    }
  }

  // Update recommended amount when currencies change
  useEffect(() => {
    if (fromCurrency) {
      getRecommendedAmount();
    }
  }, [fromCurrency]);

  // Update the fetchQuote function to remove references to recommended amounts
  const fetchQuote = async (amount: string) => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setToAmount('');
      return;
    }

    // If user is not connected, we need to show a message but still allow them to see a quote
    // Use a dummy wallet address if not connected
    const walletAddress = isConnected
      ? userAccount
      : 'DummyUserAddress123456789';

    try {
      setQuoteLoading(true);
      setQuoteError(null);

      // Determine the network to use, converting 'avax' to 'avaxc' when needed
      let fromNetworkToUse = fromCurrency.network;
      if (fromNetworkToUse === 'avax') {
        fromNetworkToUse = 'avaxc';
      }

      const quoteRequest: SwapQuoteRequest = {
        fromCurrency: fromCurrency.symbol.toLowerCase(),
        fromNetwork: fromNetworkToUse,
        toCurrency: toCurrency.symbol.toLowerCase(),
        toNetwork: toCurrency.network,
        fromAmount: amount,
        fromWalletAddress: walletAddress,
        flow: 'standard',
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
      if (
        !data.networkFee ||
        data.networkFee === '0' ||
        data.networkFee === ''
      ) {
        // Estimate fee as 0.1% of the amount for demo purposes
        const estimatedFee = (parseFloat(amount) * 0.001).toFixed(8);
        data.networkFee = estimatedFee;
      }

      setQuoteData(data);
      setToAmount(data.toAmount);
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      setQuoteError(
        err.message || 'Failed to get exchange rate. Please try again.'
      );

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
        alert(
          `Connection for ${fromCurrency?.symbol} on ${fromCurrency?.network} is not implemented yet.`
        );
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
      // Validate required fields
      if (!fromCurrency || !toCurrency) {
        setError('Please select currencies');
        return;
      }

      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setError('Please enter an amount');
        return;
      }

      // Validate recipient address
      if (!recipientAddress || recipientAddress.trim() === '') {
        setError(
          `Please enter a recipient ${toCurrency.symbol} wallet address`
        );
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
        setError(
          executeErr instanceof Error
            ? executeErr.message
            : 'Failed to execute swap. Please try again.'
        );
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
      depositAddress: transactionData?.depositAddress,
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

      console.log(
        'Setting status to waiting_for_confirmation and isLoading=true'
      );
      setTransactionStatus('waiting_for_confirmation');
      setIsLoading(true);
      setError(null);

      // Use Helius endpoint with the API key that's already set up elsewhere in the app
      const heliusRpcEndpoint =
        'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d';
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
        console.error(
          'Error getting recent blockhash from Helius:',
          blockHashError
        );

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
        lamports: LAMPORTS_PER_SOL * parseFloat(transactionData.fromAmount),
      });

      try {
        // Sign the transaction using Phantom
        console.log('Requesting transaction signature from Phantom...');
        const signedTransaction = await window.solana.signTransaction(
          transaction
        );

        console.log('Transaction signed successfully');

        // Set status to processing
        setTransactionStatus('processing');

        // Send the signed transaction to the Solana network through Helius
        console.log('Sending raw transaction to Solana network via Helius...');
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

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
          console.log(
            'Confirmation timeout - transaction may still be processing'
          );
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
      setError(
        'Failed to send transaction: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
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
    buttonDisabled:
      isLoading ||
      transactionStatus === 'processing' ||
      transactionStatus === 'success',
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
                <span className="text-slate-300">
                  {fromAmount} {fromCurrency?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receive:</span>
                <span className="text-slate-300">
                  {toAmount} {toCurrency?.symbol}
                </span>
              </div>

              {/* Transaction and deposit information */}
              <div className="mt-4 mb-2">
                <span className="text-slate-400 block mb-1">
                  Transaction ID:
                </span>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
                  {transactionData.id}
                </div>
              </div>

              <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700 mt-2">
                <h3 className="text-indigo-300 font-medium mb-2">
                  Send Payment Instructions
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Send Exactly:</span>
                    <span className="text-slate-300 font-medium">
                      {transactionData.fromAmount}{' '}
                      {transactionData.fromCurrency.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">
                      Deposit Address:
                    </span>
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
                  disabled={
                    transactionStatus === 'processing' ||
                    transactionStatus === 'success'
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="font-medium">Send with Phantom</span>
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
              {/* Removed recommended amount text */}
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
                            onError={e => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/20x20/6b21a8/ffffff?text=' +
                                fromCurrency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 mr-2 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {fromCurrency.symbol.charAt(0)}
                          </div>
                        )}
                        <span className="text-slate-300">
                          {fromCurrency.symbol}
                        </span>
                      </>
                    ) : (
                      <span className="mr-1 text-slate-300">Select</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400 ml-1"
                    >
                      <path d="m6 9 6 6 6-6" />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                >
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
                            onError={e => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/20x20/6b21a8/ffffff?text=' +
                                toCurrency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 mr-2 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {toCurrency.symbol.charAt(0)}
                          </div>
                        )}
                        <span className="text-slate-300">
                          {toCurrency.symbol}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">
                          ({toCurrency.networkName || toCurrency.network})
                        </span>
                      </>
                    ) : (
                      <span className="mr-1 text-slate-300">Select</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400 ml-1"
                    >
                      <path d="m6 9 6 6 6-6" />
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
                {toCurrency
                  ? `${toCurrency.symbol} Recipient Address (${toCurrency.network})`
                  : 'Recipient Address'}
              </label>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <input
                type="text"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none border-none font-mono"
                placeholder={
                  toCurrency
                    ? `Enter ${toCurrency.symbol} (${toCurrency.network}) wallet address`
                    : 'Enter destination wallet address'
                }
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Rate Display */}
          {fromCurrency && toCurrency && fromAmount && toAmount && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Rate</span>
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {fromCurrency.imageUrl ? (
                      <img
                        src={fromCurrency.imageUrl}
                        alt={fromCurrency.symbol}
                        className="w-4 h-4 mr-1"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/16x16/6b21a8/ffffff?text=' +
                            fromCurrency.symbol.charAt(0);
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                        {fromCurrency.symbol.charAt(0)}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm">
                      1 {fromCurrency.symbol}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500 mx-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  <div className="flex items-center ml-1">
                    {toCurrency.imageUrl ? (
                      <img
                        src={toCurrency.imageUrl}
                        alt={toCurrency.symbol}
                        className="w-4 h-4 mr-1"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/16x16/6b21a8/ffffff?text=' +
                            toCurrency.symbol.charAt(0);
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                        {toCurrency.symbol.charAt(0)}
                      </div>
                    )}
                    <span className="text-slate-300 text-sm">
                      {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(
                        6
                      )}{' '}
                      {toCurrency.symbol}
                    </span>
                  </div>
                </div>
              </div>
              {quoteData && (
                <>
                  <div className="flex justify-between items-center text-sm mt-2 pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Network Fee</span>
                    <span className="text-slate-300">
                      {quoteData.networkFee} {fromCurrency.symbol}
                    </span>
                  </div>
                  {quoteData.expiry && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-slate-400">Quote expires in</span>
                      <span className="text-slate-300">
                        {Math.max(
                          0,
                          Math.floor(
                            (quoteData.expiry - Date.now() / 1000) / 60
                          )
                        )}{' '}
                        minutes
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
            disabled={
              isLoading ||
              quoteLoading ||
              !fromCurrency ||
              !toCurrency ||
              !fromAmount ||
              parseFloat(fromAmount) === 0
            }
            onClick={!isConnected ? () => setWalletVisible(true) : initiateSwap}
          >
            {isLoading || quoteLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isLoading ? 'Processing...' : 'Getting Quote...'}
              </span>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              'Swap'
            )}
          </button>
        </>
      )}
    </>
  );
}

// CurrencySelector Modal Component
function CurrencySelector({
  isOpen,
  onClose,
  currencies,
  onSelect,
  title,
}: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Currency[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleRangeStart, setVisibleRangeStart] = useState(0);

  // Number of items to render at once (adjust based on performance)
  const ITEMS_TO_RENDER = 50;

  // Add debug information for currency selection
  useEffect(() => {
    console.log(
      `${title} Modal - Currencies available:`,
      currencies?.length || 0
    );
    if (currencies && currencies.length > 0) {
      console.log('First few currencies:', currencies.slice(0, 3));
    } else {
      console.warn(`No currencies available for ${title}`);
    }
  }, [currencies, title]);

  // Local search function - much faster than API calls
  const performLocalSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !currencies || currencies.length === 0) {
        return [];
      }

      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0);

      return currencies.filter(currency => {
        const name = currency.name.toLowerCase();
        const symbol = currency.symbol.toLowerCase();
        const network = currency.network.toLowerCase();

        // Check if all search terms are found in any of the fields
        return searchTerms.every(
          term =>
            name.includes(term) ||
            symbol.includes(term) ||
            network.includes(term)
        );
      });
    },
    [currencies]
  );

  // Debounced search function
  const handleSearch = useCallback(
    (query: string) => {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Update the search query state immediately
      setSearchQuery(query);

      // Reset the visible range when search query changes
      setVisibleRangeStart(0);

      // If the query is empty, clear results and return
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // Set a timeout to execute the search after a short delay
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);

        try {
          // Perform local search
          const results = performLocalSearch(query);
          setSearchResults(results);
          console.log(`Found ${results.length} currencies matching "${query}"`);
        } catch (error) {
          console.error('Error searching currencies:', error);
        } finally {
          setIsSearching(false);
        }
      }, 150);
    },
    [performLocalSearch]
  );

  // Handle scrolling to load more items
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const bottomThreshold = 200; // pixels from bottom to trigger loading more

    // Get the current display currencies length safely
    const currentDisplayLength = searchQuery.trim()
      ? searchResults.length
      : currencies?.length || 0;

    // If we're near the bottom, show more items
    if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
      setVisibleRangeStart(prev =>
        Math.min(prev + 20, Math.max(0, currentDisplayLength - ITEMS_TO_RENDER))
      );
    }

    // If we're near the top and not at the beginning, show previous items
    if (scrollTop < bottomThreshold && visibleRangeStart > 0) {
      setVisibleRangeStart(prev => Math.max(0, prev - 20));
    }
  }, [
    listRef,
    visibleRangeStart,
    ITEMS_TO_RENDER,
    searchQuery,
    searchResults,
    currencies,
  ]);

  // Add scroll event listener
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Reset visible range when modal opens
    setVisibleRangeStart(0);

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
      setSearchResults([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Determine which currencies to display based on search query
  const displayCurrencies = searchQuery.trim()
    ? searchResults
    : currencies || [];

  // Sort alphabetically by name and then by network
  const sortedCurrencies = [...displayCurrencies].sort((a, b) => {
    // First sort by symbol
    const symbolCompare = a.symbol.localeCompare(b.symbol);
    if (symbolCompare !== 0) return symbolCompare;

    // Then by network for currencies with the same symbol
    return (a.networkName || a.network).localeCompare(
      b.networkName || b.network
    );
  });

  // Get the visible slice of currencies
  const visibleCurrencies = sortedCurrencies.slice(
    visibleRangeStart,
    visibleRangeStart + ITEMS_TO_RENDER
  );

  // Calculate spacer heights for virtual scrolling
  const itemHeight = 64; // approximate height of each currency item in px
  const topSpacerHeight = visibleRangeStart * itemHeight;
  const bottomSpacerHeight = Math.max(
    0,
    (sortedCurrencies.length - visibleRangeStart - ITEMS_TO_RENDER) * itemHeight
  );

  // Safeguard against empty currencies array when not searching
  if (displayCurrencies.length === 0 && !searchQuery.trim() && !isSearching) {
    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-32 overflow-y-auto"
        onClick={onClose}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="text-slate-300 mb-4">No currencies available</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            onChange={e => handleSearch(e.target.value)}
          />

          {/* Currency Count */}
          <div className="text-sm text-slate-400 mb-2">
            {searchQuery
              ? `Found ${displayCurrencies.length} currencies`
              : `${displayCurrencies.length} currencies available`}
          </div>

          <div
            ref={listRef}
            className="max-h-[50vh] overflow-y-auto pb-2 pr-1 currency-scroll relative"
          >
            {isSearching && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-2 text-slate-300">Searching...</span>
              </div>
            )}

            {!isSearching && sortedCurrencies.length > 0 ? (
              <div className="space-y-2 relative">
                {/* Top spacer for virtual scrolling */}
                {topSpacerHeight > 0 && (
                  <div style={{ height: `${topSpacerHeight}px` }} />
                )}

                {/* Visible currencies */}
                {visibleCurrencies.map(currency => (
                  <button
                    key={currency.id}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                    onClick={() => onSelect(currency)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {currency.imageUrl ? (
                          <img
                            src={currency.imageUrl}
                            alt={currency.symbol}
                            className="w-6 h-6 mr-3 rounded-full"
                            onError={e => {
                              // If image fails to load, replace with a fallback
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/24x24/6b21a8/ffffff?text=' +
                                currency.symbol.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 mr-3 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {currency.symbol.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-slate-200 font-medium">
                            {currency.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {currency.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded-full text-xs text-slate-300">
                        {currency.networkName || currency.network}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Bottom spacer for virtual scrolling */}
                {bottomSpacerHeight > 0 && (
                  <div style={{ height: `${bottomSpacerHeight}px` }} />
                )}
              </div>
            ) : (
              !isSearching &&
              searchQuery.trim() && (
                <div className="text-center text-slate-400 py-6">
                  No currencies found matching "{searchQuery}"
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
