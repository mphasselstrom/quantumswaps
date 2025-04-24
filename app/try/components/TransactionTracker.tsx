import { useEffect } from 'react';
import { useTransactionTracker } from '../hooks/useTransactionTracker';
import { Currency, TransactionData, TransactionStatus } from '../types';

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
}: TransactionTrackerProps) {
  const { transactionData } = useTransactionTracker(transactionId);

  if (!transactionData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Transaction Details */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Send:</span>
            <span className="text-slate-300">
              {fromAmount} {fromCurrency?.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Receive:</span>
            <span className="text-slate-300">
              {quoteData?.toAmount} {toCurrency?.symbol}
            </span>
          </div>

          <div className="mt-4 mb-2">
            <span className="text-slate-400 block mb-1">Transaction ID:</span>
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
                  {transactionData.fromAmount} {fromCurrency?.symbol}
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
              {transactionData.depositExtraId && (
                <div>
                  <span className="text-slate-400 block mb-1">Extra ID:</span>
                  <div className="bg-slate-800 p-2 rounded break-all font-mono text-xs text-slate-300">
                    {transactionData.depositExtraId}
                  </div>
                </div>
              )}
              <div className="mt-2">
                <span className="text-slate-400 block mb-1">Status:</span>
                <div className="bg-slate-800 p-2 rounded font-medium text-sm">
                  <StatusBadge status={transactionData.status} />
                </div>
              </div>
            </div>
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
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-150 ease-in-out mt-4"
              disabled={
                transactionData.status === TransactionStatus.FAILED ||
                transactionData.status === TransactionStatus.COMPLETED
              }
            >
              {'Send with connected wallet'}
            </button>
          )}
        </div>
      </div>

      {(transactionError || quoteError) && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          {transactionError || quoteError}
        </div>
      )}
    </div>
  );
}

// Helper component for status badge
function StatusBadge({ status }: { status: TransactionStatus }) {
  const getStatusStyles = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-500/10 text-green-400 border-l-4 border-green-500';
      case TransactionStatus.PENDING:
        return 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500';
      case TransactionStatus.PAYOUT_CREATED:
        return 'bg-yellow-500/10 text-yellow-400 border-l-4 border-yellow-500';
      case TransactionStatus.FAILED:
        return 'bg-red-500/10 text-red-400 border-l-4 border-red-500';
      default:
        return 'bg-slate-500/10 text-slate-400 border-l-4 border-slate-500';
    }
  };

  return (
    <div className={`p-4 rounded ${getStatusStyles(status)}`}>
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-3 ${
            status === TransactionStatus.COMPLETED
              ? 'bg-green-400'
              : status === TransactionStatus.PENDING
              ? 'bg-blue-400'
              : status === TransactionStatus.PAYOUT_CREATED
              ? 'bg-yellow-400'
              : status === TransactionStatus.FAILED
              ? 'bg-red-400'
              : 'bg-slate-400'
          }`}
        />
        <div>
          <div className="text-sm font-medium capitalize">{status}</div>
          <div className="text-xs opacity-70">
            {status === TransactionStatus.COMPLETED
              ? 'Transaction completed successfully'
              : status === TransactionStatus.PENDING
              ? 'Pending your payment to the deposit address'
              : status === TransactionStatus.PAYOUT_CREATED
              ? 'Payout created'
              : status === TransactionStatus.FAILED
              ? 'Transaction failed'
              : 'Transaction status unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionTracker;
