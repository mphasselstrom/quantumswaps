import { NextRequest, NextResponse } from 'next/server';
import { makeChangeHeroRequest } from '../changehe';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { action, params } = requestData;
    
    let result;
    
    switch (action) {
      case 'getCurrencies':
        result = await makeChangeHeroRequest('getCurrenciesFull');
        break;
      case 'getExchangeAmount':
        result = await makeChangeHeroRequest('getExchangeAmount', params);
        break;
      case 'getMinAmount':
        result = await makeChangeHeroRequest('getMinAmount', params);
        break;
      case 'createTransaction':
        result = await makeChangeHeroRequest('createTransaction', params);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
} 