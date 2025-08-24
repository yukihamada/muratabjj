-- A/B Testing tables for experiments

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '[]',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_id, user_id)
);

-- Experiment events
CREATE TABLE IF NOT EXISTS experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_experiments_enabled ON experiments(enabled) WHERE enabled = true;
CREATE INDEX idx_experiments_dates ON experiments(start_date, end_date);
CREATE INDEX idx_assignments_user ON experiment_assignments(user_id);
CREATE INDEX idx_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX idx_events_experiment ON experiment_events(experiment_id, variant_id);
CREATE INDEX idx_events_user ON experiment_events(user_id);
CREATE INDEX idx_events_created ON experiment_events(created_at);

-- RLS Policies
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;

-- Experiments are read-only for users
CREATE POLICY "experiments_select" ON experiments
  FOR SELECT USING (enabled = true);

-- Users can only see their own assignments
CREATE POLICY "assignments_select_own" ON experiment_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert assignments
CREATE POLICY "assignments_insert_system" ON experiment_assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only insert their own events
CREATE POLICY "events_insert_own" ON experiment_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own events
CREATE POLICY "events_select_own" ON experiment_events
  FOR SELECT USING (auth.uid() = user_id);

-- Sample experiments
INSERT INTO experiments (name, description, variants, metrics, start_date, end_date)
VALUES 
  (
    'onboarding-flow-v2',
    'Test new onboarding flow with guided tutorial',
    '[
      {"id": "control", "name": "Original Flow", "weight": 50},
      {"id": "variant-a", "name": "Guided Tutorial", "weight": 25},
      {"id": "variant-b", "name": "Video Tutorial", "weight": 25}
    ]'::jsonb,
    '["completion_rate", "time_to_complete", "retention_7d"]'::jsonb,
    NOW(),
    NOW() + INTERVAL '30 days'
  ),
  (
    'video-player-ui-v3',
    'Test new video player UI with enhanced controls',
    '[
      {"id": "control", "name": "Current Player", "weight": 50},
      {"id": "variant-a", "name": "Enhanced Controls", "weight": 50}
    ]'::jsonb,
    '["engagement_time", "completion_rate", "interaction_rate"]'::jsonb,
    NOW(),
    NOW() + INTERVAL '14 days'
  ),
  (
    'pricing-page-layout',
    'Test different pricing page layouts',
    '[
      {"id": "control", "name": "Table Layout", "weight": 33},
      {"id": "variant-a", "name": "Card Layout", "weight": 33},
      {"id": "variant-b", "name": "Comparison Layout", "weight": 34}
    ]'::jsonb,
    '["conversion_rate", "time_on_page", "plan_selection"]'::jsonb,
    NOW(),
    NOW() + INTERVAL '21 days'
  );

-- Function to get experiment results
CREATE OR REPLACE FUNCTION get_experiment_results(p_experiment_id UUID)
RETURNS TABLE (
  variant_id TEXT,
  variant_name TEXT,
  user_count BIGINT,
  event_counts JSONB,
  avg_values JSONB,
  conversion_rates JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH variant_users AS (
    SELECT 
      variant_id,
      COUNT(DISTINCT user_id) as user_count
    FROM experiment_assignments
    WHERE experiment_id = p_experiment_id
    GROUP BY variant_id
  ),
  variant_events AS (
    SELECT 
      variant_id,
      event,
      COUNT(*) as event_count,
      AVG(value) as avg_value,
      COUNT(DISTINCT user_id) as users_with_event
    FROM experiment_events
    WHERE experiment_id = p_experiment_id
    GROUP BY variant_id, event
  ),
  aggregated_events AS (
    SELECT 
      variant_id,
      jsonb_object_agg(event, event_count) as event_counts,
      jsonb_object_agg(event, ROUND(avg_value::numeric, 2)) as avg_values,
      jsonb_object_agg(
        event, 
        ROUND((users_with_event::numeric / NULLIF((SELECT user_count FROM variant_users vu WHERE vu.variant_id = ve.variant_id), 0) * 100)::numeric, 2)
      ) as conversion_rates
    FROM variant_events ve
    GROUP BY variant_id
  )
  SELECT 
    vu.variant_id,
    (SELECT (variants::jsonb->>'name') 
     FROM experiments e, jsonb_array_elements(e.variants) variants 
     WHERE e.id = p_experiment_id 
     AND variants->>'id' = vu.variant_id
     LIMIT 1) as variant_name,
    vu.user_count,
    COALESCE(ae.event_counts, '{}'::jsonb),
    COALESCE(ae.avg_values, '{}'::jsonb),
    COALESCE(ae.conversion_rates, '{}'::jsonb)
  FROM variant_users vu
  LEFT JOIN aggregated_events ae ON vu.variant_id = ae.variant_id
  ORDER BY vu.variant_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_experiment_results TO authenticated;