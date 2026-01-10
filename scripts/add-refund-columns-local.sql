-- Add refund columns to Payment table (for local development)
-- Run this script on your local database

ALTER TABLE "Payment" 
ADD COLUMN IF NOT EXISTS "refundedAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "refundReason" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set updatedAt
UPDATE "Payment" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Payment'
AND column_name IN ('refundedAmount', 'refundedAt', 'refundReason', 'updatedAt');

