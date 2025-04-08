import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Currencies info API called');
    
    // Make the API call to the external service to get all available currencies
    // According to the API spec, we need to provide currencies and search parameters
    const response = await fetch('https://ionut.moonpay.com/v1/currencies/currencies_info', {
      method: 'POST', // Despite being a GET request on our end, the external API expects POST
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
      },
      // Include required parameters according to the API spec
      body: JSON.stringify({
        currencies: [], // Empty array to get all currencies
        search: "" // Empty string to avoid filtering
      }), 
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
      
      // Add fallback for SOL since we specifically need it
      const fallbackCurrencies = [
        {
          id: 'sol-sol',
          code: 'sol',
          name: 'Solana',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
          requiresExtraTag: false
        },
        {
          id: 'btc-btc',
          code: 'btc',
          name: 'Bitcoin',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png',
          requiresExtraTag: false
        },
        {
          id: 'eth-eth',
          code: 'eth',
          name: 'Ethereum',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/eth.png',
          requiresExtraTag: false
        }
      ];
      
      return NextResponse.json(fallbackCurrencies);
    }

    // Get the data from the response
    const data = await response.json();
    
    // Log a sample of the data to help debug
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample currency data:', data[0]);
      console.log(`Total currencies returned: ${data.length}`);
      
      // Check if SOL is in the returned currencies
      const hasSol = data.some(currency => currency.code.toLowerCase() === 'sol');
      console.log('SOL included in API response:', hasSol);
      
      // If SOL is not included, add it manually
      if (!hasSol) {
        console.log('Adding SOL manually since it was not found in the API response');
        data.push({
          id: 'sol-sol',
          code: 'sol',
          name: 'Solana',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
          requiresExtraTag: false
        });
      }
    } else {
      console.log('API returned unexpected data format:', data);
      
      // Provide fallback currencies if we received invalid data
      const fallbackCurrencies = [
        {
          id: 'sol-sol',
          code: 'sol',
          name: 'Solana',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
          requiresExtraTag: false
        },
        {
          id: 'btc-btc',
          code: 'btc',
          name: 'Bitcoin',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png',
          requiresExtraTag: false
        },
        {
          id: 'eth-eth',
          code: 'eth',
          name: 'Ethereum',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/eth.png',
          requiresExtraTag: false
        }
      ];
      
      return NextResponse.json(fallbackCurrencies);
    }

    // Return the data from the external API
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in currencies API route:', error);
    
    // Provide fallback currencies if an error occurs
    const fallbackCurrencies = [
      {
        id: 'sol-sol',
        code: 'sol',
        name: 'Solana',
        isEnabled: true,
        imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
        requiresExtraTag: false
      },
      {
        id: 'btc-btc',
        code: 'btc',
        name: 'Bitcoin',
        isEnabled: true,
        imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png',
        requiresExtraTag: false
      },
      {
        id: 'eth-eth',
        code: 'eth',
        name: 'Ethereum',
        isEnabled: true,
        imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/eth.png',
        requiresExtraTag: false
      }
    ];
    
    return NextResponse.json(
      fallbackCurrencies,
      { status: 200 }
    );
  }
} 