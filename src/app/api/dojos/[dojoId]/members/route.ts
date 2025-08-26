import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import crypto from 'crypto'

interface RouteParams {
  params: {
    dojoId: string
  }
}

// GET /api/dojos/[dojoId]/members - Get dojo members
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId } = params
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of the dojo
    const { data: isMember } = await supabase
      .rpc('is_dojo_member', { 
        user_id: user.id,
        dojo_id: dojoId 
      })

    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all active members with their profiles
    const { data: members, error } = await supabase
      .from('dojo_members')
      .select(`
        *,
        user:profiles!dojo_members_user_id_fkey(
          id,
          email,
          full_name,
          avatar_url,
          belt_level,
          stripe_count
        ),
        invited_by_user:profiles!dojo_members_invited_by_fkey(
          full_name
        )
      `)
      .eq('dojo_id', dojoId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/dojos/[dojoId]/members - Invite new member
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId } = params
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is coach or owner
    const { data: isAuthorized } = await supabase
      .rpc('is_dojo_coach_or_owner', { 
        user_id: user.id,
        dojo_id: dojoId 
      })

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Only coaches and owners can invite members' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { email, role = 'student' } = body

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['student', 'coach'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if dojo has reached member limit
    const { count: memberCount } = await supabase
      .from('dojo_members')
      .select('*', { count: 'exact', head: true })
      .eq('dojo_id', dojoId)
      .eq('is_active', true)

    const { data: dojo } = await supabase
      .from('dojos')
      .select('max_members, name')
      .eq('id', dojoId)
      .single()

    if (dojo && memberCount && memberCount >= dojo.max_members) {
      return NextResponse.json({ 
        error: 'Member limit reached',
        message: `This dojo has reached its maximum of ${dojo.max_members} members`
      }, { status: 400 })
    }

    // Find user by email
    const { data: invitedUser } = await supabase
      .from('users_profile')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!invitedUser) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'No user found with this email address. They need to sign up first.'
      }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('dojo_members')
      .select('id, is_active')
      .eq('dojo_id', dojoId)
      .eq('user_id', invitedUser.id)
      .single()

    if (existingMember) {
      if (existingMember.is_active) {
        return NextResponse.json({ 
          error: 'User is already a member'
        }, { status: 409 })
      }
      
      // Reactivate inactive member
      const { data: member, error: updateError } = await supabase
        .from('dojo_members')
        .update({ 
          is_active: true,
          role,
          invited_by: user.id,
          joined_at: new Date().toISOString()
        })
        .eq('id', existingMember.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: 'Failed to reactivate member' }, { status: 500 })
      }

      return NextResponse.json({ member, reactivated: true })
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex')

    // Create new member record
    const { data: member, error: createError } = await supabase
      .from('dojo_members')
      .insert({
        dojo_id: dojoId,
        user_id: invitedUser.id,
        role,
        invited_by: user.id,
        invitation_token: invitationToken,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating member:', createError)
      return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
    }

    // TODO: Send invitation email with token
    // This would typically include a link to accept the invitation

    return NextResponse.json({ 
      member,
      message: 'Invitation sent successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}