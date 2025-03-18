'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Logo from '@/components/ui/logo'

export default function DocSidebar() {
  const pathname = usePathname()
  const [currentHash, setCurrentHash] = useState('')
  
  useEffect(() => {
    // Set initial hash
    setCurrentHash(window.location.hash)
    
    // Update hash on change
    const handleHashChange = () => {
      setCurrentHash(window.location.hash)
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }
  
  const isHashActive = (hash: string) => {
    return pathname === '/documentation' && currentHash === hash
  }

  return (
    <div className="hidden lg:block fixed z-20 inset-0 top-[3.8125rem] left-[max(0px,calc(50%-45rem))] right-auto w-[19.5rem] pb-10 px-8 overflow-y-auto bg-slate-900">
      <nav className="lg:text-sm lg:leading-6 relative">
        <div className="mb-8">
          <Logo />
        </div>
        
        <ul>
          <li className="mt-12 lg:mt-8">
            <h5 className="mb-8 lg:mb-3 font-semibold text-slate-200">Guides</h5>
            <ul className="space-y-6 lg:space-y-2">
              <li>
                <Link href="/documentation" className={`${isActive('/documentation') && !currentHash ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Introduction
                </Link>
              </li>
              <li>
                <Link href="/documentation/quickstart" className={`${isActive('/documentation/quickstart') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Quickstart
                </Link>
              </li>
              <li>
                <Link href="/documentation/sdks" className={`${isActive('/documentation/sdks') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  SDKs
                </Link>
              </li>
              <li>
                <Link href="/documentation/authentication" className={`${isActive('/documentation/authentication') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Authentication
                </Link>
              </li>
              <li>
                <Link href="/documentation/pagination" className={`${isActive('/documentation/pagination') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Pagination
                </Link>
              </li>
              <li>
                <Link href="/documentation/errors" className={`${isActive('/documentation/errors') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Errors
                </Link>
              </li>
              <li>
                <Link href="/documentation/webhooks" className={`${isActive('/documentation/webhooks') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Webhooks
                </Link>
              </li>
            </ul>
          </li>
          <li className="mt-12 lg:mt-8">
            <h5 className="mb-8 lg:mb-3 font-semibold text-slate-200">API Endpoints</h5>
            <ul className="space-y-6 lg:space-y-2">
              <li>
                <Link href="/documentation#currency-pairs" className={`${isHashActive('#currency-pairs') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Currency Pairs
                </Link>
              </li>
              <li>
                <Link href="/documentation#quote-get" className={`${isHashActive('#quote-get') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Quote Get
                </Link>
              </li>
              <li>
                <Link href="/documentation#quote-execute" className={`${isHashActive('#quote-execute') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Quote Execute
                </Link>
              </li>
              <li>
                <Link href="/documentation#swap-status" className={`${isHashActive('#swap-status') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Swap Status
                </Link>
              </li>
              <li>
                <Link href="/documentation#swaps-history" className={`${isHashActive('#swaps-history') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Swaps History
                </Link>
              </li>
              <li>
                <Link href="/documentation#currencies-info" className={`${isHashActive('#currencies-info') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Currencies Info
                </Link>
              </li>
              <li>
                <Link href="/documentation#webhook-create" className={`${isHashActive('#webhook-create') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Create Webhook
                </Link>
              </li>
              <li>
                <Link href="/documentation#webhook-get" className={`${isHashActive('#webhook-get') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
                  Get Webhook
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
} 