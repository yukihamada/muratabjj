import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

interface RouteParams {
  params: {
    dojoId: string
  }
}

// GET /api/dojos/[dojoId] - Get dojo details
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

    // Get dojo details with member count
    const { data: dojo, error } = await supabase
      .from('dojos')
      .select(`
        *,
        member_count:dojo_members(count),
        user_role:dojo_members!inner(role)
      `)
      .eq('id', dojoId)
      .eq('dojo_members.user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching dojo:', error)
      return NextResponse.json({ error: 'Dojo not found' }, { status: 404 })
    }

    return NextResponse.json({ dojo })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/dojos/[dojoId] - Update dojo
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId } = params
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or coach
    const { data: isAuthorized } = await supabase
      .rpc('is_dojo_coach_or_owner', { 
        user_id: user.id,
        dojo_id: dojoId 
      })

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Only coaches and owners can update dojos' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const updates: any = {}

    // Validate and prepare updates
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ error: 'Dojo name cannot be empty' }, { status: 400 })
      }
      updates.name = body.name.trim()
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null
    }

    if (body.max_members !== undefined) {
      if (body.max_members < 1) {
        return NextResponse.json({ error: 'Max members must be at least 1' }, { status: 400 })
      }
      updates.max_members = body.max_members
    }

    if (body.is_active !== undefined) {
      updates.is_active = body.is_active
    }

    // Update the dojo
    const { data: dojo, error } = await supabase
      .from('dojos')
      .update(updates)
      .eq('id', dojoId)
      .select()
      .single()

    if (error) {
      console.error('Error updating dojo:', error)
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A dojo with this name already exists'
        }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update dojo' }, { status: 500 })
    }

    return NextResponse.json({ dojo })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/dojos/[dojoId] - Delete dojo (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { dojoId } = params
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the owner
    const { data: dojo, error: fetchError } = await supabase
      .from('dojos')
      .select('owner_id')
      .eq('id', dojoId)
      .single()

    if (fetchError || !dojo) {
      return NextResponse.json({ error: 'Dojo not found' }, { status: 404 })
    }

    if (dojo.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only the owner can delete a dojo' }, { status: 403 })
    }

    // Delete the dojo (cascade will handle related records)
    const { error } = await supabase
      .from('dojos')
      .delete()
      .eq('id', dojoId)

    if (error) {
      console.error('Error deleting dojo:', error)
      return NextResponse.json({ error: 'Failed to delete dojo' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Dojo deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}