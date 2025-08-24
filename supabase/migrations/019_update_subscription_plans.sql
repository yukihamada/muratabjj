-- Migration: Update subscription plans to new pricing structure
-- Run this after deploying the new pricing system

-- First, let's see what subscription plans we have
-- This is just for documentation
-- Current plans: 'free', 'pro', 'dojo'
-- New plans: 'free', 'basic', 'pro', 'master', 'dojo_basic', 'dojo_pro', 'dojo_enterprise'

-- Update existing 'dojo' plans to 'dojo_basic' (legacy users get the basic dojo plan)
UPDATE user_profiles 
SET subscription_plan = 'dojo_basic'
WHERE subscription_plan = 'dojo';

-- Note: 'pro' plans remain as 'pro' (no change needed)
-- Note: 'free' plans remain as 'free' (no change needed)

-- Ensure all users have a subscription_plan value (default to 'free')
UPDATE user_profiles 
SET subscription_plan = 'free'
WHERE subscription_plan IS NULL;

-- Add index for better performance on subscription queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan 
ON user_profiles(subscription_plan);

-- Add index for subscription status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

-- Log the migration
INSERT INTO migration_logs (migration_name, executed_at, description)
VALUES ('019_update_subscription_plans', NOW(), 'Updated subscription plans to new pricing structure')
ON CONFLICT (migration_name) DO NOTHING;