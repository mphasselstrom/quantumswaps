import { Currency, CurrencyInfo, Network } from '../types';
import { getNetworkDisplayName } from './network';
export const transformCurrency = (
  currencyInfo: CurrencyInfo,
  network: Network
): Currency => ({
  id: `${currencyInfo.code.toLowerCase()}-${network.code}`,
  name: currencyInfo.name,
  symbol: currencyInfo.code.toUpperCase(),
  network: network.code,
  networkName: getNetworkDisplayName(network.code),
  imageUrl: currencyInfo.imageUrl,
  extraIdName: currencyInfo.requiresExtraTag ? 'Tag' : undefined,
});

export const transformCurrencyWithNetworks = (
  currencyInfo: CurrencyInfo
): Currency[] => {
  return (
    currencyInfo.networks?.map(network =>
      transformCurrency(currencyInfo, network)
    ) || []
  );
};

export const getCurrencyImageUrl = (
  code: string,
  providedUrl?: string
): string => {
  if (providedUrl) return providedUrl;
  return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${code.toLowerCase()}.png`;
};

export const getRecommendedAmount = async (
  currency: Currency | null
): Promise<string> => {
  if (!currency) {
    return '0.1';
  }

  // Default values for common currencies (approximately $100 worth)
  let recommendedValue = '0.1'; // Default value

  switch (currency.symbol) {
    case 'BTC':
      recommendedValue = '0.0025'; // ~$100 in BTC
      break;
    case 'ETH':
      recommendedValue = '0.04'; // ~$100 in ETH
      break;
    case 'SOL':
      recommendedValue = '1'; // ~$100 in SOL
      break;
    case 'USDT':
    case 'USDC':
    case 'DAI':
      recommendedValue = '100'; // Stable coins
      break;
    case 'AVAX':
      recommendedValue = '3'; // ~$100 in AVAX
      break;
    case 'MATIC':
      recommendedValue = '100'; // ~$100 in MATIC
      break;
    case 'BNB':
      recommendedValue = '0.25'; // ~$100 in BNB
      break;
    default:
      // Try to get the price from CoinGecko for other tokens
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${currency.symbol.toLowerCase()}&vs_currencies=usd`
        );

        if (response.ok) {
          const data = await response.json();
          const tokenId = currency.symbol.toLowerCase();

          if (data[tokenId] && data[tokenId].usd) {
            const tokenPriceInUsd = data[tokenId].usd;
            recommendedValue = (100 / tokenPriceInUsd).toFixed(6);
          }
        }
      } catch (priceError) {
        // Silently fail and use default value
        console.warn('Failed to fetch price from CoinGecko:', priceError);
      }
  }
  return recommendedValue;
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
