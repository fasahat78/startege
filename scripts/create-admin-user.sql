-- Create Admin User
-- Run this in Cloud SQL Studio to make yourself an admin

UPDATE "User" 
SET "isAdmin" = true, "role" = 'ADMIN' 
WHERE email = 'fasahat@gmail.com';

-- Verify it worked
SELECT id, email, "isAdmin", "role" 
FROM "User" 
WHERE email = 'fasahat@gmail.com';

