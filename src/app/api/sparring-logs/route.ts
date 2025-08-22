import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function createSupabaseServer() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch sparring logs for the user
    const { data: logs, error } = await supabase
      .from('sparring_logs')
      .select(`
        *,
        events:sparring_events(*)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching sparring logs:', error)
      return NextResponse.json({ error: 'Failed to fetch sparring logs' }, { status: 500 })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error('Error in sparring logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { partner_name, duration, starting_position, date, notes } = body

    // Validate required fields
    if (!partner_name || !duration || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: partner_name, duration, date' 
      }, { status: 400 })
    }

    // Create sparring log
    const { data: log, error } = await supabase
      .from('sparring_logs')
      .insert({
        user_id: user.id,
        partner_name,
        duration: parseInt(duration),
        starting_position,
        date: new Date(date).toISOString(),
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sparring log:', error)
      return NextResponse.json({ error: 'Failed to create sparring log' }, { status: 500 })
    }

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Error in sparring logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}