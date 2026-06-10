-- Migration: Create images storage bucket with user-scoped access policies
-- Story 3.4: Image Generation — Storage for generated images
--
-- This migration documents the SQL for creating the `images` bucket.
-- Supabase Storage buckets are typically created via the Dashboard or CLI,
-- but the policies below enforce user-level access control.
--
-- Bucket: images (private)
-- Path convention: {user_id}/{project_id}/{uuid}.png
-- Max file size: 10MB (enforced via policy)

-- Create the storage bucket (private — no public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('images', 'images', false, 10485760) -- 10MB limit
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload images to their own folder
CREATE POLICY "Users can upload own images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view/download their own images
CREATE POLICY "Users can view own images"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
