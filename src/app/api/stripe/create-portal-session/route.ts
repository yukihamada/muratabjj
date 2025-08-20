import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('users_profile')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    
    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No customer record found' },
        { status: 400 }
      )
    }
    
    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    })
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Create portal session error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}