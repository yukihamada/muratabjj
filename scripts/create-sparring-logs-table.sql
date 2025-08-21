-- Create sparring_logs table
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  starting_position TEXT NOT NULL DEFAULT 'standing',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own logs
CREATE POLICY "Users can view own sparring logs" ON sparring_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own logs
CREATE POLICY "Users can create own sparring logs" ON sparring_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update own sparring logs" ON sparring_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY "Users can delete own sparring logs" ON sparring_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_sparring_logs_user_id ON sparring_logs(user_id);
CREATE INDEX idx_sparring_logs_date ON sparring_logs(date DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sparring_logs_updated_at BEFORE UPDATE
  ON sparring_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();