'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import DocSidebar from '@/components/documentation/sidebar'
import TableOfContents from '@/components/documentation/toc'

export default function Documentation() {
  const tocItems = [
    { id: 'getting-started', title: 'Getting started', level: 1 },
    { id: 'api-interface', title: 'API interface', level: 1 },
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
    <div className="relative mx-auto pt-10 sm:px-2 lg:ml-[19.5rem] xl:mr-[19.5rem] max-w-none">
      {/* Left sidebar */}
      <DocSidebar />

      {/* Right sidebar - Table of contents */}
      <TableOfContents items={tocItems} />

      {/* Main content */}
      <main className="max-w-3xl mx-auto relative z-20 px-4 sm:px-6 xl:px-8 pb-16 lg:pb-24 pt-24">

        <div className="prose prose-invert prose-slate max-w-none">
          <h2 id="getting-started" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-10 lg:mt-12">Getting started</h2>
          <p className="mt-4 text-slate-300">
            To get started, create a new application in your developer settings, then read about how to make requests 
            for the resources you need to access using our HTTP APIs or dedicated client SDKs. When your integration 
            is ready to go live, publish it to our integrations directory to reach the Quantum Swaps community.
          </p>
          
          <div className="not-prose my-8">
            <Link href="mailto:hello@quantumswaps.xyz" className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300">
              Get your API key
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <h2 id="api-interface" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">API interface</h2>
          
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
{`POST /v1/networks/inbound
POST /v1/networks/outbound
POST /v1/currencies/inbound
POST /v1/currencies/outbound
POST /v1/currencies/supported_networks`}
              </pre>
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
  fromCurrency: String,
  fromNetwork: String,
  toCurrency: String,
  toNetwork: String,
  fromWalletAddress: String,
  fromWalletAddressExtra: String,
  fromAmount: String,  // Either this or toAmount required
  toAmount: String     // Either this or fromAmount required
}

// Response
{
  exchangeRate: String,
  fromAmount: String,
  toAmount: String,
  networkFee: String,
  fromCurrency: String,
  fromNetwork: String,
  toCurrency: String,
  toNetwork: String,
  expiresIn: String,
  signature: String
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="quote-execute" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Quote Execute</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/swap/execute</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-yellow-200 text-yellow-800 rounded-full">Authorization required</span>
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
  externalId: String
}

// Response
{
  id: String,
  status: String,
  fromAmount: String,
  toAmount: String,
  fromCurrency: String,
  toCurrency: String,
  createdAt: String,
  updatedAt: String
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
  id: String,
  status: String,
  fromAmount: String,
  toAmount: String,
  fromCurrency: String,
  toCurrency: String,
  createdAt: String,
  updatedAt: String
}`}
              </pre>
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
  externalId: String,
  createdBeforeDate: Date,
  createdAfterDate: Date,
  fromWalletAddress: String,
  fromWalletAddressExtra: String,
  toWalletAddress: String,
  toWalletAddressExtra: String,
  limit: Number,
  offset: Number,
  currency: String,
  network: String
}

// Response
{
  data: [
    {
      id: String,
      status: String,
      fromAmount: String,
      toAmount: String,
      fromCurrency: String,
      toCurrency: String,
      createdAt: String,
      updatedAt: String
    }
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
  "currencies": [
    {
      currency: String,
      network: String,
      name: String,
      address: String,
      decimals: Number,
      logoURI: String
    }
  ]
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="webhook-create" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Create Webhook</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/webhooks/create</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-yellow-200 text-yellow-800 rounded-full">Authorization required</span>
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
          
          <h3 id="webhook-get" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Get Webhook</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/webhooks/get</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-yellow-200 text-yellow-800 rounded-full">Authorization required</span>
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