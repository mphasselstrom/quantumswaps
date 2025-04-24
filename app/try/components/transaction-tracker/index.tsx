import { Currency, TransactionStatus } from '../../types';
import ErrorDisplay from './Error';
import PaymentInstructions from './PaymentInstructions';
import Status from './Status';
import TransactionId from './TransactionId';
import TransactionSummary from './TransactionSummary';
import { useTransactionTracker } from '../../hooks/useTransactionTracker';

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
  fromCurrency,
  toCurrency,
  fromAmount,
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

  if (!transactionData) {
    return null;
  }
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
            fromAmount={fromAmount}
            fromCurrency={fromCurrency}
            toAmount={quoteData?.toAmount}
            toCurrency={toCurrency}
          />

          <TransactionId id={transactionData.id} />

          <PaymentInstructions
            fromAmount={transactionData.fromAmount}
            fromCurrency={fromCurrency}
            depositAddress={transactionData.depositAddress}
            depositExtraId={transactionData.depositExtraId}
          />

          <div className="mt-2">
            <span className="text-slate-400 block mb-1">Status:</span>
            <Status status={transactionData.status} />
          </div>
          {fromCurrency?.network === 'sol' && isConnected && (
            <button
              onClick={() =>
                onSendSolanaTransaction(
                  userAccount,
                  parseFloat(fromAmount),
                  transactionData
                )
              }
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out mt-4 cursor-pointer"
              disabled={
                transactionData.status === TransactionStatus.FAILED ||
                transactionData.status === TransactionStatus.COMPLETED
              }
            >
              Send with connected wallet
            </button>
          )}
        </div>
      </div>

      <ErrorDisplay error={transactionError || quoteError} />
    </div>
  );
}

export default TransactionTracker;
