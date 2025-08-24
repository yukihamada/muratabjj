'use client'

import { useExperiment, EXPERIMENTS } from '@/lib/ab-testing/experiments'
import { Loader2 } from 'lucide-react'

interface ExperimentWrapperProps {
  experimentId: string
  children: (variant: string | null) => React.ReactNode
  fallback?: React.ReactNode
}

export default function ExperimentWrapper({
  experimentId,
  children,
  fallback = null,
}: ExperimentWrapperProps) {
  const { variant, loading } = useExperiment(experimentId)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }
  
  if (!variant) {
    return <>{fallback}</>
  }
  
  return <>{children(variant)}</>
}

// Specific experiment components
export function OnboardingExperiment() {
  const { variant, loading, trackEvent } = useExperiment(EXPERIMENTS.ONBOARDING_FLOW)
  
  if (loading) return null
  
  switch (variant) {
    case 'variant-a':
      return (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-bold mb-2">Welcome to Murata BJJ! 🥋</h3>
          <p className="text-sm mb-3">Let us guide you through the platform</p>
          <button
            onClick={() => trackEvent('tutorial_started')}
            className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            Start Tutorial
          </button>
        </div>
      )
    
    case 'variant-b':
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome Tutorial</h2>
            <div className="aspect-video bg-gray-200 rounded-lg mb-4">
              {/* Video player would go here */}
            </div>
            <button
              onClick={() => trackEvent('video_tutorial_watched')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Get Started
            </button>
          </div>
        </div>
      )
    
    default:
      return null
  }
}

export function PricingExperiment({ children }: { children: (variant: string | null) => React.ReactNode }) {
  return (
    <ExperimentWrapper experimentId={EXPERIMENTS.PRICING_PAGE}>
      {children}
    </ExperimentWrapper>
  )
}

export function VideoPlayerExperiment({ children }: { children: (variant: string | null) => React.ReactNode }) {
  return (
    <ExperimentWrapper experimentId={EXPERIMENTS.VIDEO_PLAYER_UI}>
      {children}
    </ExperimentWrapper>
  )
}