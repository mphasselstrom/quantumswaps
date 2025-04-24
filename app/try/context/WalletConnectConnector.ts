import {
  WalletConnectionError,
  NetworkSwitchError,
  TransactionError,
} from '../types/errors';
import { WALLET_ERRORS } from '../utils/constants';
import { providers, utils } from 'ethers';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import type { ExternalProvider } from '@ethersproject/providers';
import {
  WalletConnector,
  ChainConfig,
  WalletTransaction,
} from '../types/wallet';

const projectId = '41fefe0c6628a256854431328055b57a';

const metadata = {
  name: 'QuantumSwaps',
  description: 'Cross-chain Swap Platform',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons:
    typeof window !== 'undefined' ? [`${window.location.origin}/icon.png`] : [],
};

// Define supported chains explicitly
const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    network: 'ethereum',
    nativeCurrency: { symbol: 'ETH' },
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH',
  },
  {
    chainId: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: { symbol: 'MATIC' },
    rpcUrl: 'https://polygon.llamarpc.com',
    explorerUrl: 'https://polygonscan.com',
    currency: 'MATIC',
  },
];

const modal =
  typeof window !== 'undefined'
    ? createWeb3Modal({
        ethersConfig: defaultConfig({ metadata }),
        chains,
        projectId,
        enableAnalytics: true,
      })
    : null;

export class WalletConnectConnector implements WalletConnector {
  private provider: providers.Web3Provider | null = null;
  private address: string = '';
  private _chainId: number = 1; // Default to Ethereum mainnet
  private supportedChains: Map<number, ChainConfig> = new Map();
  private _isConnecting: boolean = false;
  private _error: Error | null = null;

  constructor() {
    this.initializeChains();
    this.initializeListeners();
  }

  private initializeChains() {
    // Convert WalletConnect chains to our ChainConfig format
    chains.forEach(chain => {
      this.supportedChains.set(chain.chainId, {
        chainId: chain.chainId,
        name: chain.name,
        network: chain.network,
        currency: chain.nativeCurrency?.symbol || '',
        explorer: chain.explorerUrl || '',
        rpcUrl: chain.rpcUrl || '',
      });
    });
  }

  private initializeListeners() {
    if (!modal) return;

    modal.subscribeEvents(event => {
      switch (event.data.event) {
        case 'CONNECT_SUCCESS':
          this.onConnect(event.data.properties);
          break;
        case 'DISCONNECT_SUCCESS':
          this.onDisconnect();
          break;
        case 'CONNECT_ERROR':
          this.onError(new Error('Failed to connect'));
          break;
        case 'DISCONNECT_ERROR':
          this.onError(new Error('Failed to disconnect'));
          break;
      }
    });
  }

  private async onConnect(properties: { method: string }) {
    try {
      this._isConnecting = true;
      this._error = null;

      const provider = (await modal?.getWalletProvider()) as ExternalProvider;
      if (!provider) {
        throw new WalletConnectionError(WALLET_ERRORS.NOT_CONNECTED);
      }

      const accounts = await provider.request?.({ method: 'eth_accounts' });
      const chainId = await provider.request?.({ method: 'eth_chainId' });

      this.provider = new providers.Web3Provider(provider);
      this.address = accounts[0];
      this._chainId = parseInt(chainId);

      if (!this.supportedChains.has(this._chainId)) {
        throw new WalletConnectionError(WALLET_ERRORS.UNSUPPORTED_NETWORK);
      }
    } catch (error) {
      this._error =
        error instanceof Error ? error : new Error(WALLET_ERRORS.NOT_CONNECTED);
      throw this._error;
    } finally {
      this._isConnecting = false;
    }
  }

  private onDisconnect() {
    this.provider = null;
    this.address = '';
    this._chainId = 1;
    this._error = null;
  }

  private onChainChanged(chainId: number) {
    this._chainId = chainId;
    if (!this.supportedChains.has(chainId)) {
      this._error = new NetworkSwitchError(WALLET_ERRORS.UNSUPPORTED_NETWORK);
    } else {
      this._error = null;
    }
  }

  private onError(error: Error) {
    this._error = error;
    console.error('WalletConnect error:', error);
  }

  public async connect(): Promise<void> {
    if (!modal) {
      throw new WalletConnectionError('Modal not initialized');
    }

    try {
      this._isConnecting = true;
      this._error = null;
      await modal.open();
    } catch (error) {
      this._error =
        error instanceof Error ? error : new Error(WALLET_ERRORS.NOT_CONNECTED);
      throw this._error;
    } finally {
      this._isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!modal) return;

    try {
      await modal.close();
      this.onDisconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  public get isConnected(): boolean {
    return !!this.provider && !!this.address;
  }

  public get isConnecting(): boolean {
    return this._isConnecting;
  }

  public get error(): Error | null {
    return this._error;
  }

  public get userAccount(): string {
    return this.address;
  }

  public get chainId(): number {
    return this._chainId;
  }

  public getSupportedNetworks(): ChainConfig[] {
    return Array.from(this.supportedChains.values());
  }

  public getCurrentNetwork(): ChainConfig | undefined {
    return this.supportedChains.get(this._chainId);
  }

  public async sendTransaction(
    amount: number,
    txData: WalletTransaction
  ): Promise<void> {
    if (!this.provider) {
      throw new TransactionError(WALLET_ERRORS.NOT_CONNECTED);
    }

    try {
      const signer = await this.provider.getSigner();
      const balance = await this.provider.getBalance(this.address);
      const requiredAmount = utils.parseEther(amount.toString());

      if (balance < requiredAmount) {
        throw new TransactionError(WALLET_ERRORS.INSUFFICIENT_BALANCE);
      }

      const tx = await signer.sendTransaction({
        to: txData.depositAddress,
        value: requiredAmount,
        data: txData.data,
      });

      await tx.wait();
    } catch (error) {
      throw new TransactionError(
        error instanceof Error
          ? error.message
          : WALLET_ERRORS.TRANSACTION_FAILED
      );
    }
  }

  public async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new NetworkSwitchError(WALLET_ERRORS.NOT_CONNECTED);
    }

    try {
      if (!this.supportedChains.has(chainId)) {
        throw new NetworkSwitchError(WALLET_ERRORS.UNSUPPORTED_NETWORK);
      }

      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${chainId.toString(16)}` },
      ]);
    } catch (error: any) {
      if (error instanceof NetworkSwitchError) {
        throw error;
      }
      throw new NetworkSwitchError(
        error?.message || WALLET_ERRORS.NETWORK_ERROR
      );
    }
  }
}
