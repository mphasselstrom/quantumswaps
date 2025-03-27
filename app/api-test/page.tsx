'use client'

import { useState, useEffect } from 'react'

export default function ApiTestPage() {
  const [currenciesData, setCurrenciesData] = useState<any>(null)
  const [currenciesError, setCurrenciesError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch currencies data on component mount
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        setIsLoading(true)
        setCurrenciesError(null)
        
        const response = await fetch('/api/currencies')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API Error: ${errorData.error || response.statusText}`)
        }
        
        const data = await response.json()
        setCurrenciesData(data)
      } catch (err) {
        console.error('Error fetching currencies:', err)
        setCurrenciesError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCurrencies()
  }, [])
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currencies API Response</h2>
        
        {isLoading && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-slate-300">Loading currencies data...</p>
          </div>
        )}
        
        {currenciesError && (
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
            <p className="text-red-400">{currenciesError}</p>
          </div>
        )}
        
        {!isLoading && !currenciesError && currenciesData && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="mb-2">
              <span className="text-slate-300 font-medium">{Array.isArray(currenciesData) ? `${currenciesData.length} currencies found` : 'Response is not an array'}</span>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-auto">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                {JSON.stringify(currenciesData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-slate-400">
        <p>This page is for debugging API responses. Navigate to <a href="/try" className="text-indigo-400 hover:underline">Try Page</a> to use the swap feature.</p>
      </div>
    </div>
  )
} 