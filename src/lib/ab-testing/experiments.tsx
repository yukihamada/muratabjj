// A/B Testing Framework
// Flexible experimentation system for feature testing

import { MetricsCollector } from '@/lib/monitoring/grafana'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

// Experiment configuration
export interface Experiment {
  id: string
  name: string
  description: string
  variants: Array<{
    id: string
    name: string
    weight: number // 0-100
  }>
  metrics: string[]
  startDate: Date
  endDate?: Date
  enabled: boolean
}

// User experiment assignment
export interface ExperimentAssignment {
  experimentId: string
  variantId: string
  userId: string
  assignedAt: Date
}

// Experiment manager singleton
class ExperimentManager {
  private static instance: ExperimentManager
  private experiments: Map<string, Experiment> = new Map()
  private assignments: Map<string, ExperimentAssignment> = new Map()
  private userId: string | null = null
  
  static getInstance(): ExperimentManager {
    if (!ExperimentManager.instance) {
      ExperimentManager.instance = new ExperimentManager()
    }
    return ExperimentManager.instance
  }
  
  async initialize(userId: string): Promise<void> {
    this.userId = userId
    await this.loadExperiments()
    await this.loadAssignments()
  }
  
  private async loadExperiments(): Promise<void> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('enabled', true)
        .gte('start_date', new Date().toISOString())
      
      if (error) throw error
      
      data?.forEach(exp => {
        this.experiments.set(exp.id, {
          id: exp.id,
          name: exp.name,
          description: exp.description,
          variants: exp.variants,
          metrics: exp.metrics,
          startDate: new Date(exp.start_date),
          endDate: exp.end_date ? new Date(exp.end_date) : undefined,
          enabled: exp.enabled,
        })
      })
    } catch (error) {
      console.error('Failed to load experiments:', error)
    }
  }
  
  private async loadAssignments(): Promise<void> {
    if (!this.userId) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('experiment_assignments')
        .select('*')
        .eq('user_id', this.userId)
      
      if (error) throw error
      
      data?.forEach(assignment => {
        const key = `${assignment.experiment_id}-${this.userId}`
        this.assignments.set(key, {
          experimentId: assignment.experiment_id,
          variantId: assignment.variant_id,
          userId: assignment.user_id,
          assignedAt: new Date(assignment.assigned_at),
        })
      })
    } catch (error) {
      console.error('Failed to load assignments:', error)
    }
  }
  
  // Get variant for user
  async getVariant(experimentId: string): Promise<string | null> {
    if (!this.userId) return null
    
    const experiment = this.experiments.get(experimentId)
    if (!experiment || !experiment.enabled) return null
    
    // Check if already assigned
    const assignmentKey = `${experimentId}-${this.userId}`
    const existing = this.assignments.get(assignmentKey)
    if (existing) {
      return existing.variantId
    }
    
    // Assign variant based on weights
    const variant = this.assignVariant(experiment)
    if (!variant) return null
    
    // Save assignment
    const assignment: ExperimentAssignment = {
      experimentId,
      variantId: variant.id,
      userId: this.userId,
      assignedAt: new Date(),
    }
    
    this.assignments.set(assignmentKey, assignment)
    await this.saveAssignment(assignment)
    
    // Track assignment
    const metrics = MetricsCollector.getInstance()
    metrics.incrementCounter('experiment_assignments', {
      experiment: experimentId,
      variant: variant.id,
    })
    
    return variant.id
  }
  
  private assignVariant(experiment: Experiment): { id: string; name: string; weight: number } | null {
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0)
    if (totalWeight === 0) return null
    
    const random = Math.random() * totalWeight
    let cumulative = 0
    
    for (const variant of experiment.variants) {
      cumulative += variant.weight
      if (random < cumulative) {
        return variant
      }
    }
    
    return experiment.variants[0] // Fallback
  }
  
  private async saveAssignment(assignment: ExperimentAssignment): Promise<void> {
    try {
      const supabase = createClient()
      await supabase.from('experiment_assignments').insert({
        experiment_id: assignment.experimentId,
        variant_id: assignment.variantId,
        user_id: assignment.userId,
        assigned_at: assignment.assignedAt.toISOString(),
      })
    } catch (error) {
      console.error('Failed to save assignment:', error)
    }
  }
  
  // Track experiment event
  async trackEvent(experimentId: string, event: string, value?: number): Promise<void> {
    if (!this.userId) return
    
    const assignmentKey = `${experimentId}-${this.userId}`
    const assignment = this.assignments.get(assignmentKey)
    if (!assignment) return
    
    try {
      const supabase = createClient()
      await supabase.from('experiment_events').insert({
        experiment_id: experimentId,
        variant_id: assignment.variantId,
        user_id: this.userId,
        event,
        value,
        created_at: new Date().toISOString(),
      })
      
      // Track in metrics
      const metrics = MetricsCollector.getInstance()
      metrics.incrementCounter('experiment_events', {
        experiment: experimentId,
        variant: assignment.variantId,
        event,
      })
      
      if (value !== undefined) {
        metrics.recordBusinessMetric('experiment_value', value, {
          experiment: experimentId,
          variant: assignment.variantId,
          event,
        })
      }
    } catch (error) {
      console.error('Failed to track experiment event:', error)
    }
  }
}

// React hook for experiments
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function useExperiment(experimentId: string): {
  variant: string | null
  loading: boolean
  trackEvent: (event: string, value?: number) => Promise<void>
} {
  const { user } = useAuth()
  const [variant, setVariant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    
    const manager = ExperimentManager.getInstance()
    
    const loadVariant = async () => {
      await manager.initialize(user.id)
      const assignedVariant = await manager.getVariant(experimentId)
      setVariant(assignedVariant)
      setLoading(false)
    }
    
    loadVariant()
  }, [user, experimentId])
  
  const trackEvent = async (event: string, value?: number) => {
    if (!user) return
    const manager = ExperimentManager.getInstance()
    await manager.trackEvent(experimentId, event, value)
  }
  
  return { variant, loading, trackEvent }
}

// Predefined experiments
export const EXPERIMENTS = {
  ONBOARDING_FLOW: 'onboarding-flow-v2',
  VIDEO_PLAYER_UI: 'video-player-ui-v3',
  PRICING_PAGE: 'pricing-page-layout',
  FLOW_EDITOR_TUTORIAL: 'flow-editor-tutorial',
  MOBILE_NAV_STYLE: 'mobile-nav-style',
} as const

// Example usage component
export function ExperimentExample() {
  const { variant, loading, trackEvent } = useExperiment(EXPERIMENTS.ONBOARDING_FLOW)
  
  useEffect(() => {
    if (!loading && variant) {
      // Track page view
      trackEvent('page_view')
    }
  }, [loading, variant, trackEvent])
  
  if (loading) return <div>Loading...</div>
  
  switch (variant) {
    case 'control':
      return <div>Original onboarding flow</div>
    case 'variant-a':
      return <div>New guided onboarding with tooltips</div>
    case 'variant-b':
      return <div>Video-based onboarding tutorial</div>
    default:
      return <div>Default onboarding</div>
  }
}

// Server-side experiment evaluation
export async function getServerSideVariant(
  experimentId: string,
  userId: string
): Promise<string | null> {
  try {
    const supabase = createClient()
    
    // Check existing assignment
    const { data: assignment } = await supabase
      .from('experiment_assignments')
      .select('variant_id')
      .eq('experiment_id', experimentId)
      .eq('user_id', userId)
      .single()
    
    if (assignment) {
      return assignment.variant_id
    }
    
    // Get experiment
    const { data: experiment } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .eq('enabled', true)
      .single()
    
    if (!experiment) return null
    
    // Assign variant
    const variants = experiment.variants as Array<{ id: string; weight: number }>
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    const random = Math.random() * totalWeight
    let cumulative = 0
    let selectedVariant = variants[0]
    
    for (const variant of variants) {
      cumulative += variant.weight
      if (random < cumulative) {
        selectedVariant = variant
        break
      }
    }
    
    // Save assignment
    await supabase.from('experiment_assignments').insert({
      experiment_id: experimentId,
      variant_id: selectedVariant.id,
      user_id: userId,
      assigned_at: new Date().toISOString(),
    })
    
    return selectedVariant.id
  } catch (error) {
    console.error('Failed to get server-side variant:', error)
    return null
  }
}