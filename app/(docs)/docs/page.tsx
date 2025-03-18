'use client'

import Link from 'next/link'
import TableOfContents from '@/components/documentation/toc'

export default function DocsPage() {
  const tocItems = [
    { id: 'api-interface', title: 'API Interface', level: 1 },
    { id: 'currency-pairs', title: 'Currency Pairs', level: 2 },
    { id: 'quote-get', title: 'Quote Get', level: 2 },
    { id: 'quote-execute', title: 'Quote Execute', level: 2 },
    { id: 'swap-status', title: 'Swap Status', level: 2 },
    { id: 'swaps-history', title: 'Swaps History', level: 2 },
    { id: 'currencies-info', title: 'Get Currencies Info', level: 2 },
    { id: 'webhook-create', title: 'Create Webhook', level: 2 },
    { id: 'webhook-get', title: 'Get Webhook', level: 2 },
  ]
  
  return (
    <div className="relative mx-auto pt-10 sm:px-2 lg:ml-[19.5rem] xl:mr-[19.5rem] max-w-none bg-slate-900">
      {/* Right sidebar */}
      <TableOfContents items={tocItems} />

      {/* Main content */}
      <main className="max-w-3xl mx-auto relative z-20 px-4 sm:px-6 xl:px-8 pb-16 lg:pb-24 pt-24">
        <div className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-3xl font-bold tracking-tight text-white scroll-mt-24 mb-8">API Documentation</h1>
          
          <p className="text-slate-300">
            Welcome to the Quantum Swaps API documentation. This guide provides comprehensive information about our API endpoints, allowing you to integrate cryptocurrency swap functionality into your applications seamlessly. All API requests use POST methods and return JSON responses.
          </p>
          
          <h2 id="api-interface" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">API Interface</h2>
          
          <p className="text-slate-300">
            The Quantum Swaps API follows RESTful principles and is organized around predictable resource-oriented endpoints. Below you'll find the available endpoints for handling cryptocurrency pairs, quotes, swaps, and webhooks. All request and response bodies are formatted as JSON.
          </p>
          
          <h3 id="currency-pairs" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Currency Pairs</h3>
          
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

          <div className="mt-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">Alternative Endpoints</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Get available inbound networks
POST /v1/networks/inbound
// Response: [ NETWORK_DTO OBJECTS ]

// Get available outbound networks
POST /v1/networks/outbound
// Response: [ NETWORK_DTO OBJECTS ]

// Get available inbound currencies for a network
POST /v1/currencies/inbound
// Response: [ CURRENCY_DTO OBJECTS ]

// Get available outbound currencies for a network
POST /v1/currencies/outbound
// Response: [ CURRENCY_DTO OBJECTS ]

// Get all supported networks
POST /v1/currencies/supported_networks
// Response: { inbound: [NETWORK_DTO OBJECTS], outbound: [NETWORK_DTO OBJECTS] }`}
              </pre>
            </div>
          </div>

          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700 bg-slate-700/30">
              <span className="text-sm font-mono text-slate-200">Implementation Notes</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-300">
                All responses should be read from cache. If filters are applied, consider filtering server-side for optimal performance.
              </p>
            </div>
          </div>
          
          <h3 id="quote-get" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Quote Get</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/quote</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  fromCurrency: String,  // Code
  fromNetwork: String,   // Code
  toCurrency: String,    // Code
  toNetwork: String,     // Code
  fromWalletAddress: String,     // Ideally enforced
  fromWalletAddressExtra: String, 
  // PRICING PARAMETERS - One of these is required
  fromAmount: String,    // Either this or toAmount required
  toAmount: String       // Either this or fromAmount required
}

// Response
{
  exchangeRate: String,
  fromAmount: String,
  toAmount: String,
  networkFee: String,
  
  fromCurrency: String,  // Code
  fromNetwork: String,   // Code
  toCurrency: String,    // Code
  toNetwork: String,     // Code
  
  expiresIn: String,     // Seconds until quote expires
  signature: String      // Used to execute the swap
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="quote-execute" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Quote Execute</h3>
          
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
  toWalletAddressExtra: String, 
  
  refundWalletAddress: String,
  refundWalletAddressExtra: String,
  
  externalId: String,  // Can be used by partner to get history
}

// Response
{
  // TRANSACTION_DTO OBJECT
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="swap-status" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swap Status</h3>
          
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
  // TRANSACTION_DTO OBJECT
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
                Consider caching transaction status until the transaction is completed and read by partner, or for approximately 30 minutes, before querying the database.
              </p>
            </div>
          </div>
          
          <h3 id="swaps-history" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Swaps History</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/history</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-slate-700 text-slate-300 rounded-full">Paginated</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  externalId: String,                // Optional
  
  createdBeforeDate: Date,           // JS Date, optional
  createdAfterDate: Date,            // JS Date, optional
  
  fromWalletAddress: String,         // Optional
  fromWalletAddressExtra: String,    // Optional
  
  toWalletAddress: String,           // Optional
  toWalletAddressExtra: String,      // Optional
  
  limit: Number,                     // Default: 10, max: 1000
  offset: Number,                    // Used for pagination
  
  currency: String,                  // CODE, optional
  network: String,                   // CODE, optional
}

// Response
{
  data: [
    // Array of TRANSACTION_DTO OBJECTS
  ],
  limit: Number,
  offset: Number,
  total: Number
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="currencies-info" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Get Currencies Info</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/currencies</span>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Request
{
  currency: String[],    // CODE OF CURRENCY
  network: String[]      // CODE OF NETWORK
}

// Response
{
  // Array of NETWORK_CURRENCY_DTO objects
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
                Cache response or potentially the full table for optimal performance.
              </p>
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
  url: URL,                  // URL must be carefully validated
  subscriptions: String[]    // Array of subscription enum values
}

// Response
{
  success: true
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
// No input required

// Response
{
  url: URL,                  // URL carefully validated
  subscriptions: String[]    // Array of subscription enum values
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 