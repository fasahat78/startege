-- Extract Current Database Schema
-- Run this in Cloud SQL Studio to see what already exists

-- Get all tables
SELECT 
    'TABLE' as object_type,
    tablename as object_name,
    'public' as schema_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Get all enums
SELECT 
    'ENUM' as object_type,
    typname as object_name,
    'public' as schema_name
FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;

-- Get all indexes
SELECT 
    'INDEX' as object_type,
    indexname as object_name,
    schemaname as schema_name,
    tablename as table_name
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Get all constraints
SELECT 
    'CONSTRAINT' as object_type,
    conname as object_name,
    conrelid::regclass::text as table_name,
    contype as constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- Get all foreign keys
SELECT 
    'FOREIGN_KEY' as object_type,
    conname as constraint_name,
    conrelid::regclass::text as table_name,
    confrelid::regclass::text as referenced_table
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND contype = 'f'
ORDER BY conrelid::regclass::text, conname;

