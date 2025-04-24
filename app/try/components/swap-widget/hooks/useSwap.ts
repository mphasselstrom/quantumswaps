import { useState, useCallback, useEffect, useRef } from 'react';
import { Currency } from '../../../types';
import { useQuote } from '../../../hooks/useQuote';
import { useTransaction } from '../../../hooks/useTransaction';
import { getRecommendedAmount } from '../../../utils/currency';

export function useSwap(
  fromCurrency: Currency | null,
  toCurrency: Currency | null,
  userAccount: string,
  isConnected: boolean
) {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [fromAddress, setFromAddress] = useState<string>('');
  const hasLoadedInitialAmount = useRef(false);

  const {
    quoteData,
    quoteLoading,
    quoteError,
    quoteSignature,
    getQuote,
    clearQuoteError,
  } = useQuote(fromCurrency, toCurrency, fromAmount, userAccount);

  const {
    transactionData,
    error: transactionError,
    executeTransaction,
    sendSolanaTransaction,
    clearTransactionError,
    resetTransaction,
  } = useTransaction();

  const clearErrors = useCallback(() => {
    clearQuoteError();
    clearTransactionError();
  }, [clearQuoteError, clearTransactionError]);

  const handleFromAmountChange = useCallback(
    (value: string) => {
      if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
        setFromAmount(value);
        if (value && value !== '.') {
          getQuote(value);
        }
      }
    },
    [getQuote]
  );

  const handleRecipientAddressChange = useCallback((value: string) => {
    setRecipientAddress(value);
  }, []);

  const handleFromAddressChange = useCallback((value: string) => {
    setFromAddress(value);
  }, []);

  const handleSwap = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !quoteSignature) return;

    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

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
        await sendSolanaTransaction(userAccount, amount, executeData);
      }
    } catch (err) {
      console.error('Swap execution failed:', err);
    }
  }, [
    fromCurrency,
    toCurrency,
    fromAmount,
    quoteSignature,
    recipientAddress,
    isConnected,
    fromAddress,
    userAccount,
    executeTransaction,
    sendSolanaTransaction,
  ]);

  const loadRecommendedAmount = useCallback(async () => {
    if (!hasLoadedInitialAmount.current && fromCurrency) {
      const recommendedAmount = await getRecommendedAmount(fromCurrency);
      setFromAmount(recommendedAmount);
      hasLoadedInitialAmount.current = true;
    }
  }, [fromCurrency, getQuote]);

  useEffect(() => {
    if (fromCurrency) {
      loadRecommendedAmount();
    }
  }, [fromCurrency, loadRecommendedAmount]);

  return {
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
    loadRecommendedAmount,
    sendSolanaTransaction,
    clearErrors,
    resetTransaction,
  };
}
