import { Currency, CurrencyInfo } from '../types';
import { getNetworkDisplayName } from './network';

export const transformCurrency = (
  currencyInfo: CurrencyInfo,
  network: string
): Currency => ({
  id: `${currencyInfo.code.toLowerCase()}-${network}`,
  name: currencyInfo.name || currencyInfo.code.toUpperCase(),
  symbol: currencyInfo.code.toUpperCase(),
  network,
  networkName: getNetworkDisplayName(network),
  imageUrl: getCurrencyImageUrl(currencyInfo.code, currencyInfo.imageUrl),
  extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
});

export const getCurrencyImageUrl = (
  code: string,
  providedUrl?: string
): string => {
  if (providedUrl) return providedUrl;
  return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code.toLowerCase()}.png`;
};

export const getRecommendedAmount = (symbol: string): string => {
  const recommendedAmounts: { [key: string]: string } = {
    BTC: '0.0025', // ~$100 in BTC
    ETH: '0.04', // ~$100 in ETH
    SOL: '1', // ~$100 in SOL
    USDT: '100', // Stablecoins
    USDC: '100', // Stablecoins
    DAI: '100', // Stablecoins
    AVAX: '3', // ~$100 in AVAX
    MATIC: '100', // ~$100 in MATIC
    BNB: '0.25', // ~$100 in BNB
  };

  return recommendedAmounts[symbol] || '0.1';
};

export const formatCurrencyAmount = (
  amount: number | string,
  decimals: number = 8
): string => {
  return Number(amount).toFixed(decimals);
};

export const getUniqueCurrenciesAndNetworks = (pairs: any[]) => {
  const uniqueCurrencies = new Set<string>();
  const uniqueNetworks = new Set<string>();

  pairs.forEach(pair => {
    if (pair.toCurrency) {
      uniqueCurrencies.add(pair.toCurrency.toLowerCase());
      uniqueNetworks.add(pair.toNetwork);
    }
  });

  return {
    currencies: Array.from(uniqueCurrencies),
    networks: Array.from(uniqueNetworks),
  };
};
