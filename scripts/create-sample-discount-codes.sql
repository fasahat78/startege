-- Create sample discount codes for testing
-- Run this in Cloud SQL Studio after admin features are set up

-- Founding Member Code (50% off forever)
INSERT INTO "DiscountCode" (
    "id", "code", "description", "type", "value", "status", 
    "maxUses", "maxUsesPerUser", "applicableToPlanTypes", 
    "earlyAdopterTier", "createdAt", "updatedAt"
) VALUES (
    'sample_founding_1',
    'FOUNDING100',
    'Founding Member - 50% off forever',
    'PERCENTAGE',
    50,
    'ACTIVE',
    100,
    1,
    ARRAY['both'],
    'FOUNDING_MEMBER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("code") DO NOTHING;

-- Early Adopter Code (40% off first year)
INSERT INTO "DiscountCode" (
    "id", "code", "description", "type", "value", "status", 
    "maxUses", "maxUsesPerUser", "applicableToPlanTypes", 
    "earlyAdopterTier", "createdAt", "updatedAt"
) VALUES (
    'sample_early_1',
    'EARLYBIRD40',
    'Early Bird - 40% off first year',
    'PERCENTAGE',
    40,
    'ACTIVE',
    400,
    1,
    ARRAY['both'],
    'EARLY_ADOPTER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("code") DO NOTHING;

-- Launch Code (20% off first year)
INSERT INTO "DiscountCode" (
    "id", "code", "description", "type", "value", "status", 
    "maxUses", "maxUsesPerUser", "applicableToPlanTypes", 
    "earlyAdopterTier", "validUntil", "createdAt", "updatedAt"
) VALUES (
    'sample_launch_1',
    'LAUNCH20',
    'Launch Special - 20% off first year',
    'PERCENTAGE',
    20,
    'ACTIVE',
    NULL, -- Unlimited uses
    1,
    ARRAY['both'],
    'LAUNCH_USER',
    CURRENT_TIMESTAMP + INTERVAL '3 months', -- Expires in 3 months
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("code") DO NOTHING;

-- Verify codes were created
SELECT "code", "description", "type", "value", "status", "maxUses", "earlyAdopterTier"
FROM "DiscountCode"
ORDER BY "createdAt";

