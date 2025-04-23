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

  const initialized = useRef(false);

  const loadToCurrencies = useCallback(
    async (pairs: ApiCurrencyPair[]) => {
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
        const toCurrenciesMap = new Map<string, Currency>();

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

        if (!toCurrency) {
          const defaultToCurrency =
            toCurrenciesList.find(
              c =>
                c.symbol.toLowerCase() === 'eth' &&
                c.network.toLowerCase() === 'eth'
            ) || toCurrenciesList[0];

          if (defaultToCurrency) {
            setToCurrency(defaultToCurrency);
          }
        }
      } catch (err) {
        logError('loadToCurrencies', err);
      }
    },
    [toCurrency]
  );

  const loadCurrencies = useCallback(
    async (currencies: string[], networks: string[]) => {
      if (!initialized.current) {
        initialized.current = true;
      } else if (!fromCurrency) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [currenciesData, networksData, pairsData] = await Promise.all([
          fetchCurrencyInfo(currencies),
          fetchNetworkInfo(networks),
          fetchCurrencyPairs(currencies, networks),
        ]);

        const transformedCurrencies: Currency[] = currenciesData.map(
          (currencyInfo: any) => ({
            id: currencyInfo.id,
            name: currencyInfo.name || currencyInfo.code.toUpperCase(),
            symbol: currencyInfo.code.toUpperCase(),
            network: networksData[0].name || networksData[0].code,
            networkName: getNetworkDisplayName(
              networksData[0].name || networksData[0].code
            ),
            imageUrl:
              currencyInfo.imageUrl ||
              `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${currencyInfo.code.toLowerCase()}.png`,
            extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
          })
        );

        setFromCurrencies(transformedCurrencies);
        if (!fromCurrency && transformedCurrencies.length > 0) {
          const newFromCurrency = transformedCurrencies[0];
          setFromCurrency(newFromCurrency);
        }

        await loadToCurrencies(pairsData.pairs);
        return transformedCurrencies;
      } catch (err) {
        const errorMessage = logError('loadCurrencies', err);
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [fromCurrency, loadToCurrencies]
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
