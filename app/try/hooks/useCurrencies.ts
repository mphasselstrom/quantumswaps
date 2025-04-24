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

  // New function to fetch currency info once for both FROM and TO currencies
  const fetchToCurrencyInfo = async (pairs: ApiCurrencyPair[]) => {
    const uniqueCurrencies = new Set<string>();

    // Collect unique currencies from both sets of pairs
    pairs.forEach(pair => {
      if (pair.toCurrency) {
        uniqueCurrencies.add(pair.toCurrency.toLowerCase());
      }
    });
    const currenciesData = await fetchCurrencyInfo(
      Array.from(uniqueCurrencies)
    );
    return currenciesData;
  };

  const loadToCurrencies = useCallback(
    async (pairs: ApiCurrencyPair[], currenciesData: any[]) => {
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

        // Transform currencies but only include networks that are in our pairs
        const toCurrenciesList: Currency[] = currenciesData.flatMap(
          currencyInfo => {
            const availableNetworks = availableNetworksByCurrency.get(
              currencyInfo.code.toLowerCase()
            );
            if (!availableNetworks) return [];

            // Filter networks to only those available in pairs
            const filteredCurrencyInfo = {
              ...currencyInfo,
              networks: currencyInfo.networks.filter(network =>
                availableNetworks.has(network.code)
              ),
            };

            return transformCurrencyWithNetworks(filteredCurrencyInfo);
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
        const currenciesData = await fetchCurrencyInfo();
        const fromCurrenciesList: Currency[] = currenciesData.flatMap(
          currencyInfo => transformCurrencyWithNetworks(currencyInfo)
        );

        setFromCurrencies(fromCurrenciesList);

        if (!fromCurrency && fromCurrenciesList.length > 0) {
          const defaultFromCurrency =
            fromCurrenciesList.find(
              c =>
                c.symbol.toLowerCase() === defaultCurrency &&
                c.network.toLowerCase() === defaultNetwork
            ) || fromCurrenciesList[0];
          console.log('defaultFromCurrency', defaultFromCurrency);
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
      toCurrency,
      toNetwork,
      fromCurrency,
      fromNetwork,
    }: {
      toCurrency?: string;
      toNetwork?: string;
      fromCurrency: string;
      fromNetwork: string;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        // Make a single API call with all currencies and networks
        const pairsData = await fetchCurrencyPairs(fromCurrency, fromNetwork);

        const toPairs = pairsData.pairs;

        // Process currencies as before
        const currenciesData = await fetchToCurrencyInfo(toPairs);

        await Promise.all([
          loadFromCurrencies(fromCurrency, fromNetwork),
          loadToCurrencies(toPairs, currenciesData),
        ]);
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
