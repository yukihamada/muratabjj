import { supabase } from './client'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

// User Profile helpers
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Tables['user_profiles']['Update']>
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Techniques helpers
export async function getTechniques(category?: string) {
  let query = supabase.from('techniques').select('*')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query.order('difficulty', { ascending: true })
  
  return { data, error }
}

export async function getTechniqueById(id: string) {
  const { data, error } = await supabase
    .from('techniques')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

// Videos helpers
export async function getVideos(filters?: {
  techniqueId?: string
  beltRequirement?: string
  isPremium?: boolean
}) {
  let query = supabase.from('videos').select(`
    *,
    technique:techniques(*)
  `)
  
  if (filters?.techniqueId) {
    query = query.eq('technique_id', filters.techniqueId)
  }
  if (filters?.beltRequirement) {
    query = query.eq('belt_requirement', filters.beltRequirement)
  }
  if (filters?.isPremium !== undefined) {
    query = query.eq('is_premium', filters.isPremium)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getVideoWithChapters(videoId: string) {
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select(`
      *,
      technique:techniques(*),
      chapters:video_chapters(*)
    `)
    .eq('id', videoId)
    .single()
  
  if (videoError) return { data: null, error: videoError }
  
  // Sort chapters by order_index
  if (video?.chapters) {
    video.chapters.sort((a: any, b: any) => a.order_index - b.order_index)
  }
  
  return { data: video, error: null }
}

// User Progress helpers
export async function getUserProgress(userId: string, techniqueId?: string) {
  let query = supabase
    .from('user_progress')
    .select(`
      *,
      technique:techniques(*)
    `)
    .eq('user_id', userId)
  
  if (techniqueId) {
    query = query.eq('technique_id', techniqueId)
  }
  
  const { data, error } = await query
  
  return { data, error }
}

export async function updateUserProgress(
  userId: string,
  techniqueId: string,
  progressLevel: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      technique_id: techniqueId,
      progress_level: progressLevel,
      notes,
      last_practiced: new Date().toISOString(),
      practice_count: 1 // This should be incremented in a real implementation
    })
    .select()
    .single()
  
  return { data, error }
}

// Sparring Log helpers
export async function createSparringLog(
  userId: string,
  log: {
    partnerName?: string
    partnerBelt?: string
    duration?: number
    startingPosition?: string
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('sparring_logs')
    .insert({
      user_id: userId,
      partner_name: log.partnerName,
      partner_belt: log.partnerBelt,
      duration: log.duration,
      starting_position: log.startingPosition,
      notes: log.notes
    })
    .select()
    .single()
  
  return { data, error }
}

export async function addSparringEvent(
  sparringLogId: string,
  event: {
    eventType: 'pass' | 'sweep' | 'submission' | 'escape' | 'takedown' | 'back_take'
    techniqueId?: string
    success?: boolean
    timestamp?: number
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('sparring_events')
    .insert({
      sparring_log_id: sparringLogId,
      event_type: event.eventType,
      technique_id: event.techniqueId,
      success: event.success,
      timestamp: event.timestamp,
      notes: event.notes
    })
    .select()
    .single()
  
  return { data, error }
}

// Flow helpers
export async function getUserFlows(userId: string) {
  const { data, error } = await supabase
    .from('flows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getFlowWithDetails(flowId: string) {
  const { data: flow, error: flowError } = await supabase
    .from('flows')
    .select(`
      *,
      nodes:flow_nodes(*),
      edges:flow_edges(*)
    `)
    .eq('id', flowId)
    .single()
  
  return { data: flow, error: flowError }
}

export async function saveFlow(
  userId: string,
  flow: {
    name: string
    description?: string
    isPublic?: boolean
    tags?: string[]
  },
  nodes: any[],
  edges: any[]
) {
  // Start a transaction-like operation
  const { data: flowData, error: flowError } = await supabase
    .from('flows')
    .insert({
      user_id: userId,
      name: flow.name,
      description: flow.description,
      is_public: flow.isPublic || false,
      tags: flow.tags
    })
    .select()
    .single()
  
  if (flowError) return { data: null, error: flowError }
  
  // Insert nodes
  const nodeInserts = nodes.map(node => ({
    flow_id: flowData.id,
    technique_id: node.technique_id,
    custom_name: node.custom_name,
    position_x: node.position.x,
    position_y: node.position.y,
    node_type: node.node_type || 'technique'
  }))
  
  const { data: nodeData, error: nodeError } = await supabase
    .from('flow_nodes')
    .insert(nodeInserts)
    .select()
  
  if (nodeError) return { data: null, error: nodeError }
  
  // Create node ID mapping
  const nodeIdMap = new Map()
  nodes.forEach((node, index) => {
    nodeIdMap.set(node.id, nodeData[index].id)
  })
  
  // Insert edges with mapped IDs
  const edgeInserts = edges.map(edge => ({
    flow_id: flowData.id,
    source_node_id: nodeIdMap.get(edge.source),
    target_node_id: nodeIdMap.get(edge.target),
    label: edge.label
  }))
  
  const { error: edgeError } = await supabase
    .from('flow_edges')
    .insert(edgeInserts)
  
  if (edgeError) return { data: null, error: edgeError }
  
  return { data: flowData, error: null }
}

// Subscription helpers
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export async function hasActiveSubscription(userId: string, planTypes: string[]) {
  const { data, error } = await supabase
    .rpc('has_active_subscription', {
      user_uuid: userId,
      required_plans: planTypes
    })
  
  return { data: data || false, error }
}

// Review Schedule helpers
export async function getReviewItems(userId: string, limit: number = 10) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('review_schedule')
    .select(`
      *,
      technique:techniques(*)
    `)
    .eq('user_id', userId)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })
    .limit(limit)
  
  return { data, error }
}

export async function updateReviewSchedule(
  userId: string,
  techniqueId: string,
  quality: number // 0-5 rating of how well they remembered
) {
  // Simplified SM-2 algorithm
  const calculateNextInterval = (
    interval: number,
    easeFactor: number,
    quality: number
  ) => {
    if (quality < 3) {
      return 1 // Reset to 1 day if quality is poor
    }
    
    const newEaseFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )
    
    const newInterval = Math.round(interval * newEaseFactor)
    
    return { interval: newInterval, easeFactor: newEaseFactor }
  }
  
  // Get current review data
  const { data: current } = await supabase
    .from('review_schedule')
    .select('*')
    .eq('user_id', userId)
    .eq('technique_id', techniqueId)
    .single()
  
  const currentInterval = current?.review_interval || 1
  const currentEaseFactor = current?.ease_factor || 2.5
  
  const result = calculateNextInterval(
    currentInterval,
    currentEaseFactor,
    quality
  )
  
  const interval = typeof result === 'number' ? result : result.interval
  const easeFactor = typeof result === 'number' ? currentEaseFactor : result.easeFactor
  
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)
  
  const { data, error } = await supabase
    .from('review_schedule')
    .upsert({
      user_id: userId,
      technique_id: techniqueId,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      review_interval: interval,
      ease_factor: easeFactor,
      review_count: (current?.review_count || 0) + 1,
      last_reviewed: new Date().toISOString()
    })
    .select()
    .single()
  
  return { data, error }
}