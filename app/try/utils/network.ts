export const getNetworkDisplayName = (network: string): string => {
  const networkMap: { [key: string]: string } = {
    eth: 'Ethereum',
    btc: 'Bitcoin',
    matic: 'Polygon',
    avax: 'Avalanche',
    avaxc: 'Avalanche',
    bsc: 'BSC',
    sol: 'Solana',
  };
  return networkMap[network] || network;
};

export const HELIUS_RPC_ENDPOINT =
  'https://rpc.helius.xyz/?api-key=03235acc-6482-4938-a577-166d6b26170d';
