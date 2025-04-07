import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Currencies info API called');
    
    // Make the API call to the external service to get all available currencies
    const response = await fetch('https://ionut.moonpay.com/v1/currencies/currencies_info', {
      method: 'POST', // Despite being a GET request on our end, the external API expects POST
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
      },
      body: JSON.stringify({}), // Empty body as we're requesting all currencies
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
      
      return NextResponse.json(
        { error: `API request failed with status: ${response.status}`, details: errorDetails },
        { status: response.status }
      );
    }

    // Get the data from the response
    const data = await response.json();
    
    // Log a sample of the data to help debug
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample currency data:', data[0]);
      console.log(`Total currencies returned: ${data.length}`);
    } else {
      console.log('API returned unexpected data format:', data);
    }

    // Return the data from the external API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in currencies API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available currencies', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 