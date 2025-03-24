// You will need to set the actual API key in your environment variables
const API_KEY = process.env.CHANGEHERO_API_KEY || 'your-api-key';
const API_URL = 'https://api.changehero.io/v2/';

export async function makeChangeHeroRequest(method: string, params: any = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'quantum-swap',
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making ChangeHero request:', error);
    throw error;
  }
}

export async function getSupportedCurrencies() {
  return makeChangeHeroRequest('getCurrenciesFull');
}

export async function getExchangeAmount(from: string, to: string, amount: string) {
  return makeChangeHeroRequest('getExchangeAmount', { from, to, amount });
}

export async function getMinAmount(from: string, to: string) {
  return makeChangeHeroRequest('getMinAmount', { from, to });
}

export async function createTransaction(
  from: string, 
  to: string, 
  address: string, 
  amount: string,
  extraId?: string,
  refundAddress?: string,
  refundExtraId?: string
) {
  const params: any = { from, to, address, amount };
  
  if (extraId) params.extraId = extraId;
  if (refundAddress) params.refundAddress = refundAddress;
  if (refundExtraId) params.refundExtraId = refundExtraId;
  
  return makeChangeHeroRequest('createTransaction', params);
} 