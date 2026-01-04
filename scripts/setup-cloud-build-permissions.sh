#!/bin/bash
# Setup Cloud Build service account permissions for automated migrations

set -e

PROJECT_ID="startege"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "Setting up Cloud Build permissions for project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""

# Cloud SQL Client - Required to connect to Cloud SQL via proxy
echo "Granting Cloud SQL Client role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client" \
  --condition=None

# Cloud Run Admin - Required to deploy to Cloud Run
echo "Granting Cloud Run Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin" \
  --condition=None

# Service Account User - Required to use Cloud SQL Proxy
echo "Granting Service Account User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

echo ""
echo "✅ Permissions granted successfully!"
echo ""
echo "Next steps:"
echo "1. Update Cloud Build trigger substitution variables (see docs/PRODUCTION_DEPLOYMENT_GUIDE.md)"
echo "2. Add _DATABASE_URL to trigger: postgresql://postgres:PASSWORD@127.0.0.1:5432/startege"
echo "3. Test the build by pushing to main branch"

