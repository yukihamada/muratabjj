-- Sparring logs table
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- seconds
  starting_position TEXT NOT NULL DEFAULT 'standing',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sparring events table
CREATE TABLE IF NOT EXISTS sparring_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sparring_log_id UUID REFERENCES sparring_logs(id) ON DELETE CASCADE NOT NULL,
  timestamp INTEGER NOT NULL, -- seconds from start
  event_type TEXT NOT NULL, -- 'submission', 'sweep', 'pass', 'takedown', etc.
  position TEXT,
  technique TEXT,
  success BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS sparring_logs_user_id_idx ON sparring_logs(user_id);
CREATE INDEX IF NOT EXISTS sparring_logs_date_idx ON sparring_logs(date);
CREATE INDEX IF NOT EXISTS sparring_events_log_id_idx ON sparring_events(sparring_log_id);

-- Row Level Security
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sparring_logs
CREATE POLICY "Users can view own sparring logs" ON sparring_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sparring logs" ON sparring_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sparring logs" ON sparring_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sparring logs" ON sparring_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sparring_events
CREATE POLICY "Users can view own sparring events" ON sparring_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sparring events" ON sparring_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sparring events" ON sparring_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sparring events" ON sparring_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sparring_logs_updated_at BEFORE UPDATE ON sparring_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();