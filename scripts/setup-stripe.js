#!/usr/bin/env node

const Stripe = require('stripe');

// This script helps create Stripe products and prices
// Run with: node scripts/setup-stripe.js

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here';

if (STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
  console.error('Please set STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createProducts() {
  try {
    console.log('Creating Stripe products...\n');

    // Create Pro Plan Product
    const proPlan = await stripe.products.create({
      name: 'Murata BJJ Pro',
      description: 'Pro plan with full access to all features',
      metadata: {
        plan_type: 'pro'
      }
    });
    console.log('✅ Created Pro Plan product:', proPlan.id);

    // Create Pro Plan Prices
    const proMonthly = await stripe.prices.create({
      product: proPlan.id,
      unit_amount: 1200,
      currency: 'jpy',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: 'pro',
        billing_period: 'monthly'
      }
    });
    console.log('✅ Created Pro Monthly price:', proMonthly.id);

    const proYearly = await stripe.prices.create({
      product: proPlan.id,
      unit_amount: 12000,
      currency: 'jpy',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan_type: 'pro',
        billing_period: 'yearly'
      }
    });
    console.log('✅ Created Pro Yearly price:', proYearly.id);

    // Create Dojo Plan Product
    const dojoPlan = await stripe.products.create({
      name: 'Murata BJJ Dojo',
      description: 'Dojo plan for coaches and gym owners',
      metadata: {
        plan_type: 'dojo'
      }
    });
    console.log('✅ Created Dojo Plan product:', dojoPlan.id);

    // Create Dojo Plan Prices
    const dojoMonthly = await stripe.prices.create({
      product: dojoPlan.id,
      unit_amount: 6000,
      currency: 'jpy',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: 'dojo',
        billing_period: 'monthly'
      }
    });
    console.log('✅ Created Dojo Monthly price:', dojoMonthly.id);

    const dojoYearly = await stripe.prices.create({
      product: dojoPlan.id,
      unit_amount: 60000,
      currency: 'jpy',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan_type: 'dojo',
        billing_period: 'yearly'
      }
    });
    console.log('✅ Created Dojo Yearly price:', dojoYearly.id);

    // Create customer portal configuration
    const portalConfig = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Murata BJJ - Manage your subscription',
      },
      features: {
        customer_update: {
          allowed_updates: ['email', 'tax_id'],
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
        },
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          default_allowed_updates: ['price'],
          enabled: true,
          proration_behavior: 'create_prorations',
        },
      },
    });
    console.log('✅ Created Customer Portal configuration:', portalConfig.id);

    console.log('\n🎉 Setup complete! Add these to your .env.local:\n');
    console.log(`STRIPE_PRO_PRICE_ID_MONTHLY=${proMonthly.id}`);
    console.log(`STRIPE_PRO_PRICE_ID_YEARLY=${proYearly.id}`);
    console.log(`STRIPE_DOJO_PRICE_ID_MONTHLY=${dojoMonthly.id}`);
    console.log(`STRIPE_DOJO_PRICE_ID_YEARLY=${dojoYearly.id}`);
    console.log(`STRIPE_PORTAL_CONFIG_ID=${portalConfig.id}`);

  } catch (error) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

// Run the setup
createProducts();