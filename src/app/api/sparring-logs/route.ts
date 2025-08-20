import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies()
    const authCookie = cookieStore.get('supabase-auth-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authCookie.value
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch sparring logs for the user
    const { data: logs, error } = await supabaseAdmin
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
    // Check authentication
    const cookieStore = cookies()
    const authCookie = cookieStore.get('supabase-auth-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authCookie.value
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { partner_name, duration, starting_position, date, notes } = body

    // Create sparring log
    const { data: log, error } = await supabaseAdmin
      .from('sparring_logs')
      .insert({
        user_id: user.id,
        partner_name,
        duration,
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