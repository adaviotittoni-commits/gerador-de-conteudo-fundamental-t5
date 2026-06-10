-- Migration: Create api_keys table for API key management
-- Story 2.1: API Key Management UI

-- Enable pgcrypto extension for future encryption support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create api_keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'anthropic')),
    encrypted_key TEXT NOT NULL,
    key_suffix TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unchecked' CHECK (status IN ('valid', 'invalid', 'unchecked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own keys only
CREATE POLICY "Users can manage own keys"
    ON api_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to api_keys table
CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
