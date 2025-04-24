export class WalletConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

export class NetworkSwitchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkSwitchError';
  }
}

export class TransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionError';
  }
}
