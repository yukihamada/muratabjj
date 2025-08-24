import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import BJJFlowChart from '@/components/BJJFlowChart'
import HowToUse from '@/components/HowToUse'
import PricingWithStripe from '@/components/PricingWithStripe'
import Supervisor from '@/components/Supervisor'
import FAQ from '@/components/FAQ'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'

export default function LocalePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <BJJFlowChart />
      <HowToUse />
      <PricingWithStripe />
      <Supervisor />
      <FAQ />
      <Signup />
      <Footer />
    </main>
  )
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'pt' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'ko' },
    { locale: 'ru' },
    { locale: 'zh' },
    { locale: 'de' },
    { locale: 'it' },
  ]
}