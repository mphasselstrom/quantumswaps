import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Sending status request with body:', body);

    const response = await fetch('https://api.swaps.xyz/v1/swap/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Status API error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Status API response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
