'use client';

import { RefObject, useRef, useState, useEffect } from 'react';
import { SwapWidgetProps } from '../../types';
import TransactionTracker from '../transaction-tracker';
import { CurrencyInput } from './CurrencyInput';
import { AddressInput } from './AddressInput';
import { QuoteDetails } from './QuoteDetails';
import { SwapButton } from './SwapButton';
import { useSwap } from './hooks/useSwap';
import { useUrlParams } from './hooks/useUrlParams';
import { useRouter } from 'next/navigation';
import { TransactionStatus } from '../../types';

export default function SwapWidget({
  fromCurrency,
  toCurrency,
  setFromModalOpen,
  setToModalOpen,
  swapCurrencies,
  isConnected,
  userAccount,
}: SwapWidgetProps) {
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const [showTransactionTracker, setShowTransactionTracker] = useState(false);
  const router = useRouter();

  const {
    fromAmount,
    recipientAddress,
    fromAddress,
    quoteData,
    quoteLoading,
    quoteError,
    transactionData,
    transactionError,
    handleFromAmountChange,
    handleRecipientAddressChange,
    handleFromAddressChange,
    handleSwap,
    sendSolanaTransaction,
    clearErrors,
    resetTransaction,
  } = useSwap(fromCurrency, toCurrency, userAccount, isConnected);

  const { initialTxId } = useUrlParams(transactionData?.id);

  useEffect(() => {
    if (initialTxId) {
      setShowTransactionTracker(true);
    }
  }, [initialTxId]);

  const handleBackToSwap = () => {
    setShowTransactionTracker(false);
    clearErrors();
    resetTransaction();
    // Clear the transaction ID from the URL
    router.push('/try');
  };

  const handleSwapClick = async () => {
    await handleSwap();
    setShowTransactionTracker(true);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-200">Swap</h2>
        <div className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded-full">
          Powered by Swaps.xyz
        </div>
      </div>

      {showTransactionTracker ? (
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
          onBackToSwap={handleBackToSwap}
        />
      ) : (
        <>
          {!isConnected && (
            <AddressInput
              currency={fromCurrency}
              address={fromAddress}
              onAddressChange={handleFromAddressChange}
              label={
                fromCurrency
                  ? `${fromCurrency.symbol} Source Address (${fromCurrency.network})`
                  : 'Source Address'
              }
              placeholder={
                fromCurrency
                  ? `Enter ${fromCurrency.symbol} (${fromCurrency.network}) address`
                  : 'Enter source address'
              }
            />
          )}

          <CurrencyInput
            currency={fromCurrency}
            amount={fromAmount}
            inputRef={fromInputRef as RefObject<HTMLInputElement>}
            onAmountChange={handleFromAmountChange}
            onCurrencySelect={() => setFromModalOpen(true)}
            label="From"
          />

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

          <CurrencyInput
            currency={toCurrency}
            amount={quoteData?.toAmount || ''}
            inputRef={toInputRef as RefObject<HTMLInputElement>}
            onAmountChange={() => {}}
            onCurrencySelect={() => setToModalOpen(true)}
            label="To"
          />

          <AddressInput
            currency={toCurrency}
            address={recipientAddress}
            onAddressChange={handleRecipientAddressChange}
            label={
              toCurrency
                ? `${toCurrency.symbol} Recipient Address (${toCurrency.network})`
                : 'Recipient Address'
            }
            placeholder={
              toCurrency
                ? `Enter ${toCurrency.symbol} (${toCurrency.network}) address`
                : 'Enter destination address'
            }
          />

          <QuoteDetails
            quoteData={quoteData}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            fromAmount={fromAmount}
          />

          {(quoteError || transactionError) && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {quoteError || transactionError}
            </div>
          )}

          <SwapButton
            isLoading={quoteLoading}
            isDisabled={
              quoteLoading ||
              !fromCurrency ||
              !toCurrency ||
              !fromAmount ||
              !recipientAddress ||
              parseFloat(fromAmount) === 0
            }
            onClick={handleSwapClick}
          />
        </>
      )}
    </div>
  );
}
