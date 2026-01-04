#!/bin/bash

# Script to create and run a Cloud Run job for Prisma migrations

set -e

PROJECT_ID="startege"
JOB_NAME="startege-migrations"
REGION="us-central1"
CONNECTION_NAME="startege:us-central1:startege-db"

echo "🚀 Creating Cloud Run Job for Prisma Migrations"
echo "================================================"

# Check if job already exists
if gcloud run jobs describe "$JOB_NAME" --project="$PROJECT_ID" --region="$REGION" &>/dev/null; then
    echo "✅ Job already exists: $JOB_NAME"
    echo ""
    echo "To run the job:"
    echo "  gcloud run jobs execute $JOB_NAME --project=$PROJECT_ID --region=$REGION --wait"
    exit 0
fi

echo "📦 Creating Cloud Run job..."
echo ""

# Create the job
gcloud run jobs create "$JOB_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --image="node:20-alpine" \
  --command="sh" \
  --args="-c,npm install -g prisma && prisma migrate deploy" \
  --set-env-vars="DATABASE_URL=postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/$CONNECTION_NAME" \
  --set-cloudsql-instances="$CONNECTION_NAME" \
  --memory="2Gi" \
  --cpu="2" \
  --max-retries="1" \
  --task-timeout="600"

echo ""
echo "✅ Job created successfully!"
echo ""
echo "🔄 Executing job..."
gcloud run jobs execute "$JOB_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --wait

echo ""
echo "✅ Migrations completed!"
echo ""
echo "To check logs:"
echo "  gcloud logging read \"resource.type=cloud_run_job AND resource.labels.job_name=$JOB_NAME\" --project=$PROJECT_ID --limit=50"

