export const API_ENDPOINTS = {
  CURRENCIES: '/api/currencies',
  NETWORKS: '/api/networks',
  CURRENCY_PAIRS: '/api/currency-pairs',
  QUOTE: '/api/swap/quote',
  EXECUTE: '/api/swap/execute',
};

export const WALLET_ERRORS = {
  NOT_CONNECTED: 'Wallet not connected',
  UNSUPPORTED_NETWORK: 'Unsupported network',
  TRANSACTION_FAILED: 'Transaction failed',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  USER_REJECTED: 'User rejected the transaction',
  NETWORK_ERROR: 'Network error occurred',
};

export const TRANSACTION_STATUSES = {
  CREATED: 'created',
  WAITING_CONFIRMATION: 'waiting_for_confirmation',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
};

export const NETWORKS = {
  SOLANA: 'sol',
  ETHEREUM: 'eth',
  BITCOIN: 'btc',
  POLYGON: 'matic',
  AVALANCHE: 'avaxc',
  BSC: 'bsc',
};

export const DEFAULT_QUOTE_EXPIRY = 60; // seconds
export const CONFIRMATION_TIMEOUT = 60000; // 60 seconds
export const POLLING_INTERVAL = 2000; // 2 seconds
