import { useEffect, useCallback } from 'react'
import { MetricsCollector, TraceSpan, logToGrafana } from '@/lib/monitoring/grafana'

// Custom hook for component-level monitoring
export function useMonitoring(componentName: string) {
  const metrics = MetricsCollector.getInstance()
  
  // Track component mount/unmount
  useEffect(() => {
    const mountTime = Date.now()
    metrics.incrementCounter('component_mounts', { component: componentName })
    
    return () => {
      const lifespan = Date.now() - mountTime
      metrics.recordGauge('component_lifespan_ms', lifespan, { component: componentName })
    }
  }, [componentName, metrics])
  
  // Track user interactions
  const trackInteraction = useCallback((action: string, metadata?: Record<string, any>) => {
    metrics.incrementCounter('user_interactions', {
      component: componentName,
      action,
    })
    
    logToGrafana('info', 'User interaction', {
      component: componentName,
      action,
      ...metadata,
    })
  }, [componentName, metrics])
  
  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    metrics.incrementCounter('component_errors', {
      component: componentName,
      error: error.name,
    })
    
    logToGrafana('error', 'Component error', {
      component: componentName,
      error: error.message,
      stack: error.stack,
      context,
    })
  }, [componentName, metrics])
  
  // Track performance
  const measurePerformance = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const span = new TraceSpan(`${componentName}.${operationName}`)
    const start = Date.now()
    
    try {
      const result = await operation()
      const duration = Date.now() - start
      
      metrics.recordGauge('operation_duration_ms', duration, {
        component: componentName,
        operation: operationName,
      })
      
      span.addMetadata('duration_ms', duration)
      span.addMetadata('success', true)
      await span.end()
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      metrics.recordGauge('operation_duration_ms', duration, {
        component: componentName,
        operation: operationName,
      })
      
      span.addMetadata('duration_ms', duration)
      span.addMetadata('success', false)
      span.addMetadata('error', error instanceof Error ? error.message : 'Unknown error')
      await span.end()
      
      throw error
    }
  }, [componentName, metrics])
  
  return {
    trackInteraction,
    trackError,
    measurePerformance,
  }
}

// Hook for tracking page views
export function usePageView(pageName: string) {
  const metrics = MetricsCollector.getInstance()
  
  useEffect(() => {
    const enterTime = Date.now()
    
    metrics.incrementCounter('page_views', { page: pageName })
    
    logToGrafana('info', 'Page view', {
      page: pageName,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })
    
    return () => {
      const timeOnPage = Date.now() - enterTime
      metrics.recordGauge('time_on_page_ms', timeOnPage, { page: pageName })
    }
  }, [pageName, metrics])
}

// Hook for tracking business metrics
export function useBusinessMetrics() {
  const metrics = MetricsCollector.getInstance()
  
  const trackVideoView = useCallback((videoId: string, title: string, duration: number) => {
    metrics.incrementCounter('video_views', { video_id: videoId })
    metrics.recordBusinessMetric('video_watch_duration_seconds', duration, {
      video_id: videoId,
      title: title.substring(0, 50), // Truncate for label safety
    })
  }, [metrics])
  
  const trackTechniqueProgress = useCallback((techniqueId: string, level: number) => {
    metrics.recordBusinessMetric('technique_progress_level', level, {
      technique_id: techniqueId,
    })
  }, [metrics])
  
  const trackSubscriptionEvent = useCallback((event: 'created' | 'upgraded' | 'canceled', planId: string) => {
    metrics.incrementCounter('subscription_events', {
      event,
      plan: planId,
    })
  }, [metrics])
  
  const trackFlowInteraction = useCallback((action: 'created' | 'edited' | 'viewed', flowId: string) => {
    metrics.incrementCounter('flow_interactions', {
      action,
      flow_id: flowId,
    })
  }, [metrics])
  
  return {
    trackVideoView,
    trackTechniqueProgress,
    trackSubscriptionEvent,
    trackFlowInteraction,
  }
}