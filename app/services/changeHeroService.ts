// Service for handling ChangeHero API calls
async function callChangeHeroApi(action: string, params?: any) {
  try {
    const response = await fetch('/api/changehero', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        params
      }),
    });

    if (!response.ok) {
      throw new Error(`API error, status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling ChangeHero API:', error);
    throw error;
  }
}

export async function getCurrencies() {
  const response = await callChangeHeroApi('getCurrencies');
  return response;
}

export async function getExchangeAmount(from: string, to: string, amount: string) {
  const response = await callChangeHeroApi('getExchangeAmount', { from, to, amount });
  return response;
}

export async function getMinAmount(from: string, to: string) {
  const response = await callChangeHeroApi('getMinAmount', { from, to });
  return response;
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
  
  const response = await callChangeHeroApi('createTransaction', params);
  return response;
} 