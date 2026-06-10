-- Migration: Create outputs table for generated content storage
-- Story 3.3: Text Generation — Copy, Narrative, Hooks, CTA

-- Create outputs table
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('copy', 'narrative', 'hooks', 'cta', 'image')),
    content TEXT,
    file_url TEXT,
    provider_used TEXT NOT NULL,
    model_used TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_outputs_project ON outputs(project_id);
CREATE INDEX idx_outputs_user_type ON outputs(user_id, type);
CREATE INDEX idx_outputs_created ON outputs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own outputs
CREATE POLICY "Users can view own outputs"
    ON outputs
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own outputs
CREATE POLICY "Users can insert own outputs"
    ON outputs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
