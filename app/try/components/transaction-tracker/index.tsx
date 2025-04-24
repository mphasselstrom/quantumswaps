import { useState } from 'react';
import { Currency, TransactionStatus } from '../../types';
import ErrorDisplay from './Error';
import PaymentInstructions from './PaymentInstructions';
import Status from './Status';
import TransactionId from './TransactionId';
import TransactionSummary from './TransactionSummary';
import { useTransactionTracker } from '../../hooks/useTransactionTracker';

const SOLANA_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

type SolanaTransactionStatus =
  (typeof SOLANA_STATUS)[keyof typeof SOLANA_STATUS];

interface TransactionTrackerProps {
  fromCurrency: Currency | null;
  toCurrency: Currency | null;
  fromAmount: string;
  quoteData: any;
  transactionId: string;
  transactionError?: string | null;
  quoteError?: string | null;
  userAccount: string;
  isConnected: boolean;
  onSendSolanaTransaction: (
    userAccount: string,
    amount: number,
    txData: any
  ) => Promise<void>;
  onBackToSwap: () => void;
}

function TransactionTracker({
  quoteData,
  transactionId,
  transactionError,
  quoteError,
  userAccount,
  isConnected,
  onSendSolanaTransaction,
  onBackToSwap,
}: TransactionTrackerProps) {
  const { transactionData } = useTransactionTracker(transactionId);
  const [solanaTransactionStatus, setSolanaTransactionStatus] =
    useState<SolanaTransactionStatus>(SOLANA_STATUS.NONE);
  const [solanaError, setSolanaError] = useState<string | null>(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  if (!transactionData) {
    return null;
  }

  const shouldShowSolanaButton =
    transactionData?.fromNetwork === 'sol' &&
    isConnected &&
    solanaTransactionStatus === SOLANA_STATUS.NONE &&
    transactionData.status === TransactionStatus.PENDING;

  const handleSolanaTransaction = async () => {
    if (
      isTransactionPending ||
      solanaTransactionStatus !== SOLANA_STATUS.NONE
    ) {
      return;
    }

    try {
      setIsTransactionPending(true);
      setSolanaError(null);
      setSolanaTransactionStatus(SOLANA_STATUS.PENDING);

      await onSendSolanaTransaction(
        userAccount,
        parseFloat(transactionData.fromAmount),
        transactionData
      );

      setSolanaTransactionStatus(SOLANA_STATUS.CONFIRMED);
    } catch (error) {
      console.error('Solana transaction error:', error);
      setSolanaTransactionStatus(SOLANA_STATUS.FAILED);
      setSolanaError(
        error instanceof Error ? error.message : 'Transaction failed'
      );
    } finally {
      setIsTransactionPending(false);
    }
  };

  const getSolanaStatusMessage = () => {
    switch (solanaTransactionStatus) {
      case SOLANA_STATUS.PENDING:
        return 'Confirming Solana transaction...';
      case SOLANA_STATUS.CONFIRMED:
        return 'Solana transaction confirmed';
      case SOLANA_STATUS.FAILED:
        return `Solana transaction failed: ${solanaError}`;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBackToSwap}
        className="flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-150 cursor-pointer"
      >
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
          className="mr-2"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Swap
      </button>

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="flex flex-col space-y-2">
          <TransactionSummary
            fromAmount={transactionData.fromAmount}
            fromCurrency={transactionData.fromCurrency}
            toAmount={quoteData?.toAmount}
            toCurrency={transactionData.toCurrency}
          />

          <TransactionId id={transactionData.id} />

          <PaymentInstructions
            fromAmount={transactionData.fromAmount}
            fromCurrency={transactionData.fromCurrency}
            depositAddress={transactionData.depositAddress}
            depositExtraId={transactionData.depositExtraId}
          />

          <div className="mt-2">
            <span className="text-slate-400 block mb-1">Status:</span>
            <Status status={transactionData.status} />
          </div>

          {solanaTransactionStatus !== SOLANA_STATUS.NONE && (
            <div
              className={`mt-2 p-3 rounded-lg ${
                solanaTransactionStatus === SOLANA_STATUS.CONFIRMED
                  ? 'bg-green-900/20 border border-green-700 text-green-400'
                  : solanaTransactionStatus === SOLANA_STATUS.PENDING
                  ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-400'
                  : 'bg-red-900/20 border border-red-700 text-red-400'
              }`}
            >
              {getSolanaStatusMessage()}
            </div>
          )}

          {shouldShowSolanaButton && (
            <button
              onClick={handleSolanaTransaction}
              disabled={
                isTransactionPending ||
                solanaTransactionStatus !== SOLANA_STATUS.NONE
              }
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransactionPending
                ? 'Confirming...'
                : 'Send with connected wallet'}
            </button>
          )}

          {solanaTransactionStatus === SOLANA_STATUS.FAILED && (
            <button
              onClick={handleSolanaTransaction}
              disabled={isTransactionPending}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retry Solana Transaction
            </button>
          )}
        </div>
      </div>

      <ErrorDisplay error={transactionError || quoteError} />
    </div>
  );
}

export default TransactionTracker;
