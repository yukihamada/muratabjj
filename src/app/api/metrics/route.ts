import { NextRequest, NextResponse } from 'next/server'
import { MetricsCollector } from '@/lib/monitoring/grafana'

// Expose metrics endpoint for Prometheus scraping
export async function GET(request: NextRequest) {
  try {
    // Check for metrics token (basic security)
    const token = request.headers.get('authorization')
    const expectedToken = process.env.METRICS_ACCESS_TOKEN
    
    if (expectedToken && token !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const metrics = MetricsCollector.getInstance()
    const metricsData = metrics.getMetricsInPrometheusFormat()
    
    return new NextResponse(metricsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}