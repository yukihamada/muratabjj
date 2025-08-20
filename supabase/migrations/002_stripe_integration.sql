-- Add Stripe-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'dojo'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'canceling'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Add RLS policies for subscription fields
-- Users can only view their own subscription data
CREATE POLICY "Users can view own subscription data" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Only the system (via service role) can update subscription data
CREATE POLICY "Only system can update subscription data" ON profiles
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id UUID, required_plan TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF required_plan IS NULL THEN
    -- Check if user has any active paid subscription
    RETURN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_id
      AND subscription_status = 'active'
      AND subscription_plan IN ('pro', 'dojo')
      AND (subscription_current_period_end IS NULL OR subscription_current_period_end > NOW())
    );
  ELSE
    -- Check if user has specific plan
    RETURN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_id
      AND subscription_status = 'active'
      AND subscription_plan = required_plan
      AND (subscription_current_period_end IS NULL OR subscription_current_period_end > NOW())
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT subscription_plan INTO user_plan
  FROM profiles
  WHERE id = user_id
  AND subscription_status = 'active'
  AND (subscription_current_period_end IS NULL OR subscription_current_period_end > NOW());
  
  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;