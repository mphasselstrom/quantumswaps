import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get request body from incoming request
    const body = await request.json();

    // Make the API call to the external service
    const response = await fetch('https://c097-2a09-bac1-60a0-260-00-3cc-68.ngrok-free.app/v1/currencies/pairs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
      },
      body: JSON.stringify(body),
      // Setting the mode to no-cors won't help here as it's server-side
      // This is just for documentation of what happens client-side
      // mode: 'no-cors'
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed with status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the data from the response
    const data = await response.json();

    // Return the data from the external API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in currency-pairs API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency pairs' },
      { status: 500 }
    );
  }
} 