-- Add admin columns to User table
-- Run this in Cloud SQL Studio or via superuser connection

-- Add isAdmin column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'User' 
    AND column_name = 'isAdmin'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'User' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE "User" ADD COLUMN role TEXT DEFAULT 'USER';
  END IF;
END $$;

-- Make fasahat@gmail.com an admin
UPDATE "User" 
SET "isAdmin" = true, role = 'ADMIN'
WHERE email = 'fasahat@gmail.com';

-- Verify the update
SELECT email, name, "isAdmin", role 
FROM "User" 
WHERE email = 'fasahat@gmail.com';

