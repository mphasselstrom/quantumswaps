'use client';

import { useState, useCallback, useRef } from 'react';
import { Currency, ApiCurrencyPair } from '../types';
import { logError } from '../utils/error';
import { fetchCurrencyInfo, fetchCurrencyPairs } from '../utils/api';
import { transformCurrencyWithNetworks } from '../utils/currency';

export const useCurrencies = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [fromCurrencies, setFromCurrencies] = useState<Currency[]>([]);
  const [toCurrencies, setToCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedAmount, setRecommendedAmount] = useState<string>('0.1');
  const allCurrencies = useRef<Currency[]>([]);

  const loadToCurrencies = useCallback(
    async (pairs: ApiCurrencyPair[]) => {
      if (!pairs || !Array.isArray(pairs)) return;

      try {
        // Create a map of currency code to available networks from pairs
        const availableNetworksByCurrency = new Map<string, Set<string>>();
        pairs.forEach(pair => {
          if (!pair.toCurrency) return;
          const code = pair.toCurrency.toLowerCase();
          if (!availableNetworksByCurrency.has(code)) {
            availableNetworksByCurrency.set(code, new Set());
          }
          availableNetworksByCurrency.get(code)?.add(pair.toNetwork);
        });

        // Filter all currencies to only include those with available networks
        const toCurrenciesList: Currency[] = allCurrencies.current.filter(
          currency => {
            const availableNetworks = availableNetworksByCurrency.get(
              currency.symbol.toLowerCase()
            );
            return availableNetworks && availableNetworks.has(currency.network);
          }
        );

        setToCurrencies(toCurrenciesList);

        // Set default TO currency only if not already set
        if (!toCurrency && toCurrenciesList.length > 0) {
          const defaultToCurrency =
            toCurrenciesList.find(
              c =>
                c.symbol.toLowerCase() === 'eth' &&
                c.network.toLowerCase() === 'eth'
            ) || toCurrenciesList[0];
          setToCurrency(defaultToCurrency);
        }
      } catch (err) {
        logError('loadToCurrencies', err);
      }
    },
    [toCurrency]
  );

  const loadFromCurrencies = useCallback(
    async (defaultCurrency?: string, defaultNetwork?: string) => {
      try {
        if (allCurrencies.current.length === 0) {
          const currenciesData = await fetchCurrencyInfo();
          allCurrencies.current = currenciesData.flatMap(currencyInfo =>
            transformCurrencyWithNetworks(currencyInfo)
          );
        }

        setFromCurrencies(allCurrencies.current);

        if (!fromCurrency && allCurrencies.current.length > 0) {
          const defaultFromCurrency =
            allCurrencies.current.find(
              c =>
                c.symbol.toLowerCase() === defaultCurrency &&
                c.network.toLowerCase() === defaultNetwork
            ) || allCurrencies.current[0];
          setFromCurrency(defaultFromCurrency);
        }
      } catch (err) {
        logError('loadFromCurrencies', err);
      }
    },
    [fromCurrency]
  );

  const loadCurrencies = useCallback(
    async ({
      fromCurrency,
      fromNetwork,
    }: {
      fromCurrency: string;
      fromNetwork: string;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        // Make a single API call with all currencies and networks
        const pairsData = await fetchCurrencyPairs(fromCurrency, fromNetwork);
        const toPairs = pairsData.pairs;

        await loadFromCurrencies(fromCurrency, fromNetwork);
        loadToCurrencies(toPairs);
      } catch (err) {
        const errorMessage = logError('loadCurrencies', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromCurrencies, loadToCurrencies]
  );

  const swapCurrencies = useCallback(() => {
    if (fromCurrency && toCurrency) {
      const canSwap = fromCurrencies.some(c => c.id === toCurrency.id);

      if (canSwap) {
        const oldFromCurrency = fromCurrency;
        setFromCurrency(toCurrency);

        if (toCurrencies.some(c => c.id === oldFromCurrency.id)) {
          setToCurrency(oldFromCurrency);
        }
      } else {
        setError(
          `${toCurrency.symbol} on ${toCurrency.network} is not available as a source currency`
        );
      }
    }
  }, [fromCurrency, toCurrency, fromCurrencies, toCurrencies]);

  return {
    fromCurrency,
    toCurrency,
    fromCurrencies,
    toCurrencies,
    isLoading,
    error,
    recommendedAmount,
    setFromCurrency,
    setToCurrency,
    loadCurrencies,
    swapCurrencies,
  };
};
