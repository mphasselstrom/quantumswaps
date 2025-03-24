import { NextRequest, NextResponse } from 'next/server';

type ExecuteSwapRequest = {
  signature: string;
  toWalletAddress: string;
  toWalletAddressExtra?: string;
  refundWalletAddress: string;
  refundWalletAddressExtra?: string;
};

type ExecuteSwapResponse = {
  id: string;
  fromCurrency: string;
  fromAmount: string;
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
  toCurrency: string;
  toAmount: string;
  toWalletAddress: string;
  toWalletAddressExtra?: string;
  status: string;
  completedAt?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json() as ExecuteSwapRequest;
    
    // Validate required fields
    if (!body.signature) {
      return NextResponse.json({ error: 'signature is required' }, { status: 400 });
    }
    
    if (!body.toWalletAddress) {
      return NextResponse.json({ error: 'toWalletAddress is required' }, { status: 400 });
    }
    
    if (!body.refundWalletAddress) {
      return NextResponse.json({ error: 'refundWalletAddress is required' }, { status: 400 });
    }
    
    // In a real application, we would forward this request to the actual API
    // For this demo, we'll create a mock successful response
    
    // Simulate an API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Generate a unique transaction ID
    const transactionId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    
    // Create a mock response
    const response: ExecuteSwapResponse = {
      id: transactionId,
      fromCurrency: 'sol',
      fromAmount: '0.1',
      fromWalletAddress: body.refundWalletAddress,
      toCurrency: 'btc',
      toAmount: '0.0000435',
      toWalletAddress: body.toWalletAddress,
      status: 'created',
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in swap execute API:', error);
    return NextResponse.json(
      { error: 'Failed to process swap execution' },
      { status: 500 }
    );
  }
} 