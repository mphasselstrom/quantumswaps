import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      'https://api.swaps.xyz/v1/currencies/networks_info',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
}
