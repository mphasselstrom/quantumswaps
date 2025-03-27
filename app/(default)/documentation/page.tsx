'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import DocSidebar from '@/components/documentation/sidebar'

export default function Documentation() {
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'quickstart', title: 'Quickstart', level: 1 },
    { id: 'errors', title: 'Errors', level: 1 },
    { id: 'webhooks', title: 'Webhooks', level: 1 },
  ]
  
  return (
    <div className="relative mx-auto pt-10 sm:px-2 lg:ml-[19.5rem] xl:mr-[19.5rem] max-w-none">
      {/* Left sidebar */}
      <DocSidebar />

      {/* Right sidebar - Buttons */}
      <div className="fixed z-20 top-[3.8125rem] bottom-0 right-[max(0px,calc(50%-45rem))] w-[19.5rem] py-10 overflow-y-auto hidden xl:block">
        <div className="px-8">
          <div className="space-y-4">
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Copy Cursor Command
            </button>
            <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
              Get AI Ready Docs
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto relative z-20 px-4 sm:px-6 xl:px-8 pb-16 lg:pb-24 pt-24">

        <div className="prose prose-invert prose-slate max-w-none">
          <h2 id="introduction" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-10 lg:mt-12">Introduction</h2>
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
          
          <h2 id="quickstart" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Quickstart</h2>
          <p className="mt-4 text-slate-300">
            Follow these simple steps to make your first quantum swap:
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">1</div>
              <div className="ml-4">
                <p className="text-slate-300">Get your API key by contacting our team</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">2</div>
              <div className="ml-4">
                <p className="text-slate-300">Check available currency pairs</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">3</div>
              <div className="ml-4">
                <p className="text-slate-300">Get a quote for your swap</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">4</div>
              <div className="ml-4">
                <p className="text-slate-300">Execute the swap</p>
              </div>
            </div>
          </div>
          
          <h2 id="errors" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Errors</h2>
          <p className="mt-4 text-slate-300">
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
          
          <h2 id="webhooks" className="text-2xl font-bold tracking-tight text-white scroll-mt-24 mt-16">Webhooks</h2>
          <p className="mt-4 text-slate-300">
            Webhooks allow you to receive real-time updates about swap status changes. 
            Configure webhooks to notify your services when important events occur.
          </p>
          
          <h3 id="required-headers" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Required Headers</h3>
          <p className="mt-4 text-slate-300">
            For all API calls, include the <code className="text-blue-400">x-pk-key</code> header.
            For execute calls, include both <code className="text-blue-400">x-pk-key</code> and <code className="text-blue-400">x-sk-key</code> headers.
          </p>

          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono">
{`// Headers for all calls
{
  'Content-Type': 'application/json',
  'x-pk-key': 'YOUR_PUBLIC_KEY'
}

// Additional header for execute calls
{
  'x-sk-key': 'YOUR_SECRET_KEY'
}`}
              </pre>
            </div>
          </div>
          
          <h3 id="webhook-create" className="text-xl font-bold tracking-tight text-white scroll-mt-24 mt-10">Create Webhook</h3>
          
          <div className="mt-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 border-b border-slate-700">
              <span className="text-sm font-mono text-slate-200">POST /v1/webhooks/create</span>
              <span className="ml-3 text-xs py-0.5 px-2 bg-yellow-200 text-yellow-800 rounded-full">PK Key required</span>
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
              <span className="ml-3 text-xs py-0.5 px-2 bg-yellow-200 text-yellow-800 rounded-full">PK Key required</span>
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