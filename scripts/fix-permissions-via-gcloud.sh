#!/bin/bash

# Script to fix Cloud SQL permissions via gcloud CLI
# This connects as cloudsqlsuperuser and fixes all permissions

PROJECT_ID="startege"
INSTANCE_NAME="startege-db"
DATABASE="startege"

echo "🔧 Fixing Cloud SQL Permissions"
echo "================================"
echo ""
echo "This will connect to Cloud SQL as cloudsqlsuperuser"
echo "and fix all table ownership and permissions."
echo ""
echo "You'll be prompted for the Cloud SQL root password."
echo ""

# Create SQL script
cat > /tmp/fix_perms.sql << 'EOF'
-- Change ownership of all tables to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
        RAISE NOTICE 'Changed ownership of table: %', r.tablename;
    END LOOP;
END $$;

-- Grant all privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- Verify
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
EOF

echo "Connecting to Cloud SQL..."
gcloud sql connect $INSTANCE_NAME \
  --user=cloudsqlsuperuser \
  --database=$DATABASE \
  --project=$PROJECT_ID \
  --quiet << EOF
\i /tmp/fix_perms.sql
\q
EOF

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "If the above didn't work, try running the SQL manually:"
echo "  gcloud sql connect $INSTANCE_NAME --user=cloudsqlsuperuser --database=$DATABASE"
echo ""
echo "Then copy/paste the SQL from /tmp/fix_perms.sql"

