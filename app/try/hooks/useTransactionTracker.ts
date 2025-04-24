import { useState, useEffect, useRef } from 'react';
import { TransactionData, TransactionStatus } from '../types';

export const useTransactionTracker = (transactionId: string) => {
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const getTransactionData = async (id: string) => {
    try {
      const response = await fetch(`/api/swap/status`, {
        method: 'POST',
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      setTransactionData(data);
      return data;
    } catch (error) {
      console.error('Error fetching transaction status:', error);
    }
  };

  // Start polling when transactionId is set
  useEffect(() => {
    if (!transactionId) return;

    // Initial fetch
    getTransactionData(transactionId);

    // Set up polling every minute
    pollingInterval.current = setInterval(() => {
      getTransactionData(transactionId);
    }, 60000); // 60000ms = 1 minute

    // Cleanup function to clear interval when component unmounts
    // or when transactionId changes
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [transactionId]);

  // Stop polling when transaction is in a final state
  useEffect(() => {
    if (
      transactionData?.status === TransactionStatus.COMPLETED ||
      transactionData?.status === TransactionStatus.FAILED
    ) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }
  }, [transactionData?.status]);

  return {
    transactionData,
  };
};
