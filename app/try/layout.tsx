'use client'

import { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

import Header from '@/components/ui/header'
import Footer from '@/components/ui/footer'

// Note: We can't export metadata from a client component
// Metadata should be in a separate metadata.ts file or in a server component

export default function TryLayout({
  children,
}: {
  children: React.ReactNode
}) {  

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  })

  return (
    <>
      <Header />
      
      <main className="grow">
        {children}
      </main>

      <Footer />
    </>
  )
} 