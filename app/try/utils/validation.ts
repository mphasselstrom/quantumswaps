import { PublicKey } from '@solana/web3.js';

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateSwapInputs = (
  fromCurrency: any,
  toCurrency: any,
  amount: string,
  recipientAddress: string
): string | null => {
  if (!fromCurrency || !toCurrency) {
    return 'Please select currencies';
  }

  if (!amount || !isValidAmount(amount)) {
    return 'Please enter a valid amount';
  }

  if (!recipientAddress?.trim()) {
    return `Please enter a recipient ${toCurrency.symbol} wallet address`;
  }

  if (toCurrency.network === 'sol' && !isValidSolanaAddress(recipientAddress)) {
    return 'Please enter a valid Solana address';
  }

  return null;
};
