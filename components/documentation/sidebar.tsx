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

  const isHashActive = (hash: string) => {
    return currentHash === hash
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
                <a href="#introduction" className={`${isHashActive('#introduction') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Introduction
                </a>
              </li>
              <li>
                <a href="#quickstart" className={`${isHashActive('#quickstart') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Quickstart
                </a>
              </li>
            </ul>
          </li>
          <li className="mt-12 lg:mt-8">
            <h5 className="mb-8 lg:mb-3 font-semibold text-slate-200">API Endpoints</h5>
            <ul className="space-y-6 lg:space-y-2">
              <li>
                <a href="#currencies-info" className={`${isHashActive('#currencies-info') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Currencies Info
                </a>
              </li>
              <li>
                <a href="#currencies-pairs" className={`${isHashActive('#currencies-pairs') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Currencies Pairs
                </a>
              </li>
              <li>
                <a href="#swap-quote" className={`${isHashActive('#swap-quote') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Swap Quote
                </a>
              </li>
              <li>
                <a href="#swap-execute" className={`${isHashActive('#swap-execute') ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'} cursor-pointer`}>
                  Swap Execute
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
} 