# Fix Gemini Issues - Console Commands Only

All commands to diagnose and fix Gemini issues using gcloud CLI.

## 1. Check Current Configuration

```bash
# Check Cloud Run environment variables
gcloud run services describe startege --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)" \
  --project=startege

# Check which service account Cloud Run uses
gcloud run services describe startege --region=us-central1 \
  --format="value(spec.template.spec.serviceAccountName)" \
  --project=startege

# Check if Vertex AI API is enabled
gcloud services list --enabled --filter="name:aiplatform.googleapis.com" \
  --project=startege
```

## 2. Fix Service Account Permissions

```bash
# Get Cloud Run service account
SERVICE_ACCOUNT=$(gcloud run services describe startege \
  --region=us-central1 \
  --format="value(spec.template.spec.serviceAccountName)" \
  --project=startege)

# If empty, use default compute service account
if [ -z "$SERVICE_ACCOUNT" ]; then
  PROJECT_NUMBER=$(gcloud projects describe startege --format="value(projectNumber)")
  SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi

echo "Service Account: $SERVICE_ACCOUNT"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user" \
  --condition=None

# Verify permissions
gcloud projects get-iam-policy startege \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT}" \
  --format="table(bindings.role)"
```

## 3. Fix Project ID (Use Project Name Instead of Number)

```bash
# Update GCP_PROJECT_ID to use project name
gcloud run services update startege \
  --region=us-central1 \
  --update-env-vars="GCP_PROJECT_ID=startege" \
  --project=startege

# Verify the change
gcloud run services describe startege --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)" \
  --project=startege | grep GCP_PROJECT_ID
```

## 4. Check Logs for Errors

```bash
# View recent Gemini errors
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'[GEMINI_ERROR]'" \
  --limit 20 \
  --format="table(timestamp,textPayload)" \
  --project=startege

# View all Startegizer chat logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'[STARTEGIZER_CHAT]'" \
  --limit 50 \
  --format="table(timestamp,textPayload)" \
  --project=startege

# View AI provider configuration logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'AI Providers configured'" \
  --limit 10 \
  --format="table(timestamp,textPayload)" \
  --project=startege
```

## 5. Test Vertex AI Access

```bash
# Test if service account can access Vertex AI
gcloud ai models list \
  --region=us-central1 \
  --project=startege \
  --limit=5

# If this fails, there's a permission issue
```

## 6. Set Model (Optional - Try Different Model)

```bash
# Set to stable model
gcloud run services update startege \
  --region=us-central1 \
  --update-env-vars="GEMINI_MODEL=gemini-1.5-flash" \
  --project=startege
```

## 7. Verify OpenAI Fallback is Working

```bash
# Check if OpenAI secret is accessible
gcloud secrets versions access latest --secret="OPENAI_API_KEY" \
  --project=startege

# Check Cloud Run has access to OpenAI secret
gcloud run services describe startege --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)" \
  --project=startege | grep OPENAI
```

## 8. Complete Diagnostic Script

Run this to check everything at once:

```bash
#!/bin/bash
PROJECT_ID="startege"
REGION="us-central1"
SERVICE_NAME="startege"

echo "=== Gemini Configuration Check ==="
echo ""

echo "1. Cloud Run Environment Variables:"
gcloud run services describe $SERVICE_NAME --region=$REGION \
  --format="value(spec.template.spec.containers[0].env)" \
  --project=$PROJECT_ID | grep -E "GCP_PROJECT_ID|GCP_LOCATION|GEMINI_MODEL|OPENAI_API_KEY"

echo ""
echo "2. Service Account:"
SERVICE_ACCOUNT=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="value(spec.template.spec.serviceAccountName)" \
  --project=$PROJECT_ID)
echo "  $SERVICE_ACCOUNT"

echo ""
echo "3. Vertex AI API Enabled:"
gcloud services list --enabled --filter="name:aiplatform.googleapis.com" \
  --project=$PROJECT_ID --format="value(name)"

echo ""
echo "4. Service Account Permissions:"
if [ -n "$SERVICE_ACCOUNT" ]; then
  gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT}" \
    --format="table(bindings.role)" | grep -i "aiplatform\|vertex"
else
  echo "  Using default compute service account"
fi

echo ""
echo "5. Recent Gemini Errors:"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND textPayload=~'[GEMINI_ERROR]'" \
  --limit 5 \
  --format="value(textPayload)" \
  --project=$PROJECT_ID

echo ""
echo "6. Test Vertex AI Access:"
gcloud ai models list --region=$REGION --project=$PROJECT_ID --limit=1 2>&1 | head -5
```

Save as `check-gemini.sh`, make executable (`chmod +x check-gemini.sh`), and run it.

## 9. Quick Fix Commands (Run All)

```bash
# Set project name instead of number
gcloud run services update startege \
  --region=us-central1 \
  --update-env-vars="GCP_PROJECT_ID=startege" \
  --project=startege

# Get and grant permissions
PROJECT_NUMBER=$(gcloud projects describe startege --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user" \
  --project=startege

# Verify
gcloud ai models list --region=us-central1 --project=startege --limit=1
```

## 10. Monitor After Fix

```bash
# Watch logs in real-time
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=startege" \
  --format="value(timestamp,textPayload)" \
  --project=startege

# Filter for Gemini/OpenAI logs only
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND (textPayload=~'[GEMINI]' OR textPayload=~'[OPENAI]' OR textPayload=~'[STARTEGIZER_CHAT]')" \
  --format="value(timestamp,textPayload)" \
  --project=startege
```
