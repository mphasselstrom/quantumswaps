'use client'

import Link from 'next/link'

export default function DocsPage() {
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'quickstart', title: 'Quickstart', level: 1 },
    { id: 'sdks', title: 'SDKs', level: 1 },
    { id: 'webhooks', title: 'Webhooks', level: 1 },
  ]
  
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
            The Quantum Swaps API follows RESTful principles and is organized around predictable resource-oriented endpoints. Below you'll find information on how to handle errors and configure webhooks.
          </p>
          
          {/* Buttons moved into middle section */}
          <div className="flex space-x-4 my-10">
            <button className="bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition duration-150 ease-in-out cursor-pointer">
              Copy Cursor Command
            </button>
            <button className="bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition duration-150 ease-in-out cursor-pointer">
              Get AI Ready Docs
            </button>
          </div>
          
          <h2 id="quickstart" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Quickstart</h2>
          <p className="text-slate-300">
            Get started quickly with the Quantum Swaps API by following this example:
          </p>
          
          <div className="mt-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">Example Request</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Get a quote
const response = await fetch('https://api.quantumswaps.xyz/v1/swap/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fromCurrency: 'BTC',
    fromNetwork: 'BITCOIN',
    toCurrency: 'ETH',
    toNetwork: 'ETHEREUM',
    fromAmount: '0.01',
    fromWalletAddress: '0x123...'
  })
});

const quote = await response.json();
console.log(quote);`}
              </pre>
            </div>
          </div>
          
          <h2 id="sdks" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">SDKs</h2>
          <p className="text-slate-300">
            We provide official SDKs for several popular programming languages to make integrating with our API even easier.
          </p>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-medium text-white mb-2">JavaScript/TypeScript</h3>
              <pre className="text-sm text-slate-300 font-mono">npm install @quantum-swaps/js</pre>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-medium text-white mb-2">Python</h3>
              <pre className="text-sm text-slate-300 font-mono">pip install quantum-swaps</pre>
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
    "details": "Missing required parameter: fromCurrency"
  }
}`}
              </pre>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">API Endpoints</h2>
          
          <h3 id="currency-pairs" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Currency Pairs</h3>
          <p className="text-slate-300">
            Get available currency pairs for swapping.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/currencies/pairs</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  from: string[], 
  to: string[]
}

// Response
{
  "pairs": [
    {
      fromCurrency: String,
      fromNetwork: String,
      toCurrency: String,
      toNetwork: String,
    }
  ]
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="quote-get" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Quote Get</h3>
          <p className="text-slate-300">
            Get a price quote for swapping between currencies.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/quote</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  fromCurrency: String,
  fromNetwork: String,
  toCurrency: String,
  toNetwork: String,
  fromWalletAddress: String,
  fromAmount: String  // Either this or toAmount required
}

// Response
{
  exchangeRate: String,
  fromAmount: String,
  toAmount: String,
  networkFee: String,
  signature: String  // Used for executing the swap
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="quote-execute" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Quote Execute</h3>
          <p className="text-slate-300">
            Execute a swap using a quote signature.
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
  signature: String,
  toWalletAddress: String,
  refundWalletAddress: String
}

// Response
{
  id: String,
  status: String,
  fromAmount: String,
  toAmount: String
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="swap-status" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swap Status</h3>
          <p className="text-slate-300">
            Check the status of a swap by ID.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/status</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  id: String
}

// Response
{
  id: String,
  status: String,
  fromAmount: String,
  toAmount: String
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="swaps-history" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swaps History</h3>
          <p className="text-slate-300">
            Get history of completed swaps.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/history</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  limit: Number,
  offset: Number
}

// Response
{
  data: [
    {
      id: String,
      status: String,
      fromAmount: String,
      toAmount: String,
      createdAt: String
    }
  ],
  total: Number
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="currencies-info" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Currencies Info</h3>
          <p className="text-slate-300">
            Get detailed information about supported currencies.
          </p>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/currencies/info</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  currencies: String[],
  networks: String[]
}

// Response
{
  currencies: [
    {
      currency: String,
      network: String,
      name: String,
      decimals: Number,
      logoURI: String
    }
  ]
}`}
              </pre>
            </div>
          </div>
          
          <h2 id="webhooks" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Webhooks</h2>
          <p className="text-slate-300">
            Webhooks allow you to receive real-time updates about swap status changes. 
            Configure webhooks to notify your services when important events occur.
          </p>
          
          <div className="mt-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">Available Event Types</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Event Types
"swap_created"   // A new swap has been created
"swap_executed"  // A swap has been successfully executed
"swap_failed"    // A swap has failed to execute`}
              </pre>
            </div>
          </div>
          
          <h3 id="webhook-create" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Create Webhook</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/webhooks/create</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-amber-200 text-amber-900 rounded-full">Authorization required</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  url: String,
  triggerEvents: ["swap_created", "swap_executed", "swap_failed"],
  secret: String
}

// Response
{
  id: String,
  url: String,
  triggerEvents: ["swap_created", "swap_executed", "swap_failed"],
  createdAt: String
}`}
              </pre>
            </div>
          </div>

          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700 bg-slate-700/30">
              <span className="text-sm font-mono text-slate-200">Implementation Notes</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-300">
                Creating multiple webhooks will overwrite the previous webhook configuration.
              </p>
            </div>
          </div>
          
          <h3 id="webhook-get" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Get Webhook</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/webhooks/get</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-amber-200 text-amber-900 rounded-full">Authorization required</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  id: String
}

// Response
{
  id: String,
  url: String,
  triggerEvents: ["swap_created", "swap_executed", "swap_failed"],
  createdAt: String
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 