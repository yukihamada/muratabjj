import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

interface RouteParams {
  params: {
    dojoId: string
    memberId: string
  }
}

// PATCH /api/dojos/[dojoId]/members/[memberId] - Update member role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId, memberId } = params
    
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
      return NextResponse.json({ error: 'Only coaches and owners can update members' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { role } = body

    if (!role || !['student', 'coach'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get the member to check if they're the owner
    const { data: member, error: fetchError } = await supabase
      .from('dojo_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('dojo_id', dojoId)
      .single()

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent changing owner's role
    if (member.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Update member role
    const { data: updatedMember, error: updateError } = await supabase
      .from('dojo_members')
      .update({ role })
      .eq('id', memberId)
      .select(`
        *,
        user:profiles!dojo_members_user_id_fkey(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/dojos/[dojoId]/members/[memberId] - Remove member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId, memberId } = params
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the member details
    const { data: member, error: fetchError } = await supabase
      .from('dojo_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('dojo_id', dojoId)
      .single()

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if user can remove this member
    const canRemove = await (async () => {
      // Members can remove themselves
      if (member.user_id === user.id) {
        // But owners cannot leave their own dojo
        if (member.role === 'owner') {
          return { allowed: false, reason: 'Owners cannot leave their own dojo' }
        }
        return { allowed: true }
      }

      // Check if user is coach or owner
      const { data: isAuthorized } = await supabase
        .rpc('is_dojo_coach_or_owner', { 
          user_id: user.id,
          dojo_id: dojoId 
        })

      if (!isAuthorized) {
        return { allowed: false, reason: 'Only coaches, owners, or the member themselves can remove members' }
      }

      // Coaches cannot remove owners or other coaches
      if (member.role === 'owner') {
        return { allowed: false, reason: 'Cannot remove the dojo owner' }
      }

      const { data: userRole } = await supabase
        .from('dojo_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('dojo_id', dojoId)
        .single()

      if (userRole?.role === 'coach' && member.role === 'coach') {
        return { allowed: false, reason: 'Coaches cannot remove other coaches' }
      }

      return { allowed: true }
    })()

    if (!canRemove.allowed) {
      return NextResponse.json({ error: canRemove.reason }, { status: 403 })
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('dojo_members')
      .update({ is_active: false })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Member removed successfully',
      removedMemberId: memberId
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}