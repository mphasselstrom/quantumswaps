export interface ChangeHeroCurrency {
  name: string; // Ticker symbol (e.g., "btc")
  fullName: string; // Full name (e.g., "Bitcoin")
  enabled: boolean;
  fixRateEnabled: boolean;
  extraIdName?: string; // Type of tag/memo, if applicable
  image: string; // URL to currency logo
  inboundEnabled: boolean;
  outboundEnabled: boolean;
  blockchain?: string;
  network?: string;
  networkFee?: string;
  protocol?: string;
  contractAddress?: string;
}

export interface ChangeHeroExchangeAmount {
  jsonrpc: string;
  id: string;
  result: string; // Estimated amount
}

export interface ChangeHeroMinAmount {
  jsonrpc: string;
  id: string;
  result: string; // Minimum amount
}

export interface ChangeHeroTransaction {
  id: string;
  status: string;
  currencyFrom: string;
  currencyTo: string;
  payinAddress: string;
  payinExtraId: string | null;
  payoutAddress: string;
  payoutExtraId: string | null;
  amountExpectedFrom: string;
  amountExpectedTo: string;
  createdAt: string;
}

export interface ChangeHeroResponse<T> {
  jsonrpc: string;
  id: string;
  result: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network: string;
  extraIdName?: string;
  contractAddress?: string;
} 