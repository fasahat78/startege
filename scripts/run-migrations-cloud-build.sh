#!/bin/bash

# Script to run Prisma migrations via Cloud Build

set -e

PROJECT_ID="startege"
REGION="us-central1"
CLOUD_SQL_CONNECTION="startege:us-central1:startege-db"

echo "🚀 Running Prisma Migrations via Cloud Build"
echo "=============================================="
echo ""

# Submit the build
echo "📦 Submitting Cloud Build job..."
gcloud builds submit \
  --config=cloudbuild-migrations.yaml \
  --project="$PROJECT_ID" \
  --substitutions=_CLOUD_SQL_CONNECTION_NAME="$CLOUD_SQL_CONNECTION",_DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege" \
  --async

echo ""
echo "✅ Build submitted!"
echo ""
echo "To check status:"
echo "  gcloud builds list --project=$PROJECT_ID --limit=1"
echo ""
echo "To stream logs:"
echo "  gcloud builds log --project=$PROJECT_ID \$(gcloud builds list --project=$PROJECT_ID --limit=1 --format='value(id)')"

