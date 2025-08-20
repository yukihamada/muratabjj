-- Row Level Security Policies for Murata BJJ

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE dojos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dojo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;

-- Users Profile Policies
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON users_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their students profiles"
  ON users_profile FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members dm1
      JOIN dojo_members dm2 ON dm1.dojo_id = dm2.dojo_id
      WHERE dm1.user_id = auth.uid() 
      AND dm1.role IN ('coach', 'admin')
      AND dm2.user_id = users_profile.user_id
    )
  );

-- Techniques Policies (Public read)
CREATE POLICY "Anyone can view techniques"
  ON techniques FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage techniques"
  ON techniques FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND is_coach = true
    )
  );

-- Videos Policies
CREATE POLICY "Authenticated users can view non-premium videos"
  ON videos FOR SELECT
  TO authenticated
  USING (is_premium = false);

CREATE POLICY "Pro/Dojo users can view premium videos"
  ON videos FOR SELECT
  TO authenticated
  USING (
    is_premium = true AND EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND plan_type IN ('pro', 'dojo')
      AND status = 'active'
    )
  );

CREATE POLICY "Coaches can upload videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND is_coach = true
    )
  );

-- Video Chapters & Transcripts (inherit video permissions)
CREATE POLICY "View chapters if can view video"
  ON video_chapters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      WHERE v.id = video_chapters.video_id
      AND (
        v.is_premium = false OR
        EXISTS (
          SELECT 1 FROM subscriptions
          WHERE user_id = auth.uid()
          AND plan_type IN ('pro', 'dojo')
          AND status = 'active'
        )
      )
    )
  );

CREATE POLICY "View transcripts if can view video"
  ON video_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      WHERE v.id = video_transcripts.video_id
      AND (
        v.is_premium = false OR
        EXISTS (
          SELECT 1 FROM subscriptions
          WHERE user_id = auth.uid()
          AND plan_type IN ('pro', 'dojo')
          AND status = 'active'
        )
      )
    )
  );

-- User Progress Policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view student progress"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members dm1
      JOIN dojo_members dm2 ON dm1.dojo_id = dm2.dojo_id
      WHERE dm1.user_id = auth.uid() 
      AND dm1.role IN ('coach', 'admin')
      AND dm2.user_id = user_progress.user_id
    )
  );

-- Sparring Logs Policies
CREATE POLICY "Users can view their own sparring logs"
  ON sparring_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sparring logs"
  ON sparring_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sparring logs"
  ON sparring_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sparring logs"
  ON sparring_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Sparring Events (inherit sparring log permissions)
CREATE POLICY "View events if can view sparring log"
  ON sparring_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

-- Flows Policies
CREATE POLICY "Users can view their own flows"
  ON flows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public flows"
  ON flows FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create flows (with limits)"
  ON flows FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Free users: max 3 flows
      (SELECT COUNT(*) FROM flows WHERE user_id = auth.uid()) < 3
      OR
      -- Pro/Dojo users: unlimited
      EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = auth.uid()
        AND plan_type IN ('pro', 'dojo')
        AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can update their own flows"
  ON flows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flows"
  ON flows FOR DELETE
  USING (auth.uid() = user_id);

-- Flow Nodes/Edges (inherit flow permissions)
CREATE POLICY "Manage nodes if can manage flow"
  ON flow_nodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = flow_nodes.flow_id
      AND flows.user_id = auth.uid()
    )
  );

CREATE POLICY "Manage edges if can manage flow"
  ON flow_edges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM flows
      WHERE flows.id = flow_edges.flow_id
      AND flows.user_id = auth.uid()
    )
  );

-- Dojos Policies
CREATE POLICY "View dojo if member"
  ON dojos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members
      WHERE dojo_members.dojo_id = dojos.id
      AND dojo_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Dojo owner can update"
  ON dojos FOR UPDATE
  USING (owner_id = auth.uid());

-- Dojo Members Policies
CREATE POLICY "View members if in same dojo"
  ON dojo_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members dm
      WHERE dm.dojo_id = dojo_members.dojo_id
      AND dm.user_id = auth.uid()
    )
  );

CREATE POLICY "Dojo admin can manage members"
  ON dojo_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members dm
      WHERE dm.dojo_id = dojo_members.dojo_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'admin'
    )
  );

-- Curriculums Policies
CREATE POLICY "View curriculum if dojo member"
  ON curriculums FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members
      WHERE dojo_members.dojo_id = curriculums.dojo_id
      AND dojo_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage curriculums"
  ON curriculums FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dojo_members
      WHERE dojo_members.dojo_id = curriculums.dojo_id
      AND dojo_members.user_id = auth.uid()
      AND dojo_members.role IN ('coach', 'admin')
    )
  );

-- Curriculum Items (inherit curriculum permissions)
CREATE POLICY "View items if can view curriculum"
  ON curriculum_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM curriculums c
      JOIN dojo_members dm ON dm.dojo_id = c.dojo_id
      WHERE c.id = curriculum_items.curriculum_id
      AND dm.user_id = auth.uid()
    )
  );

CREATE POLICY "Manage items if can manage curriculum"
  ON curriculum_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM curriculums c
      JOIN dojo_members dm ON dm.dojo_id = c.dojo_id
      WHERE c.id = curriculum_items.curriculum_id
      AND dm.user_id = auth.uid()
      AND dm.role IN ('coach', 'admin')
    )
  );

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Review Schedule Policies
CREATE POLICY "Users can manage their own review schedule"
  ON review_schedule FOR ALL
  USING (auth.uid() = user_id);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID, required_plans TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND plan_type = ANY(required_plans)
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's dojo role
CREATE OR REPLACE FUNCTION get_user_dojo_role(user_uuid UUID, dojo_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM dojo_members
  WHERE user_id = user_uuid AND dojo_id = dojo_uuid;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;