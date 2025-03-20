export const metadata = {
  title: 'QuantumSwap API - Low-cost, Instant Cross Chain and DeFi Swaps',
  description: 'The most comprehensive swap API for Solana DeFi liquidity and seamless cross-chain transactions.',
}

import Hero from '@/components/hero'
import Clients from '@/components/clients'
import Features from '@/components/features'
import Features02 from '@/components/features-02'
import Features03 from '@/components/features-03'
import Features04 from '@/components/features-04'
import Testimonials from '@/components/testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <Clients />
      <Features />
      <Features02 />
      <Features03 />
      <Features04 />
      <Testimonials />
    </>
  )
}
