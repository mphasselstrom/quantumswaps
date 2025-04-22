import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Currencies info API called');
    
    // This array will hold all currencies from all pagination requests
    let allCurrencies: any[] = [];
    let currentPage = 0;
    const pageSize = 500;
    let hasMoreData = true;

    // Make multiple requests to get all currencies if the API is paginated
    while (hasMoreData) {
      console.log(`Fetching currencies page ${currentPage} with limit ${pageSize}`);
      
      // Make the API call to the external service to get currencies with pagination
      const response = await fetch('https://api.swaps.xyz/v1/currencies/currencies_info', {
        method: 'POST', // Despite being a GET request on our end, the external API expects POST
        headers: {
          'Content-Type': 'application/json',
          'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
        },
        // Include required parameters according to the API spec
        body: JSON.stringify({
          currencies: [], // Empty array to get all currencies
          search: "", // Empty string to avoid filtering
          // Pagination parameters
          limit: pageSize,
          offset: currentPage * pageSize,
          // Additional parameters that might help
          page: currentPage,
          perPage: pageSize
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
        
        // Break the loop if we encounter an error
        break;
      }

      // Get the data from the response
      const responseData = await response.json();
      console.log('API Response:', typeof responseData, Array.isArray(responseData) ? 'is array' : 'not array');
      
      // Handle different response formats - check if the response might be paginated
      let pageData: any[] = [];
      
      if (Array.isArray(responseData)) {
        // The response is directly an array of currencies
        pageData = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // The response might be a paginated object
        // Check for common pagination fields
        if (responseData.data && Array.isArray(responseData.data)) {
          console.log('Found data array in paginated response');
          pageData = responseData.data;
          
          // Check if we have pagination information
          if (responseData.hasMore !== undefined) {
            hasMoreData = responseData.hasMore;
          } else if (responseData.has_more !== undefined) {
            hasMoreData = responseData.has_more;
          } else if (responseData.pagination && responseData.pagination.hasMore !== undefined) {
            hasMoreData = responseData.pagination.hasMore;
          } else {
            // If we can't determine pagination, check if we got a full page
            hasMoreData = pageData.length === pageSize;
          }
        } else if (responseData.items && Array.isArray(responseData.items)) {
          console.log('Found items array in paginated response');
          pageData = responseData.items;
          
          // Check pagination info
          if (responseData.hasMore !== undefined) {
            hasMoreData = responseData.hasMore;
          } else {
            hasMoreData = pageData.length === pageSize;
          }
        } else if (responseData.currencies && Array.isArray(responseData.currencies)) {
          console.log('Found currencies array in paginated response');
          pageData = responseData.currencies;
          hasMoreData = pageData.length === pageSize;
        } else if (responseData.results && Array.isArray(responseData.results)) {
          console.log('Found results array in paginated response');
          pageData = responseData.results;
          hasMoreData = pageData.length === pageSize;
        } else {
          // Try to extract any array from the response
          const possibleArrays = Object.values(responseData).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            console.log('Found possible array in response:', Object.keys(responseData).find(key => Array.isArray(responseData[key])));
            pageData = possibleArrays[0] as any[];
            hasMoreData = pageData.length === pageSize;
          } else {
            console.log('Could not find any arrays in response, stopping pagination');
            hasMoreData = false;
          }
        }
      } else {
        console.log('Unexpected response format, stopping pagination');
        hasMoreData = false;
      }
      
      console.log(`Received ${pageData.length} currencies from page ${currentPage}`);
      
      // Add the currencies from this page to our main array
      allCurrencies = [...allCurrencies, ...pageData];
      
      // Stop if we didn't get any data
      if (pageData.length === 0) {
        hasMoreData = false;
      }
      
      // Move to the next page
      currentPage++;
      
      // Safety check - don't make too many requests
      if (currentPage >= 10) {
        console.log('Reached maximum page limit (10), stopping pagination');
        hasMoreData = false;
      }
      
      // If we already have a lot of currencies, we can stop
      if (allCurrencies.length > 1000) {
        console.log(`Already have ${allCurrencies.length} currencies, stopping pagination`);
        hasMoreData = false;
      }
    }
    
    console.log(`Total currencies collected from all pages: ${allCurrencies.length}`);
    
    // Log a sample of the data to help debug
    if (allCurrencies.length > 0) {
      console.log('Sample currency data:', allCurrencies[0]);
      
      // Check if SOL is in the returned currencies
      const hasSol = allCurrencies.some(currency => currency.code?.toLowerCase() === 'sol');
      console.log('SOL included in API response:', hasSol);
      
      // If SOL is not included, add it manually
      if (!hasSol) {
        console.log('Adding SOL manually since it was not found in the API response');
        allCurrencies.push({
          id: 'sol-sol',
          code: 'sol',
          name: 'Solana',
          isEnabled: true,
          imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
          requiresExtraTag: false
        });
      }
      
      // Filter out any currencies without a valid code
      const validCurrencies = allCurrencies.filter(currency => 
        currency && currency.code && typeof currency.code === 'string' && currency.isEnabled !== false
      );
      
      console.log(`Filtered to ${validCurrencies.length} valid currencies`);
      
      // If we have no valid currencies after filtering, return defaults
      if (!validCurrencies.length) {
        console.log('No valid currencies after filtering, using defaults');
        return NextResponse.json(getDefaultCurrencies());
      }
      
      // Return the valid currencies
      return NextResponse.json(validCurrencies);
    } else {
      console.log('API returned empty data array, using default currencies');
      return NextResponse.json(getDefaultCurrencies());
    }
  } catch (error: any) {
    console.error('Error in currencies API route:', error);
    
    // Return default currencies on error
    return NextResponse.json(getDefaultCurrencies(), { status: 200 });
  }
}

// Function to provide default currencies when API fails
function getDefaultCurrencies() {
  console.log('Using default currencies');
  
  return [
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
    },
    {
      id: 'usdt-eth',
      code: 'usdt',
      name: 'Tether',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdt.png',
      requiresExtraTag: false
    },
    {
      id: 'usdc-eth',
      code: 'usdc',
      name: 'USD Coin',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/usdc.png',
      requiresExtraTag: false
    },
    {
      id: 'bnb-bsc',
      code: 'bnb',
      name: 'Binance Coin',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/bnb.png',
      requiresExtraTag: false
    },
    {
      id: 'xrp-xrp',
      code: 'xrp',
      name: 'XRP',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/xrp.png',
      requiresExtraTag: false
    },
    {
      id: 'ada-ada',
      code: 'ada',
      name: 'Cardano',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/ada.png',
      requiresExtraTag: false
    },
    {
      id: 'doge-doge',
      code: 'doge',
      name: 'Dogecoin',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/doge.png',
      requiresExtraTag: false
    },
    {
      id: 'matic-matic',
      code: 'matic',
      name: 'Polygon',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/matic.png',
      requiresExtraTag: false
    }
  ];
} 