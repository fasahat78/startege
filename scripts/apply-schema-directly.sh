#!/bin/bash

# Alternative: Apply schema by running SQL directly
# This bypasses Prisma and runs the migration SQL files directly

set -e

PROJECT_ID="startege"
REGION="us-central1"
CLOUD_SQL_CONNECTION="startege:us-central1:startege-db"
DB_USER="postgres"
DB_PASS="Zoya@57Bruce"
DB_NAME="startege"

echo "🚀 Applying schema directly via SQL"
echo "====================================="

# This would require Cloud SQL Proxy to be running locally
# Or you can run this in Cloud Build with proper setup

echo "Note: This script requires Cloud SQL Proxy running locally"
echo "Start proxy: cloud-sql-proxy --port=5432 $CLOUD_SQL_CONNECTION"
echo ""
echo "Then run:"
echo "  PGPASSWORD='$DB_PASS' psql -h 127.0.0.1 -p 5432 -U $DB_USER -d $DB_NAME -f prisma/migrations/0_baseline/migration.sql"

