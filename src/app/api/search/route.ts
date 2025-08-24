import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await apiRateLimit(request, identifier)
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, videos, techniques, flows
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const results = {
      videos: [] as any[],
      techniques: [] as any[],
      flows: [] as any[],
      total: 0,
    }

    // Search videos
    if (type === 'all' || type === 'videos') {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          duration,
          view_count,
          instructor_name,
          created_at,
          video_analyses!video_analyses_video_id_fkey (
            difficulty_level,
            recommended_belt,
            detected_techniques
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,instructor_name.ilike.%${query}%`)
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!videosError) {
        results.videos = videos || []
        results.total += results.videos.length
      }
    }

    // Search techniques
    if (type === 'all' || type === 'techniques') {
      const { data: techniques, error: techniquesError } = await supabase
        .from('techniques')
        .select(`
          id,
          name_ja,
          name_en,
          name_pt,
          category,
          position,
          description
        `)
        .or(`name_ja.ilike.%${query}%,name_en.ilike.%${query}%,name_pt.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name_ja')
        .range(offset, offset + limit - 1)

      if (!techniquesError) {
        results.techniques = techniques || []
        results.total += results.techniques.length
      }
    }

    // Search flows
    if (type === 'all' || type === 'flows') {
      const { data: flows, error: flowsError } = await supabase
        .from('flows')
        .select(`
          id,
          title,
          description,
          is_public,
          created_by,
          created_at
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!flowsError) {
        results.flows = flows || []
        results.total += results.flows.length
      }
    }

    // Add rate limit headers to response
    const response = NextResponse.json({
      results,
      query,
      type,
      limit,
      offset,
    })

    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())

    return response

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Search suggestions endpoint
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await apiRateLimit(request, identifier)
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { query } = await request.json()

    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] })
    }

    const supabase = createClient()
    const suggestions: string[] = []

    // Get popular search terms from videos
    const { data: videos } = await supabase
      .from('videos')
      .select('title')
      .ilike('title', `%${query}%`)
      .eq('is_published', true)
      .limit(5)

    if (videos) {
      suggestions.push(...videos.map(v => v.title))
    }

    // Get technique names
    const { data: techniques } = await supabase
      .from('techniques')
      .select('name_ja')
      .ilike('name_ja', `%${query}%`)
      .limit(3)

    if (techniques) {
      suggestions.push(...techniques.map(t => t.name_ja))
    }

    // Remove duplicates and limit to 10
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10)

    const response = NextResponse.json({ suggestions: uniqueSuggestions })

    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString())

    return response

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}