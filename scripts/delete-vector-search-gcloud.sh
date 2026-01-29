#!/bin/bash
# Script to delete Vector Search resources using gcloud CLI
# 
# Usage:
#   chmod +x scripts/delete-vector-search-gcloud.sh
#   ./scripts/delete-vector-search-gcloud.sh

set -e

# Configuration
PROJECT_ID="startege"
PROJECT_NUMBER="785373873454"
LOCATION="us-central1"
INDEX_ID="3161010167949033472"
ENDPOINT_ID="3780782882293809152"
DEPLOYMENT_ID="startege_vector_search_end_1767344026840"
GCS_BUCKET="startege-vector-search"

echo "🗑️  Vector Search Resource Cleanup Script (gcloud CLI)"
echo "======================================================"
echo ""
echo "This script will delete the following Vector Search resources:"
echo "  - Index ID: ${INDEX_ID}"
echo "  - Endpoint ID: ${ENDPOINT_ID}"
echo "  - Deployment ID: ${DEPLOYMENT_ID}"
echo "  - GCS Bucket: ${GCS_BUCKET}"
echo ""
echo "Project: ${PROJECT_ID} (${PROJECT_NUMBER})"
echo "Location: ${LOCATION}"
echo ""

read -p "⚠️  This will DELETE Vector Search resources. Continue? (yes/no): " answer

if [ "$answer" != "yes" ]; then
    echo "❌ Cancelled. No resources deleted."
    exit 0
fi

# Set project
echo ""
echo "📋 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Step 1: Undeploy index
echo ""
echo "📤 Step 1: Undeploying index from endpoint..."
if gcloud ai index-endpoints undeploy-index ${ENDPOINT_ID} \
    --deployed-index-id=${DEPLOYMENT_ID} \
    --region=${LOCATION} 2>/dev/null; then
    echo "✅ Undeploy operation started"
    echo "   ⏳ Waiting for operation to complete..."
    # Wait a bit for the operation to start
    sleep 5
else
    echo "   ⚠️  Index may already be undeployed or not found"
fi

# Step 2: Delete endpoint
echo ""
echo "🗑️  Step 2: Deleting index endpoint..."
if gcloud ai index-endpoints delete ${ENDPOINT_ID} \
    --region=${LOCATION} 2>/dev/null; then
    echo "✅ Index endpoint deletion started"
    echo "   ⏳ This may take a few minutes..."
else
    echo "   ⚠️  Endpoint may already be deleted or not found"
fi

# Step 3: Delete index
echo ""
echo "🗑️  Step 3: Deleting Vector Search index..."
if gcloud ai indexes delete ${INDEX_ID} \
    --region=${LOCATION} 2>/dev/null; then
    echo "✅ Index deletion started"
    echo "   ⏳ This may take a few minutes..."
else
    echo "   ⚠️  Index may already be deleted or not found"
fi

# Step 4: Delete GCS bucket
echo ""
echo "🗑️  Step 4: Deleting Cloud Storage bucket..."
if gsutil ls gs://${GCS_BUCKET} 2>/dev/null; then
    read -p "   Delete bucket gs://${GCS_BUCKET}? (yes/no): " delete_bucket
    if [ "$delete_bucket" = "yes" ]; then
        gsutil rm -r gs://${GCS_BUCKET}
        echo "✅ Bucket deleted"
    else
        echo "   ⚠️  Bucket deletion skipped"
    fi
else
    echo "   ⚠️  Bucket does not exist or already deleted"
fi

echo ""
echo "✅ Cleanup operations started!"
echo ""
echo "📋 Next Steps:"
echo "1. Monitor operations in GCP Console:"
echo "   https://console.cloud.google.com/vertex-ai/vector-search/indexes?project=${PROJECT_ID}"
echo "2. Verify all resources are deleted"
echo ""
echo "💡 Note: Deletion operations may take several minutes to complete."
