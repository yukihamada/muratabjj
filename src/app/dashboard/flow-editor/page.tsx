'use client'

import dynamic from 'next/dynamic'
import DashboardNav from '@/components/DashboardNav'
import SubscriptionGuard from '@/components/SubscriptionGuard'

const FlowEditor = dynamic(() => import('@/components/FlowEditor'), {
  ssr: false,
})

export default function FlowEditorPage() {
  return (
    <div className="h-screen bg-bjj-bg flex flex-col">
      <DashboardNav />
      <div className="flex-1">
        <SubscriptionGuard requiredPlan="pro">
          <FlowEditor />
        </SubscriptionGuard>
      </div>
    </div>
  )
}