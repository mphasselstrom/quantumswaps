'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DocsPage() {
  const [copied, setCopied] = useState(false)
  
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'quickstart', title: 'Quickstart', level: 1 },
    { id: 'currencies-info', title: 'Currencies Info', level: 1 },
    { id: 'currencies-pairs', title: 'Currencies Pairs', level: 1 },
    { id: 'swap-quote', title: 'Swap Quote', level: 1 },
    { id: 'swap-execute', title: 'Swap Execute', level: 1 },
  ]
  
  const copyToClipboard = () => {
    const quickstartCode = `// I'm integrating a crypto swaps API that allows users to exchange one crypto for another.
// I'm going to implement a complete flow: checking available currency pairs, getting a quote, and executing a swap.
// Here are the docs: https://api.quantumswaps.xyz/docs

// Install required dependencies:
// npm install node-fetch@2

const fetch = require('node-fetch');

// 1. Check available currency pairs
const pairsResponse = await fetch('https://api.quantumswaps.xyz/v1/currencies/pairs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'  // Replace with your actual API key
  },
  body: JSON.stringify({
    fromCurrencies: ['BTC'],
    fromNetworks: ['BTC'],
    toCurrencies: ['ETH'],
    toNetworks: ['ETH']
  })
});

const pairs = await pairsResponse.json();
console.log('Available pairs:', pairs);

// 2. Get a quote for the swap
const quoteResponse = await fetch('https://api.quantumswaps.xyz/v1/swap/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'  // Replace with your actual API key
  },
  body: JSON.stringify({
    fromCurrencies: ['BTC'],
    fromNetworks: ['BTC'],
    toCurrencies: ['ETH'],
    toNetworks: ['ETH'],
    fromAmount: '0.01',
    fromWalletAddress: '0x123...'  // Replace with your actual wallet address
  })
});

const quote = await quoteResponse.json();
console.log('Quote details:', quote);

// 3. Execute the swap with the quote signature
const executeResponse = await fetch('https://api.quantumswaps.xyz/v1/swap/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'  // Replace with your actual API key
  },
  body: JSON.stringify({
    signature: quote.signature,
    toWalletAddress: '0x456...',  // Replace with the destination wallet address
    refundWalletAddress: '0x123...'  // Replace with your refund wallet address
  })
});

const transaction = await executeResponse.json();
console.log('Swap transaction:', transaction);

// Note: Replace placeholder values with your actual API key and wallet addresses before using.
// Make sure to handle errors and implement proper security measures in production.`;

    navigator.clipboard.writeText(quickstartCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  return (
    <div className="relative mx-auto pt-10 sm:px-2 lg:ml-[19.5rem] xl:mr-[19.5rem] max-w-none bg-slate-900">
      {/* Main content */}
      <main className="max-w-3xl mx-auto relative z-20 px-4 sm:px-6 xl:px-8 pb-16 lg:pb-24 pt-24">
        <div className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-3xl font-bold tracking-tight text-white scroll-mt-24 mb-8">API Documentation</h1>
          
          <h2 id="introduction" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Introduction</h2>
          <p className="text-slate-300">
            Welcome to the Quantum Swaps API documentation. This guide provides comprehensive information about our API endpoints, allowing you to integrate cryptocurrency swap functionality into your applications seamlessly. All API requests use POST methods and return JSON responses.
          </p>
          
          <p className="text-slate-300 mt-4">
            The Quantum Swaps API follows RESTful principles and is organized around predictable resource-oriented endpoints. Below you'll find information on how to handle errors and integrate with our API.
          </p>
          
          {/* Buttons moved into middle section */}
          <div className="flex space-x-4 my-10">
            <button 
              onClick={copyToClipboard}
              className="bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition duration-150 ease-in-out cursor-pointer text-sm text-white"
            >
              {copied ? 'Copied!' : 'Copy Cursor Command'}
            </button>
            <a 
              href="https://www.firecrawl.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition duration-150 ease-in-out cursor-pointer text-sm text-white inline-flex items-center no-underline"
            >
              Get AI Ready Docs
            </a>
          </div>
          
          <h2 id="quickstart" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Quickstart</h2>
          <p className="text-slate-300">
            Get started quickly with the Quantum Swaps API by following this end-to-end example for creating a cryptocurrency swap:
          </p>
          
          <div className="mt-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">Complete Swap Flow Example</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// 1. Check available currency pairs
const pairsResponse = await fetch('https://api.quantumswaps.xyz/v1/currencies/pairs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fromCurrencies: ['BTC'],
    fromNetworks: ['BTC'],
    toCurrencies: ['ETH'],
    toNetworks: ['ETH']
  })
});

const pairs = await pairsResponse.json();
console.log('Available pairs:', pairs);

// 2. Get a quote for the swap
const quoteResponse = await fetch('https://api.quantumswaps.xyz/v1/swap/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fromCurrencies: ['BTC'],
    fromNetworks: ['BTC'],
    toCurrencies: ['ETH'],
    toNetworks: ['ETH'],
    fromAmount: '0.01',
    fromWalletAddress: '0x123...'
  })
});

const quote = await quoteResponse.json();
console.log('Quote details:', quote);

// 3. Execute the swap with the quote signature
const executeResponse = await fetch('https://api.quantumswaps.xyz/v1/swap/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    signature: quote.signature,
    toWalletAddress: '0x456...',
    refundWalletAddress: '0x123...'
  })
});

const transaction = await executeResponse.json();
console.log('Swap transaction:', transaction);`}
              </pre>
            </div>
          </div>
          
          <h2 id="errors" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Errors</h2>
          <p className="text-slate-300">
            The Quantum Swaps API uses conventional HTTP response codes to indicate the success or failure of an API request.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// HTTP Status Codes
200 - OK                 // Everything worked as expected
400 - Bad Request        // Missing required parameters or validation failed
401 - Unauthorized       // Invalid API key
404 - Not Found          // The requested resource doesn't exist
429 - Too Many Requests  // You've hit rate limits
500 - Server Error       // Something went wrong on our end`}
              </pre>
            </div>
          </div>
          
          <div className="mt-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">Error Response Format</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": "Missing required parameter: fromCurrencies"
  }
}`}
              </pre>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">API Endpoints</h2>
          
          <h3 id="currencies-info" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Currencies Info</h3>
          <p className="text-slate-300">
            Get detailed information about all available tokens and their supported networks. This endpoint returns a comprehensive list of all cryptocurrencies that can be used with the API.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/currencies/currencies_info</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Response
[
  {
    code: string;
    name: string;
    networks: string[];
    isEnabled: boolean;
  }
]`}
              </pre>
            </div>
          </div>
          
          <h3 id="currencies-pairs" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Currencies Pairs</h3>
          <p className="text-slate-300">
            Get available currency pairs for swapping. You can optionally filter the results by specifying source currencies or networks. If you specify <code className="text-blue-300">fromNetworks</code> or <code className="text-blue-300">fromCurrencies</code>, the response will be limited to only include those pairs.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/currencies/pairs</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  fromCurrencies?: string[];  // Optional: filter by source currencies
  toCurrencies?: string[];    // Optional: filter by destination currencies
  fromNetworks?: string[];    // Optional: filter by source networks
  toNetworks?: string[];      // Optional: filter by destination networks
}

// Response
{
  pairs: [
    {
      fromCurrencies: string[];
      fromNetworks: string[];
      toCurrencies: string[];
      toNetworks: string[];
      isEnabled: boolean;
    }
  ]
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="swap-quote" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swap Quote</h3>
          <p className="text-slate-300">
            Get a price quote for swapping between currencies. The quote includes exchange rates, fees, and a signature needed for executing the swap. You can specify either floating or fixed rate by using the <code className="text-blue-300">flow</code> parameter. The result includes a <code className="text-blue-300">signature</code> that will be required when executing the swap.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/quote</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  fromCurrencies: string[];
  fromNetworks?: string[];
  toCurrencies: string[];
  toNetworks?: string[];
  fromAmount?: string;        // Either this or toAmount is required
  toAmount?: string;          // Either this or fromAmount is required
  flow?: string;              // Optional: "floating" or "fixed" rate
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
}

// Response
{
  fromAmount: string;
  toAmount: string;
  networkFee: string;
  fromCurrencies: string[];
  fromNetworks?: string[];
  toCurrencies: string[];
  toNetworks?: string[];
  expiresIn?: string;
  rateId: string;
  flow?: string;
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
  signature: string;          // Required for swap execution
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="swap-execute" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swap Execute</h3>
          <p className="text-slate-300">
            Execute a swap using the quote signature obtained from the Quote endpoint. This initiates the transaction to fulfill the swap. You must pass the quote <code className="text-blue-300">signature</code> from the previous step, along with the destination wallet address and a refund address in case the transaction fails.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/execute</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-amber-200 text-amber-900 rounded-full">Authorization required</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  signature: string;           // The signature from the quote response
  toWalletAddress: string;     // Destination wallet for receiving funds
  toWalletAddressExtra?: string;
  refundWalletAddress: string; // Address to refund if transaction fails
  refundWalletAddressExtra?: string;
}

// Response
{
  id: string;
  fromCurrency: string;
  fromAmount: string;
  fromWalletAddress: string;
  fromWalletAddressExtra?: string;
  toCurrency: string;
  toAmount: string;
  toWalletAddress: string;
  toWalletAddressExtra?: string;
  status: TransactionStatus;
  completedAt?: string;
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}