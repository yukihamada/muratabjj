import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Use the server-side supabase client
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planId, locale = 'ja' } = await request.json();

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
      .from('users_profile')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
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
        .from('users_profile')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId!,
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