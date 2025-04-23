'use client';

import { useState, useCallback, useRef } from 'react';
import { Currency, ApiCurrencyPair } from '../types';
import { getNetworkDisplayName } from '../utils/network';
import { logError } from '../utils/error';
import { fetchCurrencyInfo, fetchCurrencyPairs } from '../utils/api';

export const useCurrencies = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [fromCurrencies, setFromCurrencies] = useState<Currency[]>([]);
  const [toCurrencies, setToCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedAmount, setRecommendedAmount] = useState<string>('0.1');

  // Add back the pairs cache
  const pairsCache = useRef<Map<string, ApiCurrencyPair[]>>(new Map());

  // New function to fetch currency info once for both FROM and TO currencies
  const fetchCombinedCurrencyInfo = async (
    fromPairs: ApiCurrencyPair[],
    toPairs: ApiCurrencyPair[]
  ) => {
    const uniqueCurrencies = new Set<string>();

    // Collect unique currencies from both sets of pairs
    [...fromPairs, ...toPairs].forEach(pair => {
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
        // Process pairs to currencies only once
        const uniqueCurrencies = new Set<string>();
        const uniqueNetworks = new Set<string>();

        pairs.forEach(pair => {
          if (pair.toCurrency) {
            uniqueCurrencies.add(pair.toCurrency.toLowerCase());
            uniqueNetworks.add(pair.toNetwork);
          }
        });

        const toCurrenciesMap = new Map<string, Currency>();

        // Process all pairs at once
        pairs.forEach(pair => {
          if (!pair.toCurrency) return;

          const currencyId = `${pair.toCurrency.toLowerCase()}-${
            pair.toNetwork
          }`;

          if (!toCurrenciesMap.has(currencyId)) {
            const code = pair.toCurrency.toLowerCase();
            const currencyInfo = currenciesData.find(
              (c: any) => c.code.toLowerCase() === code
            );

            if (currencyInfo) {
              toCurrenciesMap.set(currencyId, {
                id: currencyId,
                name: currencyInfo.name || code.toUpperCase(),
                symbol: code.toUpperCase(),
                network: pair.toNetwork,
                networkName: getNetworkDisplayName(pair.toNetwork),
                imageUrl:
                  currencyInfo.imageUrl ||
                  `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code}.png`,
                extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
              });
            }
          }
        });

        const toCurrenciesList = Array.from(toCurrenciesMap.values());
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
    async (
      pairs: ApiCurrencyPair[],
      currenciesData: any[],
      defaultCurrency?: string,
      defaultNetwork?: string
    ) => {
      if (!pairs || !Array.isArray(pairs)) return;

      try {
        const fromCurrenciesMap = new Map<string, Currency>();

        pairs.forEach(pair => {
          if (!pair.toCurrency) return;

          const currencyId = `${pair.toCurrency.toLowerCase()}-${
            pair.toNetwork
          }`;

          if (!fromCurrenciesMap.has(currencyId)) {
            const code = pair.toCurrency.toLowerCase();
            const currencyInfo = currenciesData.find(
              (c: any) => c.code.toLowerCase() === code
            );

            if (currencyInfo) {
              fromCurrenciesMap.set(currencyId, {
                id: currencyId,
                name: currencyInfo.name || code.toUpperCase(),
                symbol: code.toUpperCase(),
                network: pair.toNetwork,
                networkName: getNetworkDisplayName(pair.toNetwork),
                imageUrl:
                  currencyInfo.imageUrl ||
                  `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code}.png`,
                extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
              });
            }
          }
        });

        const fromCurrenciesList = Array.from(fromCurrenciesMap.values());
        setFromCurrencies(fromCurrenciesList);

        if (!fromCurrency && fromCurrenciesList.length > 0) {
          const defaultFromCurrency =
            fromCurrenciesList.find(
              c =>
                c.symbol.toLowerCase() === defaultCurrency &&
                c.network.toLowerCase() === defaultNetwork
            ) || fromCurrenciesList[0];
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
        const pairsData = await fetchCurrencyPairs(
          [fromCurrency, toCurrency].filter(Boolean) as string[],
          [fromNetwork, toNetwork].filter(Boolean) as string[]
        );

        // Split the pairs for FROM and TO processing
        const fromPairs = pairsData.pairs.filter(
          pair =>
            pair.fromCurrency?.toLowerCase() === fromCurrency &&
            pair.fromNetwork === fromNetwork
        );

        const toPairs = pairsData.pairs.filter(
          pair =>
            (!toCurrency || pair.fromCurrency?.toLowerCase() === toCurrency) &&
            (!toNetwork || pair.fromNetwork === toNetwork)
        );

        // Process currencies as before
        const currenciesData = await fetchCombinedCurrencyInfo(
          fromPairs,
          toPairs
        );

        await Promise.all([
          loadFromCurrencies(
            fromPairs,
            currenciesData,
            fromCurrency,
            fromNetwork
          ),
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
