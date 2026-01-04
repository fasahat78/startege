-- Quick test: Check if key tables exist
-- Run this in Cloud SQL console Query Editor

SELECT 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

