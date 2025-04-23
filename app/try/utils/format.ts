export const formatAddress = (
  address: string,
  start: number = 6,
  end: number = 4
): string => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatExpiryTime = (expiryTimestamp: number): string => {
  const minutes = Math.max(
    0,
    Math.floor((expiryTimestamp - Date.now() / 1000) / 60)
  );
  return `${minutes} minutes`;
};

export const formatRate = (
  fromAmount: string,
  toAmount: string,
  decimals: number = 6
): string => {
  const rate = parseFloat(toAmount) / parseFloat(fromAmount);
  return rate.toFixed(decimals);
};
