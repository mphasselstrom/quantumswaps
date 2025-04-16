import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get search query from the request
    const body = await request.json();
    const searchQuery = body.search || '';
    
    console.log('Currency search API called with query:', searchQuery);
    
    // Make the API call to the external service to search for currencies
    const response = await fetch('https://api.swaps.xyz/v1/currencies/currencies_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pk-key': 'pk_live_-bL2S5dJmroQ7BlO5n7B-T347xZRGJBI' // API key for authentication
      },
      body: JSON.stringify({
        currencies: [], // Empty array to search across all currencies
        search: searchQuery // The search query
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
      
      return NextResponse.json(
        getFallbackResults(searchQuery),
        { status: 200 }
      );
    }

    // Get the data from the response
    let data = await response.json();
    
    // Log a sample of the data
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Search results: ${data.length} currencies found for query "${searchQuery}"`);
      console.log('Sample result:', data[0]);
    } else {
      console.log(`No search results found for query "${searchQuery}"`);
      data = getFallbackResults(searchQuery);
    }
    
    // Enhance the search results with network variants if tokens are found
    data = enhanceSearchResults(data, searchQuery);

    // Return the search results
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in currency search API route:', error);
    // Get search query from request or use empty string if not available
    let searchQuery = '';
    try {
      const body = await request.json();
      searchQuery = body.search || '';
    } catch (e) {
      console.error('Could not extract search query from request in error handler');
    }
    
    return NextResponse.json(
      getFallbackResults(searchQuery),
      { status: 200 }
    );
  }
}

// Function to get fallback results when API fails or returns no results
function getFallbackResults(searchQuery: string) {
  const query = searchQuery.toLowerCase();
  
  // Define common cryptocurrencies to check against
  const commonCurrencies = [
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
      id: 'sol-sol',
      code: 'sol',
      name: 'Solana',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/sol.png',
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
    }
  ];
  
  // Filter common currencies based on search query
  return commonCurrencies.filter(currency => 
    currency.name.toLowerCase().includes(query) || 
    currency.code.toLowerCase().includes(query)
  );
}

// Function to enhance search results by adding network variants for tokens
function enhanceSearchResults(apiResults: any[], searchQuery: string) {
  if (!Array.isArray(apiResults) || apiResults.length === 0) {
    return apiResults;
  }
  
  // Map to track unique token codes we've found
  const tokenCodesFound = new Map<string, boolean>();
  
  // Get the base tokens from the API results
  apiResults.forEach(token => {
    if (token.code) {
      tokenCodesFound.set(token.code.toLowerCase(), true);
    }
  });
  
  // Handle special case for "bit" search
  const query = searchQuery.toLowerCase();
  if ((query === 'bit' || query === 'bitc') && !tokenCodesFound.has('btc')) {
    console.log('Adding Bitcoin to search results for "bit" query');
    apiResults.push({
      id: 'btc-btc',
      code: 'btc',
      name: 'Bitcoin',
      isEnabled: true,
      imageUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/btc.png',
      requiresExtraTag: false,
      network: 'bitcoin'
    });
    tokenCodesFound.set('btc', true);
  }
  
  // Common networks to ensure coverage for popular tokens
  const commonNetworks = [
    'ethereum', 'solana', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'tron'
  ];
  
  // For each token we found, add common network variants if necessary
  for (const tokenCode of Array.from(tokenCodesFound.keys())) {
    // Skip tokens with long codes (likely already specific variants)
    if (tokenCode.length > 5) continue;
    
    // Get all results for this token code
    const tokenResults = apiResults.filter(
      token => token.code?.toLowerCase() === tokenCode
    );
    
    // If we already have multiple variants, we might not need to add more
    if (tokenResults.length >= 3) continue;
    
    // Get the base token details from the first result
    const baseToken = tokenResults[0];
    if (!baseToken) continue;
    
    // Keep track of networks we already have
    const networksFound = new Set<string>();
    
    // Extract networks from existing results
    tokenResults.forEach(token => {
      // Try to extract network from name
      const name = token.name?.toLowerCase() || '';
      for (const network of commonNetworks) {
        if (name.includes(network)) {
          networksFound.add(network);
          break;
        }
      }
    });
    
    // Add common network variants if not already present
    // Only add for common tokens that are likely to exist on multiple chains
    if (['usdc', 'usdt', 'eth', 'btc', 'dai', 'wbtc', 'matic', 'avax', 'sol', 'link', 'uni'].includes(tokenCode)) {
      // Networks to consider for this specific token
      let relevantNetworks: string[] = [];
      
      // Custom relevant networks per token
      if (tokenCode === 'usdc' || tokenCode === 'usdt') {
        // Stablecoins exist on many chains
        relevantNetworks = ['ethereum', 'solana', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'tron'];
      } else if (tokenCode === 'btc') {
        // BTC mostly as wrapped versions
        relevantNetworks = ['bitcoin', 'lightning'];
      } else if (tokenCode === 'eth') {
        // ETH native and wrapped
        relevantNetworks = ['ethereum'];
      } else if (tokenCode === 'sol') {
        // SOL native and wrapped
        relevantNetworks = ['solana'];
      } else {
        // Default to major chains for other tokens
        relevantNetworks = ['ethereum', 'solana', 'polygon', 'bsc'];
      }
      
      // Add missing network variants
      for (const network of relevantNetworks) {
        if (!networksFound.has(network)) {
          const networkSuffix = network === 'ethereum' ? '' : ` (${capitalizeFirstLetter(network)})`;
          
          // Generate a unique ID
          const variantId = `${tokenCode}-${network}`;
          
          // Skip if we already have a token with this ID in our results
          if (apiResults.some(t => t.id === variantId)) {
            continue;
          }
          
          // Add the network variant
          console.log(`Adding ${tokenCode.toUpperCase()}${networkSuffix} variant to search results`);
          apiResults.push({
            id: variantId,
            code: tokenCode,
            name: `${baseToken.name}${networkSuffix}`,
            isEnabled: true,
            imageUrl: baseToken.imageUrl || `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons/128/color/${tokenCode}.png`,
            requiresExtraTag: false,
            network: network
          });
        }
      }
    }
  }
  
  return apiResults;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
} 