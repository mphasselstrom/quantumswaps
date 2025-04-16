import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get request body from incoming request
    const body = await request.json();
    console.log('Currency-pairs API called with body:', body);

    // Validate the request body
    if (!body.fromCurrencies || !Array.isArray(body.fromCurrencies) || body.fromCurrencies.length === 0) {
      console.error('Invalid request body - missing fromCurrencies array');
      return NextResponse.json(
        { error: 'fromCurrencies is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!body.fromNetworks || !Array.isArray(body.fromNetworks) || body.fromNetworks.length === 0) {
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
      search: body.search || ""
    };

    // Log if we're looking for SOL pairs
    const isSearchingForSol = body.fromCurrencies.some((currency: string) => currency.toLowerCase() === 'sol');
    console.log('Searching for SOL pairs:', isSearchingForSol);

    // Make the API call to the external service
    try {
      const response = await fetch('https://api.swaps.xyz/v1/currencies/pairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
        },
        body: JSON.stringify(requestBody),
      });

      // If the response is not ok, attempt to parse error details
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

        // If we're searching for SOL pairs, provide fallback pairs
        if (isSearchingForSol) {
          console.log('Providing fallback SOL pairs');
          const fallbackPairs = {
            pairs: [
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'sol' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'sol' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'eth' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'eth' }
            ]
          };
          return NextResponse.json(fallbackPairs);
        }
        
        return NextResponse.json(
          { error: `API request failed with status: ${response.status}`, details: errorDetails },
          { status: response.status }
        );
      }

      // Get the data from the response
      const data = await response.json();
      
      // Log a sample of the data to help debug
      if (data && data.pairs && Array.isArray(data.pairs)) {
        console.log(`Currency pairs returned: ${data.pairs.length}`);
        if (data.pairs.length > 0) {
          console.log('Sample pair:', data.pairs[0]);
        } else {
          console.log('No pairs returned from API. Providing fallback pairs.');
          
          // If no pairs were returned but we're searching for SOL, provide fallback pairs
          if (isSearchingForSol) {
            const fallbackPairs = {
              pairs: [
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'sol' },
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'sol' },
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' },
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'eth' },
                { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'eth' }
              ]
            };
            return NextResponse.json(fallbackPairs);
          }
        }
      } else {
        console.log('API returned unexpected data format:', data);
        
        // If the data format is unexpected but we're searching for SOL, provide fallback pairs
        if (isSearchingForSol) {
          const fallbackPairs = {
            pairs: [
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'sol' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'sol' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'eth' },
              { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'eth' }
            ]
          };
          return NextResponse.json(fallbackPairs);
        }
      }

      // Return the data from the external API
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Error fetching from external API:', fetchError);
      
      // If we're searching for SOL pairs, provide fallback pairs
      if (isSearchingForSol) {
        console.log('Providing fallback SOL pairs due to fetch error');
        const fallbackPairs = {
          pairs: [
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'sol' },
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'sol' },
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' },
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'eth' },
            { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'eth' }
          ]
        };
        return NextResponse.json(fallbackPairs);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch from external API', details: fetchError.message || String(fetchError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in currency-pairs API route:', error);
    
    // If there's any error in the API route, provide generic fallback pairs
    const fallbackPairs = {
      pairs: [
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'sol' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'sol' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' }
      ]
    };
    
    return NextResponse.json(
      fallbackPairs,
      { status: 200 }
    );
  }
} 