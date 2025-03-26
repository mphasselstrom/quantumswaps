import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get request body from incoming request
    const body = await request.json();

    console.log('Sending execute request with body:', body);

    // Make the API call to the external service
    const response = await fetch('https://edc8-2a09-bac1-60a0-260-00-3cc-3c.ngrok-free.app/v1/swap/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Execute API error response:', errorText);
      
      try {
        // Try to parse as JSON to get structured error
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (parseError) {
        // If can't parse, return as text
        return NextResponse.json(
          { error: `Execute API request failed with status: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }
    }

    // Get the data from the response
    const data = await response.json();
    console.log('Execute API response:', data);

    // Return the data from the external API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in swap execute API route:', error);
    return NextResponse.json(
      { error: 'Failed to execute swap transaction' },
      { status: 500 }
    );
  }
} 