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
    console.log('Creating Stripe products for new pricing structure...\n');

    const plans = [];
    const prices = [];

    // Create Basic Plan Product
    const basicPlan = await stripe.products.create({
      name: 'Murata BJJ Basic',
      description: 'Basic plan with video access and progress tracking',
      metadata: {
        plan_type: 'basic'
      }
    });
    console.log('✅ Created Basic Plan product:', basicPlan.id);
    plans.push({ name: 'basic', product: basicPlan });

    // Create Pro Plan Product
    const proPlan = await stripe.products.create({
      name: 'Murata BJJ Pro',
      description: 'Pro plan with unlimited access and AI features',
      metadata: {
        plan_type: 'pro'
      }
    });
    console.log('✅ Created Pro Plan product:', proPlan.id);
    plans.push({ name: 'pro', product: proPlan });

    // Create Master Plan Product
    const masterPlan = await stripe.products.create({
      name: 'Murata BJJ Master',
      description: 'Master plan with personal coaching and premium features',
      metadata: {
        plan_type: 'master'
      }
    });
    console.log('✅ Created Master Plan product:', masterPlan.id);
    plans.push({ name: 'master', product: masterPlan });

    // Create Dojo Basic Plan Product
    const dojoBasicPlan = await stripe.products.create({
      name: 'Murata BJJ Dojo Basic',
      description: 'Dojo basic plan for up to 10 students',
      metadata: {
        plan_type: 'dojo_basic'
      }
    });
    console.log('✅ Created Dojo Basic Plan product:', dojoBasicPlan.id);
    plans.push({ name: 'dojo_basic', product: dojoBasicPlan });

    // Create Dojo Pro Plan Product
    const dojoProfPlan = await stripe.products.create({
      name: 'Murata BJJ Dojo Pro',
      description: 'Dojo pro plan for up to 50 students with advanced features',
      metadata: {
        plan_type: 'dojo_pro'
      }
    });
    console.log('✅ Created Dojo Pro Plan product:', dojoProfPlan.id);
    plans.push({ name: 'dojo_pro', product: dojoProfPlan });

    // Plan pricing
    const planPrices = {
      basic: { monthly: 980, yearly: 9800 },
      pro: { monthly: 2480, yearly: 24800 },
      master: { monthly: 3980, yearly: 39800 },
      dojo_basic: { monthly: 9800, yearly: 98000 },
      dojo_pro: { monthly: 19800, yearly: 198000 }
    };

    // Create prices for each plan
    for (const plan of plans) {
      const pricing = planPrices[plan.name];
      
      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: plan.product.id,
        unit_amount: pricing.monthly,
        currency: 'jpy',
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan_type: plan.name,
          billing_period: 'monthly'
        }
      });
      console.log(`✅ Created ${plan.name} Monthly price:`, monthlyPrice.id);
      prices.push({ plan: plan.name, period: 'monthly', price: monthlyPrice });

      // Create yearly price (15% discount)
      const yearlyPrice = await stripe.prices.create({
        product: plan.product.id,
        unit_amount: pricing.yearly,
        currency: 'jpy',
        recurring: {
          interval: 'year',
        },
        metadata: {
          plan_type: plan.name,
          billing_period: 'yearly'
        }
      });
      console.log(`✅ Created ${plan.name} Yearly price:`, yearlyPrice.id);
      prices.push({ plan: plan.name, period: 'yearly', price: yearlyPrice });
    }

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
    
    // Generate environment variables for all plans
    const envVars = {};
    for (const { plan, period, price } of prices) {
      const envKey = `STRIPE_${plan.toUpperCase()}_PRICE_ID_${period.toUpperCase()}`;
      envVars[envKey] = price.id;
      console.log(`${envKey}=${price.id}`);
    }
    
    console.log(`STRIPE_PORTAL_CONFIG_ID=${portalConfig.id}`);
    
    console.log('\n📋 Price Summary:');
    console.log('Personal Plans:');
    console.log('  Basic: ¥980/month (¥9,800/year)');
    console.log('  Pro: ¥2,480/month (¥24,800/year)');
    console.log('  Master: ¥3,980/month (¥39,800/year)');
    console.log('\nDojo Plans:');
    console.log('  Dojo Basic: ¥9,800/month (¥98,000/year)');
    console.log('  Dojo Pro: ¥19,800/month (¥198,000/year)');
    console.log('  Dojo Enterprise: Custom pricing (contact sales)');
    
    console.log('\n💡 Next steps:');
    console.log('1. Add the environment variables to your .env.local file');
    console.log('2. Update your Vercel environment variables');
    console.log('3. Test the checkout flow');
    console.log('4. Set up webhooks for production');

  } catch (error) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

// Run the setup
createProducts();