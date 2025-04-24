import { NextResponse } from 'next/server';
import { cache } from 'react';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Currency-pairs API called with body:', body);

    const requestBody = {
      fromCurrency: body.fromCurrency || '',
      fromNetwork: body.fromNetwork || '',
    };

    // Only make the request if we have valid parameters
    if (!requestBody.fromCurrency || !requestBody.fromNetwork) {
      return NextResponse.json({ pairs: [] });
    }

    // Add timeout to fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch(
        'https://api.swaps.xyz/v1/currencies/pairs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      return NextResponse.json(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error in currency-pairs API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
