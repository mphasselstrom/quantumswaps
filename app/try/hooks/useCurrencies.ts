'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Currency, ApiCurrencyPair } from '../types';
import { getNetworkDisplayName } from '../utils/network';
import { logError } from '../utils/error';
import {
  fetchCurrencyInfo,
  fetchNetworkInfo,
  fetchCurrencyPairs,
} from '../utils/api';

export const useCurrencies = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [fromCurrencies, setFromCurrencies] = useState<Currency[]>([]);
  const [toCurrencies, setToCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedAmount, setRecommendedAmount] = useState<string>('0.1');

  const [isPairsLoading, setIsPairsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const pairsCache = useRef<Map<string, ApiCurrencyPair[]>>(new Map());

  const initialized = useRef(false);

  const loadToCurrencies = useCallback(
    async (pairs: ApiCurrencyPair[]) => {
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

        // Single currency info fetch
        const currenciesData = await fetchCurrencyInfo(
          Array.from(uniqueCurrencies)
        );
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
      defaultCurrency?: string,
      defaultNetwork?: string
    ) => {
      if (!pairs || !Array.isArray(pairs)) return;

      try {
        const uniqueCurrencies = new Set<string>();
        const uniqueNetworks = new Set<string>();

        pairs.forEach(pair => {
          if (pair.toCurrency) {
            uniqueCurrencies.add(pair.toCurrency.toLowerCase());
            uniqueNetworks.add(pair.toNetwork);
          }
        });

        const currenciesData = await fetchCurrencyInfo(
          Array.from(uniqueCurrencies)
        );
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

        // Set default FROM currency only if not already set
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
      if (!initialized.current) {
        initialized.current = true;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create cache keys for both directions
        const fromKey = `from-${fromCurrency}-${fromNetwork}`;
        const toKey = `to-${toCurrency || ''}-${toNetwork || ''}`;

        // Check cache for both sets of pairs
        let fromPairs = pairsCache.current.get(fromKey);
        let toPairs = pairsCache.current.get(toKey);

        // Fetch any uncached pairs in parallel
        const fetchPromises: Promise<any>[] = [];

        if (!fromPairs) {
          fetchPromises.push(
            fetchCurrencyPairs([fromCurrency], [fromNetwork]).then(data => {
              fromPairs = data.pairs;
              pairsCache.current.set(fromKey, data.pairs);
            })
          );
        }

        if (!toPairs) {
          fetchPromises.push(
            fetchCurrencyPairs([toCurrency || ''], [toNetwork || '']).then(
              data => {
                toPairs = data.pairs;
                pairsCache.current.set(toKey, data.pairs);
              }
            )
          );
        }

        // Wait for any necessary fetches to complete
        if (fetchPromises.length > 0) {
          await Promise.all(fetchPromises);
        }

        // Load currencies in parallel using cached pairs
        await Promise.all([
          loadFromCurrencies(fromPairs!, fromCurrency, fromNetwork),
          loadToCurrencies(toPairs!),
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
