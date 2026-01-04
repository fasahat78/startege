-- Fix User table: Add missing columns that exist in schema but not in migration
-- Run this in Cloud SQL Studio

-- Add firebaseUid column (nullable, unique)
ALTER TABLE "public"."User" 
ADD COLUMN IF NOT EXISTS "firebaseUid" TEXT;

-- Create unique index for firebaseUid (only on non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" 
ON "public"."User"("firebaseUid") 
WHERE "firebaseUid" IS NOT NULL;

-- Add emailVerifiedAt column (nullable)
ALTER TABLE "public"."User" 
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

-- Update emailVerified to Boolean type if it's currently TIMESTAMP
-- First check if we need to convert
DO $$
BEGIN
    -- Check if emailVerified exists and is TIMESTAMP type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'emailVerified'
        AND data_type = 'timestamp without time zone'
    ) THEN
        -- Add new boolean column
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "emailVerified_new" BOOLEAN DEFAULT false;
        
        -- Migrate data: if emailVerified timestamp exists, set to true
        UPDATE "public"."User" 
        SET "emailVerified_new" = CASE WHEN "emailVerified" IS NOT NULL THEN true ELSE false END;
        
        -- Drop old column
        ALTER TABLE "public"."User" DROP COLUMN IF EXISTS "emailVerified";
        
        -- Rename new column
        ALTER TABLE "public"."User" RENAME COLUMN "emailVerified_new" TO "emailVerified";
        
        -- Set default
        ALTER TABLE "public"."User" ALTER COLUMN "emailVerified" SET DEFAULT false;
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'emailVerified'
    ) THEN
        -- Column doesn't exist, create it as boolean
        ALTER TABLE "public"."User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'User' 
AND column_name IN ('firebaseUid', 'emailVerified', 'emailVerifiedAt')
ORDER BY column_name;

