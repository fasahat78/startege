-- Fix emailVerified column: Convert from TIMESTAMP to BOOLEAN
-- Run this in Cloud SQL Studio

-- Step 1: Add new boolean column
ALTER TABLE "public"."User" 
ADD COLUMN "emailVerified_boolean" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate data: if emailVerified timestamp exists, set to true
UPDATE "public"."User" 
SET "emailVerified_boolean" = CASE 
    WHEN "emailVerified" IS NOT NULL THEN true 
    ELSE false 
END;

-- Step 3: Drop the old timestamp column
ALTER TABLE "public"."User" 
DROP COLUMN "emailVerified";

-- Step 4: Rename the new column to emailVerified
ALTER TABLE "public"."User" 
RENAME COLUMN "emailVerified_boolean" TO "emailVerified";

-- Step 5: Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'User'
AND column_name = 'emailVerified';

