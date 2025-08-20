-- Dojo Features Migration
-- This migration adds tables for coach/dojo functionality

-- Create dojos table
CREATE TABLE IF NOT EXISTS public.dojos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_dojo_name_per_owner UNIQUE (owner_id, name)
);

-- Create dojo_members table
CREATE TABLE IF NOT EXISTS public.dojo_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dojo_id UUID NOT NULL REFERENCES public.dojos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'coach', 'student')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    invitation_token VARCHAR(255),
    invitation_accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_dojo_member UNIQUE (dojo_id, user_id)
);

-- Create curriculums table
CREATE TABLE IF NOT EXISTS public.curriculums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dojo_id UUID NOT NULL REFERENCES public.dojos(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    belt_level VARCHAR(50) CHECK (belt_level IN ('white', 'blue', 'purple', 'brown', 'black', 'all')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curriculum_items table
CREATE TABLE IF NOT EXISTS public.curriculum_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('video', 'flow', 'drill', 'assessment')),
    item_id UUID, -- References videos.id or flows.id depending on item_type
    title VARCHAR(255),
    description TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_curriculum_item_order UNIQUE (curriculum_id, order_index)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dojo_id UUID NOT NULL REFERENCES public.dojos(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES public.curriculums(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_progress table for tracking individual item completion
CREATE TABLE IF NOT EXISTS public.assignment_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    curriculum_item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_assignment_item_progress UNIQUE (assignment_id, curriculum_item_id)
);

-- Create dojo_content_visibility table for private content
CREATE TABLE IF NOT EXISTS public.dojo_content_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dojo_id UUID NOT NULL REFERENCES public.dojos(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'flow')),
    content_id UUID NOT NULL,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_dojo_content UNIQUE (dojo_id, content_type, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_dojo_members_dojo_id ON public.dojo_members(dojo_id);
CREATE INDEX idx_dojo_members_user_id ON public.dojo_members(user_id);
CREATE INDEX idx_curriculums_dojo_id ON public.curriculums(dojo_id);
CREATE INDEX idx_curriculum_items_curriculum_id ON public.curriculum_items(curriculum_id);
CREATE INDEX idx_assignments_dojo_id ON public.assignments(dojo_id);
CREATE INDEX idx_assignments_assigned_to ON public.assignments(assigned_to);
CREATE INDEX idx_assignment_progress_assignment_id ON public.assignment_progress(assignment_id);
CREATE INDEX idx_dojo_content_visibility_dojo_id ON public.dojo_content_visibility(dojo_id);
CREATE INDEX idx_dojo_content_visibility_content ON public.dojo_content_visibility(content_type, content_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dojos_updated_at BEFORE UPDATE ON public.dojos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON public.curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically add owner as member when dojo is created
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.dojo_members (dojo_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_dojo_owner_as_member
    AFTER INSERT ON public.dojos
    FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();

-- Create function to update assignment status based on progress
CREATE OR REPLACE FUNCTION update_assignment_status()
RETURNS TRIGGER AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
BEGIN
    -- Count total required items in the curriculum
    SELECT COUNT(*)
    INTO total_items
    FROM public.curriculum_items ci
    JOIN public.assignments a ON a.curriculum_id = ci.curriculum_id
    WHERE a.id = NEW.assignment_id AND ci.is_required = true;

    -- Count completed items
    SELECT COUNT(*)
    INTO completed_items
    FROM public.assignment_progress ap
    JOIN public.curriculum_items ci ON ci.id = ap.curriculum_item_id
    WHERE ap.assignment_id = NEW.assignment_id 
    AND ap.completed_at IS NOT NULL
    AND ci.is_required = true;

    -- Update assignment status
    IF completed_items = total_items AND total_items > 0 THEN
        UPDATE public.assignments
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = NEW.assignment_id;
    ELSIF completed_items > 0 THEN
        UPDATE public.assignments
        SET status = 'in_progress'
        WHERE id = NEW.assignment_id AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assignment_on_progress
    AFTER INSERT OR UPDATE ON public.assignment_progress
    FOR EACH ROW EXECUTE FUNCTION update_assignment_status();

-- Add comments for documentation
COMMENT ON TABLE public.dojos IS 'Stores dojo (school) information for coaches';
COMMENT ON TABLE public.dojo_members IS 'Manages membership and roles within dojos';
COMMENT ON TABLE public.curriculums IS 'Stores training curriculums created by coaches';
COMMENT ON TABLE public.curriculum_items IS 'Individual items within a curriculum';
COMMENT ON TABLE public.assignments IS 'Tracks curriculum assignments to students';
COMMENT ON TABLE public.assignment_progress IS 'Tracks student progress on individual curriculum items';
COMMENT ON TABLE public.dojo_content_visibility IS 'Controls private content visibility within dojos';