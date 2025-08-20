import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

interface RouteParams {
  params: {
    dojoId: string
  }
}

// GET /api/dojos/[dojoId]/curriculums - Get dojo curriculums
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const beltLevel = searchParams.get('belt_level')

    // Build query
    let query = supabase
      .from('curriculums')
      .select(`
        *,
        created_by_user:profiles!curriculums_created_by_fkey(
          full_name,
          avatar_url
        ),
        curriculum_items(
          id,
          item_type,
          order_index,
          is_required
        )
      `)
      .eq('dojo_id', dojoId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply belt level filter if provided
    if (beltLevel && beltLevel !== 'all') {
      query = query.or(`belt_level.eq.${beltLevel},belt_level.eq.all`)
    }

    const { data: curriculums, error } = await query

    if (error) {
      console.error('Error fetching curriculums:', error)
      return NextResponse.json({ error: 'Failed to fetch curriculums' }, { status: 500 })
    }

    return NextResponse.json({ curriculums })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/dojos/[dojoId]/curriculums - Create new curriculum
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
      return NextResponse.json({ error: 'Only coaches and owners can create curriculums' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { title, description, belt_level = 'all', items = [] } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Curriculum title is required' }, { status: 400 })
    }

    const validBeltLevels = ['white', 'blue', 'purple', 'brown', 'black', 'all']
    if (!validBeltLevels.includes(belt_level)) {
      return NextResponse.json({ error: 'Invalid belt level' }, { status: 400 })
    }

    // Start a transaction
    const { data: curriculum, error: createError } = await supabase
      .from('curriculums')
      .insert({
        dojo_id: dojoId,
        title: title.trim(),
        description: description?.trim() || null,
        belt_level,
        created_by: user.id,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating curriculum:', createError)
      return NextResponse.json({ error: 'Failed to create curriculum' }, { status: 500 })
    }

    // Add curriculum items if provided
    if (items.length > 0) {
      const curriculumItems = items.map((item: any, index: number) => ({
        curriculum_id: curriculum.id,
        item_type: item.item_type,
        item_id: item.item_id || null,
        title: item.title || null,
        description: item.description || null,
        order_index: index,
        is_required: item.is_required !== false
      }))

      const { error: itemsError } = await supabase
        .from('curriculum_items')
        .insert(curriculumItems)

      if (itemsError) {
        // Roll back by deleting the curriculum
        await supabase
          .from('curriculums')
          .delete()
          .eq('id', curriculum.id)

        console.error('Error creating curriculum items:', itemsError)
        return NextResponse.json({ error: 'Failed to create curriculum items' }, { status: 500 })
      }
    }

    // Fetch the complete curriculum with items
    const { data: completeCurriculum } = await supabase
      .from('curriculums')
      .select(`
        *,
        curriculum_items(*)
      `)
      .eq('id', curriculum.id)
      .single()

    return NextResponse.json({ curriculum: completeCurriculum }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}