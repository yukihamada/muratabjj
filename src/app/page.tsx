import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import BJJFlowChart from '@/components/BJJFlowChart'
import HowToUse from '@/components/HowToUse'
import SafetyAndWellness from '@/components/SafetyAndWellness'
import Pricing from '@/components/Pricing'
import Supervisor from '@/components/Supervisor'
import FAQ from '@/components/FAQ'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'
import AuthRedirect from '@/components/AuthRedirect'
import StructuredData from '@/components/StructuredData'

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <StructuredData />
      <main className="min-h-screen bg-bjj-bg">
        <Header />
        <Hero />
        <Features />
        <BJJFlowChart />
        <HowToUse />
        <SafetyAndWellness />
        <Pricing />
        <Supervisor />
        <FAQ />
        <Signup />
        <Footer />
      </main>
    </>
  )
}