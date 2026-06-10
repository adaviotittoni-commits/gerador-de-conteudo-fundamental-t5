-- Migration: Create content_projects table for content project management
-- Story 3.1: Project Creation & Model Selection

-- Create content_projects table
CREATE TABLE content_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
    model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own projects only
CREATE POLICY "Users can manage own projects"
    ON content_projects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reuse the set_updated_at() function created in 002_api_keys.sql
-- Attach trigger to content_projects table
CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON content_projects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
