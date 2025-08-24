import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

// Grafana Cloud configuration
export interface GrafanaConfig {
  instanceId: string
  apiKey: string
  prometheusUrl: string
  lokiUrl: string
  tempoUrl: string
}

// Get Grafana configuration from environment variables
export function getGrafanaConfig(): GrafanaConfig | null {
  const instanceId = typeof process !== 'undefined' ? process.env.GRAFANA_INSTANCE_ID : undefined
  const apiKey = typeof process !== 'undefined' ? process.env.GRAFANA_API_KEY : undefined
  
  if (!instanceId || !apiKey) {
    return null
  }
  
  return {
    instanceId,
    apiKey,
    prometheusUrl: `https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom`,
    lokiUrl: `https://logs-prod-006.grafana.net`,
    tempoUrl: `https://tempo-prod-04-prod-us-central-0.grafana.net`,
  }
}

// Metrics collection
export class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Map<string, number[]> = new Map()
  private counters: Map<string, number> = new Map()
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }
  
  // Record a metric value
  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels)
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key)!.push(value)
  }
  
  // Increment a counter
  incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + 1)
  }
  
  // Record response time
  recordResponseTime(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.recordGauge('http_request_duration_ms', duration, {
      endpoint,
      method,
      status: statusCode.toString(),
    })
    
    this.incrementCounter('http_requests_total', {
      endpoint,
      method,
      status: statusCode.toString(),
    })
  }
  
  // Record database query time
  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.recordGauge('database_query_duration_ms', duration, {
      operation,
      table,
    })
    
    this.incrementCounter('database_queries_total', {
      operation,
      table,
    })
  }
  
  // Record custom business metrics
  recordBusinessMetric(name: string, value: number, labels?: Record<string, string>): void {
    this.recordGauge(`business_${name}`, value, labels)
  }
  
  // Get all metrics in Prometheus format
  getMetricsInPrometheusFormat(): string {
    const lines: string[] = []
    
    // Export gauges
    this.metrics.forEach((values, key) => {
      const { name, labels } = this.parseMetricKey(key)
      const labelsStr = this.formatLabels(labels)
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length
      
      lines.push(`# TYPE ${name} gauge`)
      lines.push(`${name}${labelsStr} ${avgValue}`)
    })
    
    // Export counters
    this.counters.forEach((value, key) => {
      const { name, labels } = this.parseMetricKey(key)
      const labelsStr = this.formatLabels(labels)
      
      lines.push(`# TYPE ${name} counter`)
      lines.push(`${name}${labelsStr} ${value}`)
    })
    
    // Add system metrics (only in Node.js runtime)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      lines.push(`# TYPE nodejs_memory_usage_bytes gauge`)
      lines.push(`nodejs_memory_usage_bytes ${process.memoryUsage().heapUsed}`)
    }
    
    return lines.join('\n')
  }
  
  // Clear old metrics (run periodically)
  clearOldMetrics(): void {
    this.metrics.forEach((values, key) => {
      // Keep only last 100 values
      if (values.length > 100) {
        this.metrics.set(key, values.slice(-100))
      }
    })
  }
  
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }
  
  private parseMetricKey(key: string): { name: string; labels: Record<string, string> } {
    const match = key.match(/^([^{]+)(\{(.*)\})?$/)
    if (!match) return { name: key, labels: {} }
    
    const name = match[1]
    const labelsStr = match[3]
    const labels: Record<string, string> = {}
    
    if (labelsStr) {
      labelsStr.split(',').forEach(pair => {
        const [k, v] = pair.split('=')
        if (k && v) {
          labels[k] = v.replace(/"/g, '')
        }
      })
    }
    
    return { name, labels }
  }
  
  private formatLabels(labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) return ''
    const pairs = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `{${pairs}}`
  }
}

// Middleware for automatic request tracking
export async function trackRequest(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const start = Date.now()
  const metrics = MetricsCollector.getInstance()
  
  try {
    const response = await handler()
    const duration = Date.now() - start
    
    metrics.recordResponseTime(
      request.nextUrl.pathname,
      request.method,
      response.status,
      duration
    )
    
    return response
  } catch (error) {
    const duration = Date.now() - start
    
    metrics.recordResponseTime(
      request.nextUrl.pathname,
      request.method,
      500,
      duration
    )
    
    throw error
  }
}

// Export metrics to Grafana Cloud
export async function exportMetricsToGrafana(): Promise<void> {
  const config = getGrafanaConfig()
  if (!config) return
  
  const metrics = MetricsCollector.getInstance()
  const metricsData = metrics.getMetricsInPrometheusFormat()
  
  try {
    const response = await fetch(`${config.prometheusUrl}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: metricsData,
    })
    
    if (!response.ok) {
      console.error('Failed to export metrics to Grafana:', response.statusText)
    }
  } catch (error) {
    console.error('Error exporting metrics to Grafana:', error)
  }
}

// Log structured data to Grafana Loki
export async function logToGrafana(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  const config = getGrafanaConfig()
  if (!config) return
  
  const timestamp = Date.now() * 1000000 // nanoseconds
  const labels = {
    app: 'murata-bjj',
    environment: typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development',
    level,
  }
  
  const logEntry = {
    streams: [
      {
        stream: labels,
        values: [
          [
            timestamp.toString(),
            JSON.stringify({ message, ...metadata }),
          ],
        ],
      },
    ],
  }
  
  try {
    await fetch(`${config.lokiUrl}/loki/api/v1/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(logEntry),
    })
  } catch (error) {
    console.error('Error logging to Grafana Loki:', error)
  }
}

// Create trace spans for distributed tracing
export class TraceSpan {
  private startTime: number
  private metadata: Record<string, any> = {}
  
  constructor(
    private name: string,
    private parentSpanId?: string
  ) {
    this.startTime = Date.now()
  }
  
  addMetadata(key: string, value: any): void {
    this.metadata[key] = value
  }
  
  async end(): Promise<void> {
    const duration = Date.now() - this.startTime
    const config = getGrafanaConfig()
    if (!config) return
    
    const span = {
      traceID: this.generateTraceId(),
      spanID: this.generateSpanId(),
      parentSpanID: this.parentSpanId,
      operationName: this.name,
      startTimeUnixNano: this.startTime * 1000000,
      endTimeUnixNano: (this.startTime + duration) * 1000000,
      tags: Object.entries(this.metadata).map(([key, value]) => ({
        key,
        vStr: String(value),
      })),
      process: {
        serviceName: 'murata-bjj',
        tags: [
          { key: 'environment', vStr: typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development' },
        ],
      },
    }
    
    try {
      await fetch(`${config.tempoUrl}/api/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({ spans: [span] }),
      })
    } catch (error) {
      console.error('Error sending trace to Tempo:', error)
    }
  }
  
  private generateTraceId(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  }
  
  private generateSpanId(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  }
}

// Setup periodic metrics export
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    exportMetricsToGrafana()
    MetricsCollector.getInstance().clearOldMetrics()
  }, 60000) // Export every minute
}