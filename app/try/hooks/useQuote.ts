import { useState, useEffect } from 'react';
import { SwapQuoteRequest, SwapQuoteResponse, Currency } from '../types';
import { fetchQuote } from '../utils/api';
import { formatApiError } from '../utils/error';

export const useQuote = (
  fromCurrency: Currency | null,
  toCurrency: Currency | null,
  fromAmount: string,
  userAccount: string
) => {
  const [quoteData, setQuoteData] = useState<SwapQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSignature, setQuoteSignature] = useState<string | null>(null);

  const getQuote = async (amount: string) => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const walletAddress = userAccount || 'DummyUserAddress123456789';

    try {
      setQuoteLoading(true);
      setQuoteError(null);

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

      const data = await fetchQuote(quoteRequest);

      if (data.signature) {
        setQuoteSignature(data.signature);
      }

      if (
        !data.networkFee ||
        data.networkFee === '0' ||
        data.networkFee === ''
      ) {
        data.networkFee = (parseFloat(amount) * 0.001).toFixed(8);
      }

      setQuoteData(data);
    } catch (err) {
      const errorMessage = formatApiError(err);
      setQuoteError(errorMessage);
      setQuoteData(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        getQuote(fromAmount);
      } else {
        setQuoteData(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromCurrency, toCurrency, userAccount]);

  return {
    quoteData,
    quoteLoading,
    quoteError,
    quoteSignature,
    getQuote,
  };
};
