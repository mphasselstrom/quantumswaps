import { useState } from 'react';
import { TRANSACTION_STATUSES } from '../utils/constants';
import { logError } from '../utils/error';
import { useWallet } from '../context/WalletProvider';

export const useTransaction = () => {
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const [transactionData, setTransactionData] = useState<any>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connector } = useWallet();

  const executeTransaction = async (
    quoteSignature: string,
    recipientAddress: string,
    refundAddress: string
  ) => {
    try {
      setTransactionInProgress(true);
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/swap/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: quoteSignature,
          toWalletAddress: recipientAddress,
          refundWalletAddress: refundAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw errorData;
      }

      const executeData = await response.json();
      setTransactionData(executeData);
      setTransactionId(executeData.id);
      setTransactionStatus(TRANSACTION_STATUSES.CREATED);
      return executeData;
    } catch (err) {
      console.error('executeTransaction error:', err);
      const errorMessage = logError('executeTransaction', err);
      setError(errorMessage);
      throw err;
    } finally {
      setTransactionInProgress(false);
      setIsLoading(false);
    }
  };

  const sendTransaction = async (
    userAccount: string,
    amount: number,
    txData: any
  ) => {
    try {
      if (!connector) {
        throw new Error('Wallet not connected');
      }

      if (!txData?.depositAddress) {
        throw new Error('No transaction data available');
      }

      setTransactionStatus(TRANSACTION_STATUSES.WAITING_CONFIRMATION);
      setError(null);

      await connector.sendTransaction(amount, {
        id: txData.id,
        fromAmount: amount.toString(),
        depositAddress: txData.depositAddress,
        network: txData.fromNetwork,
        data: txData.data,
      });

      setTransactionStatus(TRANSACTION_STATUSES.SUCCESS);
    } catch (err) {
      const errorMessage = logError('sendTransaction', err);
      setError(errorMessage);
      setTransactionStatus(TRANSACTION_STATUSES.FAILED);
      throw err;
    }
  };

  const resetTransaction = () => {
    setTransactionInProgress(false);
    setTransactionId(null);
    setTransactionStatus(null);
    setTransactionData(null);
    setTransactionSignature(null);
    setError(null);
  };

  return {
    transactionInProgress,
    transactionId,
    transactionStatus,
    transactionData,
    transactionSignature,
    error,
    isLoading,
    executeTransaction,
    sendTransaction, // renamed from sendSolanaTransaction
    resetTransaction,
  };
};
