-- RLS Policies for Dojo Features
-- This migration adds row-level security policies for dojo-related tables

-- Enable RLS on all dojo tables
ALTER TABLE public.dojos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dojo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dojo_content_visibility ENABLE ROW LEVEL SECURITY;

-- Dojos table policies
-- Owners can do everything with their dojos
CREATE POLICY "Owners can manage their dojos" ON public.dojos
    FOR ALL USING (owner_id = auth.uid());

-- Members can view dojos they belong to
CREATE POLICY "Members can view their dojos" ON public.dojos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = dojos.id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.is_active = true
        )
    );

-- Dojo members table policies
-- Dojo owners and coaches can manage members
CREATE POLICY "Owners and coaches can manage members" ON public.dojo_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members dm
            WHERE dm.dojo_id = dojo_members.dojo_id
            AND dm.user_id = auth.uid()
            AND dm.role IN ('owner', 'coach')
            AND dm.is_active = true
        )
    );

-- Members can view other members in their dojos
CREATE POLICY "Members can view dojo members" ON public.dojo_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members dm
            WHERE dm.dojo_id = dojo_members.dojo_id
            AND dm.user_id = auth.uid()
            AND dm.is_active = true
        )
    );

-- Users can update their own membership (for accepting invitations)
CREATE POLICY "Users can update own membership" ON public.dojo_members
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Curriculums table policies
-- Owners and coaches can manage curriculums in their dojos
CREATE POLICY "Owners and coaches can manage curriculums" ON public.curriculums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = curriculums.dojo_id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.role IN ('owner', 'coach')
            AND dojo_members.is_active = true
        )
    );

-- All dojo members can view curriculums
CREATE POLICY "Members can view curriculums" ON public.curriculums
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = curriculums.dojo_id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.is_active = true
        )
    );

-- Curriculum items table policies
-- Same as curriculums - owners and coaches can manage
CREATE POLICY "Owners and coaches can manage curriculum items" ON public.curriculum_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.curriculums c
            JOIN public.dojo_members dm ON dm.dojo_id = c.dojo_id
            WHERE c.id = curriculum_items.curriculum_id
            AND dm.user_id = auth.uid()
            AND dm.role IN ('owner', 'coach')
            AND dm.is_active = true
        )
    );

-- Members can view curriculum items
CREATE POLICY "Members can view curriculum items" ON public.curriculum_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.curriculums c
            JOIN public.dojo_members dm ON dm.dojo_id = c.dojo_id
            WHERE c.id = curriculum_items.curriculum_id
            AND dm.user_id = auth.uid()
            AND dm.is_active = true
        )
    );

-- Assignments table policies
-- Owners and coaches can create and manage assignments
CREATE POLICY "Owners and coaches can manage assignments" ON public.assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = assignments.dojo_id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.role IN ('owner', 'coach')
            AND dojo_members.is_active = true
        )
    );

-- Students can view their own assignments
CREATE POLICY "Students can view own assignments" ON public.assignments
    FOR SELECT USING (assigned_to = auth.uid());

-- Assignment progress table policies
-- Students can manage their own progress
CREATE POLICY "Students can manage own progress" ON public.assignment_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE assignments.id = assignment_progress.assignment_id
            AND assignments.assigned_to = auth.uid()
        )
    );

-- Coaches can view student progress
CREATE POLICY "Coaches can view student progress" ON public.assignment_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.dojo_members dm ON dm.dojo_id = a.dojo_id
            WHERE a.id = assignment_progress.assignment_id
            AND dm.user_id = auth.uid()
            AND dm.role IN ('owner', 'coach')
            AND dm.is_active = true
        )
    );

-- Dojo content visibility policies
-- Owners and coaches can manage content visibility
CREATE POLICY "Owners and coaches can manage content visibility" ON public.dojo_content_visibility
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = dojo_content_visibility.dojo_id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.role IN ('owner', 'coach')
            AND dojo_members.is_active = true
        )
    );

-- Members can view content visibility settings
CREATE POLICY "Members can view content visibility" ON public.dojo_content_visibility
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dojo_members
            WHERE dojo_members.dojo_id = dojo_content_visibility.dojo_id
            AND dojo_members.user_id = auth.uid()
            AND dojo_members.is_active = true
        )
    );

-- Create function to check if user has dojo plan
CREATE OR REPLACE FUNCTION has_dojo_plan(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_plan BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = user_id
        AND profiles.subscription_tier = 'dojo'
        AND profiles.subscription_status = 'active'
    ) INTO has_plan;
    
    RETURN has_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to ensure only users with dojo plan can create dojos
CREATE POLICY "Only dojo plan users can create dojos" ON public.dojos
    FOR INSERT WITH CHECK (has_dojo_plan(auth.uid()));

-- Create helper function to check dojo membership
CREATE OR REPLACE FUNCTION is_dojo_member(user_id UUID, dojo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.dojo_members
        WHERE dojo_members.user_id = user_id
        AND dojo_members.dojo_id = dojo_id
        AND dojo_members.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is coach or owner
CREATE OR REPLACE FUNCTION is_dojo_coach_or_owner(user_id UUID, dojo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.dojo_members
        WHERE dojo_members.user_id = user_id
        AND dojo_members.dojo_id = dojo_id
        AND dojo_members.role IN ('owner', 'coach')
        AND dojo_members.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;