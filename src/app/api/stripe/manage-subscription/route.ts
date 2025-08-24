import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Use the exported supabase client
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    // Get user's subscription info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'cancel': {
        // Cancel subscription at period end
        const subscription = await stripe.subscriptions.update(
          profile.stripe_subscription_id,
          {
            cancel_at_period_end: true,
          }
        );

        // Update database
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'cancelled',
          })
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          subscription,
        });
      }

      case 'reactivate': {
        // Reactivate canceled subscription
        const subscription = await stripe.subscriptions.update(
          profile.stripe_subscription_id,
          {
            cancel_at_period_end: false,
          }
        );

        // Update database
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'active',
          })
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          subscription,
        });
      }

      case 'create-portal': {
        // Create billing portal session for customer to manage subscription
        const session = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id!,
          return_url: `${request.headers.get('origin')}/dashboard/profile`,
        });

        return NextResponse.json({ url: session.url });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}