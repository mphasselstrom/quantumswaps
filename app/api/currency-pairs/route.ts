import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get request body from incoming request
    const body = await request.json();
    console.log('Currency-pairs API called with body:', body);

    // Validate the request body
    if (
      !body.fromCurrencies ||
      !Array.isArray(body.fromCurrencies) ||
      body.fromCurrencies.length === 0
    ) {
      console.error('Invalid request body - missing fromCurrencies array');
      return NextResponse.json(
        { error: 'fromCurrencies is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (
      !body.fromNetworks ||
      !Array.isArray(body.fromNetworks) ||
      body.fromNetworks.length === 0
    ) {
      console.error('Invalid request body - missing fromNetworks array');
      return NextResponse.json(
        { error: 'fromNetworks is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Add the optional parameters according to the API spec
    const requestBody = {
      ...body,
      toCurrencies: body.toCurrencies || [],
      toNetworks: body.toNetworks || [],
      search: body.search || '',
    };

    // Make the API call to the external service
    const response = await fetch('https://api.swaps.xyz/v1/currencies/pairs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      let errorDetails = '';

      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
        console.error('Error details:', errorData);
      } catch (parseError) {
        errorDetails = await response.text();
        console.error('Error response text:', errorDetails);
      }

      return NextResponse.json(
        { error: `API request failed: ${errorDetails}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in currency-pairs API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
