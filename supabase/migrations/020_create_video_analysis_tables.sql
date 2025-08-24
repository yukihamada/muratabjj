-- Create video analysis tables for AI-powered video analysis system
-- Run this migration to enable AI video analysis features

-- Create video_analyses table
CREATE TABLE IF NOT EXISTS video_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    
    -- Analysis status
    analysis_status TEXT NOT NULL DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Detected techniques and positions
    detected_techniques TEXT[] DEFAULT '{}',
    detected_positions TEXT[] DEFAULT '{}',
    detected_submissions TEXT[] DEFAULT '{}',
    
    -- Difficulty assessment
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    recommended_belt TEXT CHECK (recommended_belt IN ('white', 'blue', 'purple', 'brown', 'black')),
    
    -- AI-generated content
    ai_summary TEXT,
    key_points TEXT[] DEFAULT '{}',
    learning_tips TEXT[] DEFAULT '{}',
    
    -- Technical details
    frames_analyzed INTEGER DEFAULT 0,
    analysis_duration INTEGER, -- in seconds
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Metadata
    analyzed_by_model TEXT DEFAULT 'gpt-4-vision-preview',
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one analysis per video (can be updated)
    UNIQUE(video_id)
);

-- Create technique_timestamps table for detailed frame analysis
CREATE TABLE IF NOT EXISTS technique_timestamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_analysis_id UUID NOT NULL REFERENCES video_analyses(id) ON DELETE CASCADE,
    
    -- Timestamp data
    timestamp_seconds DECIMAL(10,3) NOT NULL, -- precise to milliseconds
    technique_name TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    description TEXT,
    
    -- Position in video
    frame_number INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_feedback table for user feedback on AI analysis accuracy
CREATE TABLE IF NOT EXISTS analysis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_analysis_id UUID NOT NULL REFERENCES video_analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Feedback data
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    helpful_rating INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    
    -- Specific corrections
    corrected_techniques TEXT[],
    corrected_positions TEXT[],
    corrected_difficulty TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One feedback per user per analysis
    UNIQUE(video_analysis_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_analyses_video_id ON video_analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_status ON video_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_video_analyses_difficulty ON video_analyses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_video_analyses_belt ON video_analyses(recommended_belt);

CREATE INDEX IF NOT EXISTS idx_technique_timestamps_video_analysis ON technique_timestamps(video_analysis_id);
CREATE INDEX IF NOT EXISTS idx_technique_timestamps_timestamp ON technique_timestamps(timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_technique_timestamps_technique ON technique_timestamps(technique_name);

CREATE INDEX IF NOT EXISTS idx_analysis_feedback_video_analysis ON analysis_feedback(video_analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_user ON analysis_feedback(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_analyses_updated_at
    BEFORE UPDATE ON video_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_video_analyses_updated_at();

-- Enable Row Level Security
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_timestamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_analyses
CREATE POLICY "Users can view video analyses for videos they have access to"
    ON video_analyses FOR SELECT
    USING (
        -- Users can see analyses for public videos or videos they uploaded
        video_id IN (
            SELECT id FROM videos 
            WHERE is_published = true 
            OR instructor_id = auth.uid()
        )
        -- Pro/Master users can see all analyses
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND subscription_plan IN ('pro', 'master', 'dojo_basic', 'dojo_pro', 'dojo_enterprise')
            AND subscription_status = 'active'
        )
    );

-- Instructors and admins can insert/update analyses
CREATE POLICY "Instructors can manage video analyses"
    ON video_analyses FOR ALL
    USING (
        video_id IN (
            SELECT id FROM videos WHERE instructor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for technique_timestamps
CREATE POLICY "Users can view technique timestamps for accessible analyses"
    ON technique_timestamps FOR SELECT
    USING (
        video_analysis_id IN (
            SELECT id FROM video_analyses va
            JOIN videos v ON va.video_id = v.id
            WHERE v.is_published = true 
            OR v.instructor_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() 
                AND subscription_plan IN ('pro', 'master', 'dojo_basic', 'dojo_pro', 'dojo_enterprise')
                AND subscription_status = 'active'
            )
        )
    );

CREATE POLICY "Instructors can manage technique timestamps"
    ON technique_timestamps FOR ALL
    USING (
        video_analysis_id IN (
            SELECT va.id FROM video_analyses va
            JOIN videos v ON va.video_id = v.id
            WHERE v.instructor_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND is_admin = true
            )
        )
    );

-- RLS Policies for analysis_feedback
CREATE POLICY "Users can manage their own feedback"
    ON analysis_feedback FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Instructors can view feedback on their videos"
    ON analysis_feedback FOR SELECT
    USING (
        video_analysis_id IN (
            SELECT va.id FROM video_analyses va
            JOIN videos v ON va.video_id = v.id
            WHERE v.instructor_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() AND is_admin = true
            )
        )
    );

-- Create function to get analysis statistics
CREATE OR REPLACE FUNCTION get_analysis_stats()
RETURNS TABLE (
    total_analyses BIGINT,
    completed_analyses BIGINT,
    pending_analyses BIGINT,
    average_confidence DECIMAL,
    most_common_techniques TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analyses,
        COUNT(*) FILTER (WHERE analysis_status = 'completed') as completed_analyses,
        COUNT(*) FILTER (WHERE analysis_status = 'pending') as pending_analyses,
        AVG(confidence_score) as average_confidence,
        ARRAY_AGG(DISTINCT technique ORDER BY technique) FILTER (WHERE technique IS NOT NULL) as most_common_techniques
    FROM video_analyses va
    CROSS JOIN UNNEST(va.detected_techniques) AS technique;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_analysis_stats() TO authenticated;

COMMENT ON TABLE video_analyses IS 'AI-powered analysis results for BJJ technique videos';
COMMENT ON TABLE technique_timestamps IS 'Timestamped technique detection within videos';
COMMENT ON TABLE analysis_feedback IS 'User feedback on AI analysis accuracy for continuous improvement';