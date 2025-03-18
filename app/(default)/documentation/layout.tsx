'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '@/components/ui/footer'

export default function DocumentationLayout({
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
    <div className="flex flex-col min-h-screen overflow-hidden bg-slate-900 text-white">
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  )
} 