import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('[Stripe API] Create checkout session request received');
  console.log('[Stripe API] Environment check:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
  });
  
  try {
    // Use the server-side supabase client
    const supabase = createClient();
    
    // Try to get user from session (cookie-based auth)
    let user;
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[Stripe API] Cookie auth error:', authError);
    } else {
      user = authData?.user;
      console.log('[Stripe API] User from cookie:', user?.id);
    }
    
    // If no user from cookie, try authorization header
    if (!user) {
      const authHeader = request.headers.get('authorization');
      console.log('[Stripe API] Authorization header:', authHeader ? 'present' : 'missing');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token);
        if (!tokenError && tokenData?.user) {
          user = tokenData.user;
          console.log('[Stripe API] User from token:', user.id);
        } else {
          console.error('[Stripe API] Token auth error:', tokenError);
        }
      }
    }
    
    if (!user) {
      console.error('[Stripe API] No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login to continue' },
        { status: 401 }
      );
    }
    
    console.log('[Stripe API] Authenticated user:', user.id, user.email);

    const { planId, locale = 'ja', billingPeriod = 'monthly' } = await request.json();

    // Validate plan
    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    
    // Don't create checkout session for free plan
    if (plan.id === 'free') {
      return NextResponse.json(
        { error: 'Cannot create checkout session for free plan' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID in the database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabaseUserId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id,
          user_id: user.id,
          stripe_customer_id: customerId,
          email: user.email
        })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: billingPeriod === 'yearly' ? plan.priceIdYearly! : plan.priceIdMonthly!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      locale: locale as any,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}