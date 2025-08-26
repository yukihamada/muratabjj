import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/config';
import { createServiceClient } from '@/lib/supabase/service';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Use the service role client for admin operations
  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata!;
        
        // Update user subscription in database
        await supabase
          .from('users_profile')
          .update({
            subscription_plan: planId,
            subscription_status: 'active',
            stripe_subscription_id: session.subscription as string,
          })
          .eq('user_id', userId);
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId, planId } = subscription.metadata;
        
        await supabase
          .from('users_profile')
          .update({
            subscription_plan: planId,
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            subscription_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('user_id', userId);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;
        
        await supabase
          .from('users_profile')
          .update({
            subscription_plan: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            subscription_period_end: null,
          })
          .eq('user_id', userId);
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Get subscription to update period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { userId } = subscription.metadata;
        
        await supabase
          .from('users_profile')
          .update({
            subscription_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('user_id', userId);
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Get subscription metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { userId } = subscription.metadata;
        
        // Update subscription status
        await supabase
          .from('users_profile')
          .update({
            subscription_status: 'past_due',
          })
          .eq('user_id', userId);
        
        break;
      }

      default:
        // Unhandled event type - no action needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}