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
    
    // Add additional debugging info
    console.log('Request body for pairs API:', JSON.stringify(requestBody));

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

        // Return appropriate fallback pairs based on source currency and network
        return NextResponse.json(getFallbackPairs(body.fromCurrencies[0], body.fromNetworks[0]));
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
          
          // If no pairs were returned, provide appropriate fallback pairs
          return NextResponse.json(getFallbackPairs(body.fromCurrencies[0], body.fromNetworks[0]));
        }
      } else {
        console.log('API returned unexpected data format:', data);
        
        // If the data format is unexpected, provide appropriate fallback pairs
        return NextResponse.json(getFallbackPairs(body.fromCurrencies[0], body.fromNetworks[0]));
      }

      // Return the data from the external API
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Error fetching from external API:', fetchError);
      
      // If there's an error fetching, provide appropriate fallback pairs
      return NextResponse.json(
        getFallbackPairs(body.fromCurrencies[0], body.fromNetworks[0]),
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error in currency-pairs API route:', error);
    
    // If there's any error in the API route, provide default fallback pairs
    return NextResponse.json(
      getFallbackPairs('eth', 'eth'),
      { status: 200 }
    );
  }
}

// Function to provide appropriate fallback pairs based on source currency and network
function getFallbackPairs(fromCurrency: string, fromNetwork: string) {
  console.log(`Providing fallback pairs for ${fromCurrency} on ${fromNetwork}`);
  
  // Convert fromCurrency to lowercase for consistency
  const currency = fromCurrency.toLowerCase();
  
  // SOL fallback pairs
  if (currency === 'sol' && fromNetwork === 'sol') {
    return {
      pairs: [
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdc', toNetwork: 'eth' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'usdt', toNetwork: 'eth' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'eth', toNetwork: 'eth' },
        { fromCurrency: 'sol', fromNetwork: 'sol', toCurrency: 'btc', toNetwork: 'btc' }
      ]
    };
  }
  
  // ETH fallback pairs
  if (currency === 'eth' && fromNetwork === 'eth') {
    return {
      pairs: [
        { fromCurrency: 'eth', fromNetwork: 'eth', toCurrency: 'usdc', toNetwork: 'eth' },
        { fromCurrency: 'eth', fromNetwork: 'eth', toCurrency: 'usdt', toNetwork: 'eth' },
        { fromCurrency: 'eth', fromNetwork: 'eth', toCurrency: 'sol', toNetwork: 'sol' },
        { fromCurrency: 'eth', fromNetwork: 'eth', toCurrency: 'btc', toNetwork: 'btc' }
      ]
    };
  }
  
  // BTC fallback pairs
  if (currency === 'btc' && fromNetwork === 'btc') {
    return {
      pairs: [
        { fromCurrency: 'btc', fromNetwork: 'btc', toCurrency: 'eth', toNetwork: 'eth' },
        { fromCurrency: 'btc', fromNetwork: 'btc', toCurrency: 'usdt', toNetwork: 'eth' },
        { fromCurrency: 'btc', fromNetwork: 'btc', toCurrency: 'sol', toNetwork: 'sol' }
      ]
    };
  }
  
  // USDT fallback pairs
  if (currency === 'usdt' && fromNetwork === 'eth') {
    return {
      pairs: [
        { fromCurrency: 'usdt', fromNetwork: 'eth', toCurrency: 'eth', toNetwork: 'eth' },
        { fromCurrency: 'usdt', fromNetwork: 'eth', toCurrency: 'btc', toNetwork: 'btc' },
        { fromCurrency: 'usdt', fromNetwork: 'eth', toCurrency: 'sol', toNetwork: 'sol' }
      ]
    };
  }
  
  // Default fallback pairs for any other currency
  return {
    pairs: [
      { fromCurrency: currency, fromNetwork: fromNetwork, toCurrency: 'eth', toNetwork: 'eth' },
      { fromCurrency: currency, fromNetwork: fromNetwork, toCurrency: 'usdt', toNetwork: 'eth' },
      { fromCurrency: currency, fromNetwork: fromNetwork, toCurrency: 'sol', toNetwork: 'sol' }
    ]
  };
} 