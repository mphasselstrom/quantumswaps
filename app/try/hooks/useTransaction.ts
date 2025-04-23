import { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { HELIUS_RPC_ENDPOINT } from '../utils/network';
import { TRANSACTION_STATUSES } from '../utils/constants';
import {
  createSolanaTransaction,
  getTransactionStatus,
} from '../utils/transaction';
import { logError } from '../utils/error';

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

  const sendSolanaTransaction = async (
    userAccount: string,
    amount: number,
    txData: any
  ) => {
    try {
      if (!window.solana?.isPhantom) {
        throw new Error('Phantom wallet not detected');
      }

      if (!txData?.depositAddress) {
        throw new Error('No transaction data available');
      }

      setTransactionStatus(TRANSACTION_STATUSES.WAITING_CONFIRMATION);
      setError(null);

      const connection = new Connection(HELIUS_RPC_ENDPOINT, 'confirmed');

      // Check balance before proceeding
      const balance = await connection.getBalance(new PublicKey(userAccount));
      const requiredAmount = amount * LAMPORTS_PER_SOL; // Convert SOL to lamports

      if (balance < requiredAmount && txData.fromCurrency === 'sol') {
        throw new Error(
          `Insufficient ${txData.fromCurrency.toUpperCase()} balance. You need at least ${amount} ${txData.fromCurrency.toUpperCase()} to complete this transaction.`
        );
      }

      const transaction = await createSolanaTransaction(
        userAccount,
        txData.depositAddress,
        amount
      );

      try {
        const signedTransaction = await window.solana.signTransaction(
          transaction
        );
        setTransactionStatus(TRANSACTION_STATUSES.PROCESSING);

        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          }
        );
        setTransactionSignature(signature);

        // Poll for confirmation
        const confirmationInterval = setInterval(async () => {
          try {
            const status = await getTransactionStatus(signature);
            if (status === 'confirmed') {
              clearInterval(confirmationInterval);
              setTransactionStatus(TRANSACTION_STATUSES.SUCCESS);
            }
          } catch (err) {
            console.error('Error checking confirmation:', err);
          }
        }, 2000);

        // Set timeout
        setTimeout(() => {
          clearInterval(confirmationInterval);
          if (transactionStatus !== TRANSACTION_STATUSES.SUCCESS) {
            setTransactionStatus(TRANSACTION_STATUSES.PENDING);
          }
        }, 60000);
      } catch (err: any) {
        if (err.name === 'SendTransactionError') {
          const errorMessage =
            'Transaction failed. Please make sure you have enough SOL to cover the amount plus network fees.';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        throw err;
      }
    } catch (err) {
      const errorMessage = logError('sendSolanaTransaction', err);
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
    executeTransaction,
    sendSolanaTransaction,
    resetTransaction,
  };
};
