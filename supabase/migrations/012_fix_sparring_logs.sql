-- Fix sparring_logs table issues

-- Add missing columns
ALTER TABLE sparring_logs 
ADD COLUMN IF NOT EXISTS starting_position TEXT DEFAULT 'standing';

-- Add check constraint for starting_position
ALTER TABLE sparring_logs 
ADD CONSTRAINT sparring_logs_starting_position_check 
CHECK (starting_position IN ('standing', 'guard', 'mount', 'side-control', 'back-control', 'other'));

-- Fix date handling by ensuring proper type conversion
-- The date column is already correctly defined as DATE type

-- Add more detailed columns for better tracking
ALTER TABLE sparring_logs
ADD COLUMN IF NOT EXISTS gi_nogi TEXT DEFAULT 'gi' CHECK (gi_nogi IN ('gi', 'nogi', 'both')),
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can create their own sparring logs" ON sparring_logs;
CREATE POLICY "Users can create their own sparring logs" ON sparring_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure the updated_at trigger works
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sparring_logs_updated_at ON sparring_logs;
CREATE TRIGGER update_sparring_logs_updated_at 
  BEFORE UPDATE ON sparring_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();