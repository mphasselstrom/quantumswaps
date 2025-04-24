import { useWallet } from '../context/WalletProvider';

export const useWalletConnection = () => {
  const { connector, isConnecting, connect, disconnect } = useWallet();

  const isConnected = connector?.isConnected || false;
  const userAccount = connector?.userAccount || '';

  return {
    isConnected,
    userAccount,
    connectWallet: connect,
    disconnect,
    wallet: connector,
  };
};
