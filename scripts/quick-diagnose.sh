#!/bin/bash

# Quick Cloud Run Diagnostic Script
# Run this after authenticating: gcloud auth login

PROJECT_ID="startege"
SERVICE_NAME="startege"
REGION="us-central1"
CLOUD_SQL_INSTANCE="startege-db"
SECRET_NAME="DATABASE_URL"

echo "🚀 Cloud Run & Database Connection Diagnostic"
echo "============================================================"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "============================================================"
echo ""

# Check authentication
echo "🔍 Checking gcloud authentication..."
if gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
    echo "✅ Authenticated as: $ACCOUNT"
elif gcloud auth application-default print-access-token &>/dev/null; then
    echo "✅ Using Application Default Credentials"
else
    echo "❌ Not authenticated. Please run: gcloud auth login"
    echo "   Or: gcloud auth application-default login"
    exit 1
fi
echo ""

# Check Cloud Run service
echo "🔍 Checking Cloud Run Service..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(status.url)" 2>/dev/null)
if [ -z "$SERVICE_URL" ]; then
    echo "❌ Service not found or inaccessible"
else
    echo "✅ Service URL: $SERVICE_URL"
fi
echo ""

# Check Cloud SQL connection
echo "🔍 Checking Cloud SQL Connection..."
CLOUD_SQL_CONN=$(gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format="value(spec.template.metadata.annotations.'run.googleapis.com/cloudsql-instances')" 2>/dev/null)
if [ -z "$CLOUD_SQL_CONN" ]; then
    echo "❌ Cloud SQL connection NOT configured"
    echo "   Fix: gcloud run services update $SERVICE_NAME --add-cloudsql-instances=$PROJECT_ID:$REGION:$CLOUD_SQL_INSTANCE --region=$REGION"
else
    echo "✅ Cloud SQL connection: $CLOUD_SQL_CONN"
    if echo "$CLOUD_SQL_CONN" | grep -q "$CLOUD_SQL_INSTANCE"; then
        echo "✅ Correct instance configured"
    else
        echo "⚠️  Instance mismatch. Expected: $PROJECT_ID:$REGION:$CLOUD_SQL_INSTANCE"
    fi
fi
echo ""

# Check DATABASE_URL secret
echo "🔍 Checking DATABASE_URL Secret..."
if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &>/dev/null; then
    echo "✅ Secret exists"
    # Check if referenced in Cloud Run
    if gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region=$REGION --format=json 2>/dev/null | grep -q "\"name\": \"DATABASE_URL\""; then
        echo "✅ DATABASE_URL referenced in Cloud Run"
    else
        echo "❌ DATABASE_URL NOT referenced in Cloud Run"
    fi
else
    echo "❌ Secret does not exist"
fi
echo ""

# Check Cloud SQL instance
echo "🔍 Checking Cloud SQL Instance..."
INSTANCE_STATE=$(gcloud sql instances describe $CLOUD_SQL_INSTANCE --project=$PROJECT_ID --format="value(state)" 2>/dev/null)
CONNECTION_NAME=$(gcloud sql instances describe $CLOUD_SQL_INSTANCE --project=$PROJECT_ID --format="value(connectionName)" 2>/dev/null)
if [ -z "$INSTANCE_STATE" ]; then
    echo "❌ Instance not found or inaccessible"
else
    if [ "$INSTANCE_STATE" = "RUNNABLE" ]; then
        echo "✅ Instance is running"
        echo "✅ Connection name: $CONNECTION_NAME"
    else
        echo "❌ Instance state: $INSTANCE_STATE (expected: RUNNABLE)"
    fi
fi
echo ""

# Check health endpoint
if [ ! -z "$SERVICE_URL" ]; then
    echo "🔍 Checking Health Endpoint..."
    HEALTH_RESPONSE=$(curl -s "${SERVICE_URL}/api/health" 2>/dev/null)
    if [ ! -z "$HEALTH_RESPONSE" ]; then
        DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | head -1)
        if echo "$HEALTH_RESPONSE" | grep -q '"database".*"status":"healthy"'; then
            echo "✅ Database connection is healthy"
        else
            echo "❌ Database connection is unhealthy"
            echo "   Response: $HEALTH_RESPONSE"
        fi
    else
        echo "⚠️  Could not reach health endpoint"
    fi
fi
echo ""

echo "============================================================"
echo "✅ Diagnostic complete!"
echo ""
echo "If Cloud SQL connection is missing, run:"
echo "  gcloud run services update $SERVICE_NAME --add-cloudsql-instances=$PROJECT_ID:$REGION:$CLOUD_SQL_INSTANCE --region=$REGION"

