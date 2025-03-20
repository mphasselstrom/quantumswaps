export const metadata = {
  title: 'About Quantum - Our Mission and Team',
  description: 'Learn about QuantumSwap\'s mission to revolutionize cross-chain swaps and meet the team behind our innovative DeFi solutions.',
}

import Hero from '@/components/hero-about'
import Story from '@/components/story'
import Team from '@/components/team'
import Recruitment from '@/components/recruitment'
import Testimonials from '@/components/testimonials-02'
import Cta from '@/components/cta-02'

export default function About() {
  return (
    <>
      <Hero />
      <Story />
      <Team />
      <Recruitment />
      <Testimonials />
      <Cta />
    </>
  )
}
