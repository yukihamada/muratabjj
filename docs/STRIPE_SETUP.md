# Stripe Integration Setup Guide

This guide explains how to set up Stripe integration for the Murata BJJ platform.

## Overview

The Murata BJJ platform uses Stripe for handling subscription payments with three tiers:
- **Free Plan**: Basic features (¥0)
- **Pro Plan**: Full features including Flow Editor (¥1,200/month)
- **Dojo Plan**: All Pro features plus multi-user management (¥6,000/month)

## Setup Steps

### 1. Stripe Account Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Complete your business verification
3. Set your account to live mode when ready (use test mode for development)

### 2. Create Products and Prices

In your Stripe Dashboard:

1. Navigate to **Products** → **Add product**
2. Create the following products:

#### Pro Plan
- **Name**: Murata BJJ Pro Plan
- **Description**: Full access to all BJJ training features including Flow Editor
- **Price**: ¥1,200 per month
- **Billing period**: Monthly
- **Currency**: JPY

#### Dojo Plan  
- **Name**: Murata BJJ Dojo Plan
- **Description**: Complete dojo management with all Pro features
- **Price**: ¥6,000 per month
- **Billing period**: Monthly
- **Currency**: JPY

3. Note down the Price IDs for each plan (format: `price_xxxxx`)

### 3. Configure Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret

### 4. Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Your webhook signing secret

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_xxxxx  # Pro plan price ID
STRIPE_DOJO_PRICE_ID=price_xxxxx  # Dojo plan price ID
```

### 5. Database Migration

Run the Stripe integration migration to add subscription fields to the profiles table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration
psql -h your-db-host -U your-db-user -d your-db-name -f supabase/migrations/002_stripe_integration.sql
```

### 6. Configure Customer Portal

1. In Stripe Dashboard, go to **Settings** → **Billing** → **Customer portal**
2. Enable the customer portal
3. Configure allowed actions:
   - Cancel subscriptions
   - Update payment methods
   - View invoices
4. Customize branding to match your site

## Testing

### Test Cards

Use these test card numbers in test mode:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

### Test Webhooks

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Integration Features

### Checkout Flow
1. User clicks subscribe on pricing page
2. System creates Stripe checkout session
3. User redirected to Stripe Checkout
4. After payment, user redirected back to success page
5. Webhook updates user's subscription in database

### Subscription Management
- Users can manage subscriptions from their profile
- Cancel subscription (continues until period end)
- Reactivate canceled subscription
- Access Stripe Customer Portal for billing

### Access Control
- `SubscriptionGuard` component protects premium features
- Server-side validation in API routes
- Database functions for subscription checks

## Security Considerations

1. **Webhook Validation**: Always verify webhook signatures
2. **Server-side Checks**: Don't trust client-side subscription status
3. **Rate Limiting**: Implement rate limiting on checkout creation
4. **Error Handling**: Log errors but don't expose sensitive details

## Monitoring

Monitor the following in production:
- Failed payments
- Subscription churn rate
- Webhook failures
- Checkout abandonment rate

## Support

For issues:
1. Check Stripe Dashboard logs
2. Verify webhook delivery
3. Check application logs
4. Test with Stripe CLI in development