import {
  Connection,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from '@solana/web3.js';
import { HELIUS_RPC_ENDPOINT } from './network';

export const createSolanaTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<Transaction> => {
  const connection = new Connection(HELIUS_RPC_ENDPOINT, 'confirmed');
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(toAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: LAMPORTS_PER_SOL * amount,
    })
  );

  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  return transaction;
};

export const getTransactionStatus = async (
  signature: string
): Promise<string> => {
  const connection = new Connection(HELIUS_RPC_ENDPOINT, 'confirmed');
  try {
    const confirmation = await connection.confirmTransaction(signature);
    return confirmation ? 'confirmed' : 'pending';
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return 'error';
  }
};
