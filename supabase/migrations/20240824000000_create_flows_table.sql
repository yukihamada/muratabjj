-- Create flows table for storing BJJ technique flows
CREATE TABLE IF NOT EXISTS public.flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX flows_user_id_idx ON public.flows(user_id);
CREATE INDEX flows_is_public_idx ON public.flows(is_public);
CREATE INDEX flows_created_at_idx ON public.flows(created_at DESC);

-- Enable RLS
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own flows
CREATE POLICY "Users can view own flows" ON public.flows
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public flows
CREATE POLICY "Anyone can view public flows" ON public.flows
  FOR SELECT
  USING (is_public = true);

-- Users can insert their own flows
CREATE POLICY "Users can insert own flows" ON public.flows
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own flows
CREATE POLICY "Users can update own flows" ON public.flows
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own flows
CREATE POLICY "Users can delete own flows" ON public.flows
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.flows TO authenticated;
GRANT SELECT ON public.flows TO anon;