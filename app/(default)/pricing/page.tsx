export const metadata = {
  title: 'Quantum Pricing - Transparent and Competitive Rates',
  description: 'View QuantumSwap\'s transparent pricing plans for our cross-chain swap API with competitive rates and no hidden fees.',
}

import PricingSection from './pricing-section'
import Features from '@/components/features-05'
import Customers from '@/components/customers'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'

export default function Pricing() {
  return (
    <>
      <PricingSection />
      <Features />
      <Customers />
      <Faqs />
      <Cta />
    </>
  )
}
