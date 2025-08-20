import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('supabase-auth-token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's dojos
    const { data: dojos, error } = await supabase
      .from('dojos')
      .select(`
        *,
        dojo_members!inner(
          user_id,
          role
        )
      `)
      .eq('dojo_members.user_id', token.value)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ dojos })
  } catch (error) {
    console.error('Error fetching dojos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('supabase-auth-token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    // Check if user is a coach
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('is_coach')
      .eq('user_id', token.value)
      .single()

    if (profileError || !profile?.is_coach) {
      return NextResponse.json({ error: 'Only coaches can create dojos' }, { status: 403 })
    }

    // Create dojo
    const { data: dojo, error: dojoError } = await supabase
      .from('dojos')
      .insert({
        name,
        description,
        owner_id: token.value,
        is_active: true,
        max_members: 50,
      })
      .select()
      .single()

    if (dojoError) throw dojoError

    // Add owner as admin member
    const { error: memberError } = await supabase
      .from('dojo_members')
      .insert({
        dojo_id: dojo.id,
        user_id: token.value,
        role: 'admin',
      })

    if (memberError) throw memberError

    return NextResponse.json({ dojo })
  } catch (error) {
    console.error('Error creating dojo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}