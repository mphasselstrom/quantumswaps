import { NextResponse } from 'next/server';

// Simple in-memory cache with 30-minute expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate cache key from request body
    const cacheKey = JSON.stringify(body);
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Add timeout to fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch(
        'https://api.swaps.xyz/v1/currencies/currencies_info',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI',
          },
          body: JSON.stringify(body),
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
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}
