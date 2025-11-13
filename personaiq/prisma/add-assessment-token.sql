-- Migration: Add assessmentToken and sectionScores to AssessmentResponse
-- Run this in Supabase SQL Editor

-- Add assessmentToken column
ALTER TABLE "AssessmentResponse"
ADD COLUMN IF NOT EXISTS "assessmentToken" TEXT;

-- Add sectionScores column
ALTER TABLE "AssessmentResponse"
ADD COLUMN IF NOT EXISTS "sectionScores" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create unique index on assessmentToken
CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentResponse_assessmentToken_key"
ON "AssessmentResponse"("assessmentToken");

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "AssessmentResponse_assessmentToken_idx"
ON "AssessmentResponse"("assessmentToken");

-- Verify changes
SELECT 'Migration completed successfully!' as message;
