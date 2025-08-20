import PricingWithStripe from '@/components/PricingWithStripe'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Pricing - Murata BJJ',
  description: 'Choose the perfect plan for your BJJ journey',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bjj-base">
      <Header />
      <main className="pt-20">
        <PricingWithStripe />
      </main>
      <Footer />
    </div>
  )
}