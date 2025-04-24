'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Currency, SwapWidgetProps } from '../types';
import { useQuote } from '../hooks/useQuote';
import { useTransaction } from '../hooks/useTransaction';
import { formatExpiryTime } from '../utils/format';
import TransactionTracker from './TransactionTracker';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function SwapWidget({
  fromCurrency,
  toCurrency,
  setFromModalOpen,
  setToModalOpen,
  swapCurrencies,
  isConnected,
  userAccount,
}: SwapWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTxId = searchParams.get('txId');

  const [fromAmount, setFromAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [fromAddress, setFromAddress] = useState<string>('');
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const { quoteData, quoteLoading, quoteError, quoteSignature, getQuote } =
    useQuote(fromCurrency, toCurrency, fromAmount, userAccount);

  const {
    transactionData,
    error: transactionError,
    executeTransaction,
    sendSolanaTransaction,
  } = useTransaction();

  // Add effect to set query param when component loads with transaction data
  useEffect(() => {
    if (transactionData?.id && !searchParams.get('txId')) {
      // Create new URLSearchParams object
      const params = new URLSearchParams(searchParams);
      params.set('txId', transactionData.id);

      // Update URL with the transaction ID
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [transactionData?.id, pathname, router, searchParams]);

  // Get recommended amount based on currency (~$100 equivalent)
  const getRecommendedAmount = useCallback(
    async (currency: Currency | null) => {
      if (!currency) {
        return '0.1';
      }

      // Default values for common currencies (approximately $100 worth)
      let recommendedValue = '0.1'; // Default value

      switch (currency.symbol) {
        case 'BTC':
          recommendedValue = '0.0025'; // ~$100 in BTC
          break;
        case 'ETH':
          recommendedValue = '0.04'; // ~$100 in ETH
          break;
        case 'SOL':
          recommendedValue = '1'; // ~$100 in SOL
          break;
        case 'USDT':
        case 'USDC':
        case 'DAI':
          recommendedValue = '100'; // Stable coins
          break;
        case 'AVAX':
          recommendedValue = '3'; // ~$100 in AVAX
          break;
        case 'MATIC':
          recommendedValue = '100'; // ~$100 in MATIC
          break;
        case 'BNB':
          recommendedValue = '0.25'; // ~$100 in BNB
          break;
        default:
          // Try to get the price from CoinGecko for other tokens
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${currency.symbol.toLowerCase()}&vs_currencies=usd`
            );

            if (response.ok) {
              const data = await response.json();
              const tokenId = currency.symbol.toLowerCase();

              if (data[tokenId] && data[tokenId].usd) {
                const tokenPriceInUsd = data[tokenId].usd;
                recommendedValue = (100 / tokenPriceInUsd).toFixed(6);
              }
            }
          } catch (priceError) {
            // Silently fail and use default value
            console.warn('Failed to fetch price from CoinGecko:', priceError);
          }
      }
      return recommendedValue;
    },
    []
  );

  useEffect(() => {
    const loadRecommendedAmount = async () => {
      const recommendedAmount = await getRecommendedAmount(fromCurrency);
      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setFromAmount(recommendedAmount);
        getQuote(recommendedAmount);
      }
    };
    loadRecommendedAmount();
  }, [fromCurrency, getRecommendedAmount]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      getQuote(value);
    }
  };

  const handleSwap = async () => {
    if (!fromCurrency || !toCurrency || !fromAmount || !quoteSignature) return;

    if (!recipientAddress) {
      alert(`Please enter a recipient ${toCurrency.symbol} wallet address`);
      return;
    }

    if (!isConnected && !fromAddress) {
      alert(`Please enter a source ${fromCurrency.symbol} wallet address`);
      return;
    }

    try {
      const executeData = await executeTransaction(
        quoteSignature,
        recipientAddress,
        isConnected ? userAccount : fromAddress
      );

      if (fromCurrency.network === 'sol' && isConnected) {
        await sendSolanaTransaction(
          userAccount,
          parseFloat(fromAmount),
          executeData
        );
      }
    } catch (err) {
      console.error('Swap execution failed:', err);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-xl shadow-lg">
      {/* Widget Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-200">Swap</h2>
        <div className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded-full">
          Powered by Swaps.xyz
        </div>
      </div>

      {transactionData?.id || initialTxId ? (
        <TransactionTracker
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          fromAmount={fromAmount}
          quoteData={quoteData}
          transactionId={(transactionData?.id || initialTxId) as string}
          transactionError={transactionError}
          quoteError={quoteError}
          userAccount={userAccount}
          isConnected={isConnected}
          onSendSolanaTransaction={sendSolanaTransaction}
        />
      ) : (
        <>
          {/* Add From Address input when wallet is not connected */}
          {!isConnected && (
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-400 font-medium">
                  {fromCurrency
                    ? `${fromCurrency.symbol} Source Address (${fromCurrency.network})`
                    : 'Source Address'}
                </label>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <input
                  type="text"
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none focus:ring-0 border-none font-mono"
                  placeholder={
                    fromCurrency
                      ? `Enter ${fromCurrency.symbol} (${fromCurrency.network}) address`
                      : 'Enter source address'
                  }
                  value={fromAddress}
                  onChange={e => setFromAddress(e.target.value)}
                />
              </div>
            </div>
          )}
          {/* From Section */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">From</label>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <button
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded-full"
                  onClick={() => setFromModalOpen(true)}
                >
                  {fromCurrency ? (
                    <>
                      <img
                        src={fromCurrency.imageUrl}
                        alt={fromCurrency.symbol}
                        className="w-5 h-5"
                        onError={e => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://placehold.co/20x20/6b21a8/ffffff?text=${fromCurrency.symbol.charAt(
                            0
                          )}`;
                        }}
                      />
                      <span className="text-slate-300">
                        {fromCurrency.symbol}
                      </span>
                      <span className="text-slate-500 text-xs">
                        ({fromCurrency.networkName})
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-300">Select</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <input
                  ref={fromInputRef}
                  type="text"
                  className="w-1/2 text-right bg-transparent text-xl text-slate-200 focus:outline-none focus:ring-0 border-none"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                />
              </div>
            </div>
          </div>

          {/* Swap button container - positioned relatively to center between boxes */}
          <div className="relative h-8 z-10">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-4 -mb-3">
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
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400 font-medium">To</label>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <button
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded-full"
                  onClick={() => setToModalOpen(true)}
                >
                  {toCurrency ? (
                    <>
                      <img
                        src={toCurrency.imageUrl}
                        alt={toCurrency.symbol}
                        className="w-5 h-5"
                        onError={e => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://placehold.co/20x20/6b21a8/ffffff?text=${toCurrency.symbol.charAt(
                            0
                          )}`;
                        }}
                      />
                      <span className="text-slate-300">
                        {toCurrency.symbol}
                      </span>
                      <span className="text-slate-500 text-xs">
                        ({toCurrency.networkName})
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-300">Select</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <input
                  ref={toInputRef}
                  type="text"
                  className="w-1/2 text-right bg-transparent text-xl text-slate-200 focus:outline-none focus:ring-0 border-none"
                  placeholder="0.0"
                  value={quoteData?.toAmount || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="mb-4">
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
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none focus:ring-0 border-none font-mono"
                placeholder={
                  toCurrency
                    ? `Enter ${toCurrency.symbol} (${toCurrency.network}) address`
                    : 'Enter destination address'
                }
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
              />
            </div>
          </div>
          {/* Quote Details */}
          {quoteData && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Rate</span>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {fromCurrency?.imageUrl ? (
                        <img
                          src={fromCurrency.imageUrl}
                          alt={fromCurrency.symbol}
                          className="w-4 h-4 mr-1"
                          onError={e => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://placehold.co/16x16/6b21a8/ffffff?text=${fromCurrency.symbol.charAt(
                              0
                            )}`;
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                          {fromCurrency?.symbol.charAt(0)}
                        </div>
                      )}
                      <span className="text-slate-300 text-sm">
                        1 {fromCurrency?.symbol}
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
                      {toCurrency?.imageUrl ? (
                        <img
                          src={toCurrency.imageUrl}
                          alt={toCurrency.symbol}
                          className="w-4 h-4 mr-1"
                          onError={e => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://placehold.co/16x16/6b21a8/ffffff?text=${toCurrency.symbol.charAt(
                              0
                            )}`;
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                          {toCurrency?.symbol.charAt(0)}
                        </div>
                      )}
                      <span className="text-slate-300 text-sm">
                        {(
                          parseFloat(quoteData.toAmount) /
                          parseFloat(fromAmount)
                        ).toFixed(6)}{' '}
                        {toCurrency?.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Network Fee</span>
                  <span className="text-sm text-slate-300">
                    {quoteData.networkFee} {fromCurrency?.symbol}
                  </span>
                </div>
                {quoteData.expiry && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Expires in</span>
                    <span className="text-sm text-slate-300">
                      {formatExpiryTime(quoteData.expiry)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(quoteError || transactionError) && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {quoteError || transactionError}
            </div>
          )}

          {/* Swap Button */}
          <button
            className={`w-full py-3 px-4 rounded-lg transition duration-150 ease-in-out flex items-center justify-center ${
              quoteLoading ||
              !fromCurrency ||
              !toCurrency ||
              !fromAmount ||
              !recipientAddress ||
              parseFloat(fromAmount) === 0
                ? 'bg-purple-600/50 text-white/70 cursor-not-allowed' // disabled state
                : 'bg-purple-600 text-white hover:bg-purple-700' // enabled state
            }`}
            disabled={
              quoteLoading ||
              !fromCurrency ||
              !toCurrency ||
              !fromAmount ||
              !recipientAddress ||
              parseFloat(fromAmount) === 0
            }
            onClick={handleSwap}
          >
            {quoteLoading ? (
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
                Getting Quote...
              </span>
            ) : (
              'Swap'
            )}
          </button>
        </>
      )}
    </div>
  );
}
