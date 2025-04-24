import { Currency, SwapQuoteRequest } from '../types';

export async function fetchCurrencyInfo(currencies?: string[]) {
  const response = await fetch('/api/currencies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currencies }),
  });
  return response.json();
}

export async function fetchNetworkInfo(networks?: string[]) {
  const response = await fetch('/api/networks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ networks }),
  });
  return response.json();
}

export async function fetchCurrencyPairs(currency: string, network: string) {
  const response = await fetch('/api/currency-pairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromCurrency: currency,
      fromNetwork: network,
    }),
  });
  return response.json();
}

export async function fetchQuote(request: SwapQuoteRequest) {
  const response = await fetch('/api/swap/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.json();
}
