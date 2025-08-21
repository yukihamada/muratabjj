# Murata BJJ Deployment Guide

## Prerequisites

- Vercel account
- Stripe account
- Supabase project
- Custom domain (muratabjj.com)

## Step 1: Stripe Setup

### 1.1 Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create the following products:

#### Pro Plan
- Name: `Murata BJJ Pro`
- Price: 
  - Monthly: ¥1,200/month (recurring)
  - Yearly: ¥12,000/year (recurring)

#### Dojo Plan
- Name: `Murata BJJ Dojo`
- Price:
  - Monthly: ¥6,000/month (recurring)
  - Yearly: ¥60,000/year (recurring)

### 1.2 Get Price IDs

After creating products, copy the price IDs and update `.env.local`:

```env
STRIPE_PRO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRO_PRICE_ID_YEARLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_YEARLY=price_xxxxx
```

### 1.3 Set up Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint:
   - URL: `https://muratabjj.com/api/stripe/webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. Copy the webhook secret and add to environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Step 2: Vercel Deployment

### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import `yukihamada/muratabjj` repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Node.js Version: 18.x

### 2.2 Environment Variables

Add all environment variables in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vyddhllzjjpqxbouqivf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRO_PRICE_ID_YEARLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_DOJO_PRICE_ID_YEARLY=price_xxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# App
NEXT_PUBLIC_APP_URL=https://muratabjj.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@muratabjj.com
```

### 2.3 Deploy

Click "Deploy" and wait for the build to complete.

## Step 3: Domain Setup

### 3.1 Add Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add `muratabjj.com`
3. Follow DNS configuration instructions:
   - Add A record: `@` → `76.76.21.21`
   - Add CNAME record: `www` → `cname.vercel-dns.com`

### 3.2 SSL Certificate

Vercel automatically provisions SSL certificates. Wait for verification to complete.

## Step 4: Supabase Configuration

### 4.1 Update Authentication URLs

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://muratabjj.com`
- Redirect URLs:
  ```
  https://muratabjj.com/auth/callback
  https://muratabjj.com/dashboard
  ```

### 4.2 Enable Google OAuth

1. Go to Authentication > Providers
2. Enable Google
3. Add OAuth credentials from Google Cloud Console
4. Set redirect URL: `https://vyddhllzjjpqxbouqivf.supabase.co/auth/v1/callback`

### 4.3 Storage Buckets

Ensure these buckets exist and have proper policies:
- `videos` - Public read for authenticated users
- `thumbnails` - Public read

## Step 5: Post-Deployment Tasks

### 5.1 Test Checklist

- [ ] User registration and login
- [ ] Google OAuth login
- [ ] Video upload and playback
- [ ] Whisper transcription
- [ ] Progress tracking
- [ ] Sparring log with timer
- [ ] Adaptive review system
- [ ] Stripe subscription flow
- [ ] Webhook processing
- [ ] Dojo management (with dojo plan)

### 5.2 Admin Setup

1. Create admin user account
2. Update user role in database:
   ```sql
   UPDATE users_profile 
   SET role = 'admin', is_coach = true 
   WHERE email = 'admin@muratabjj.com';
   ```

### 5.3 Initial Content

1. Upload sample videos
2. Create initial techniques
3. Set up default flows
4. Test all features

## Step 6: Monitoring

### 6.1 Error Tracking

Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance monitoring

### 6.2 Logs

Monitor:
- Vercel Functions logs
- Supabase logs
- Stripe webhook logs

## Troubleshooting

### Common Issues

1. **Authentication errors**
   - Check redirect URLs in Supabase
   - Verify environment variables

2. **Payment errors**
   - Verify Stripe API keys
   - Check webhook secret
   - Ensure price IDs are correct

3. **Video upload errors**
   - Check Supabase storage policies
   - Verify file size limits

4. **Build errors**
   - Clear cache and redeploy
   - Check environment variables

## Security Checklist

- [ ] All API keys are in environment variables
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only used server-side
- [ ] CORS is properly configured
- [ ] Rate limiting is in place

## Backup Strategy

1. Enable Supabase daily backups
2. Export Stripe data regularly
3. Keep local copies of uploaded videos

---

For support, contact: admin@muratabjj.com