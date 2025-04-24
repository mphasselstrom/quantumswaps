import { NextResponse } from 'next/server';

// Simple in-memory cache with 30-minute expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Currency-pairs API called with body:', body);

    const requestBody = {
      fromCurrencies: Array.from(new Set([...(body.fromCurrencies || [])])),
      fromNetworks: Array.from(new Set([...(body.fromNetworks || [])])),
      search: body.search || '',
    };

    // Generate cache key from request body
    const cacheKey = JSON.stringify(requestBody);
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Only make the request if we have valid parameters
    if (
      !requestBody.fromCurrencies.length ||
      !requestBody.fromNetworks.length
    ) {
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

      // Update cache
      cache.set(cacheKey, { data, timestamp: now });

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
