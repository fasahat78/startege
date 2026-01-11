# Vertex AI Vector Search Setup Guide

## Overview

This guide will help you set up Vertex AI Vector Search for semantic search in Startegizer. The infrastructure code is already built - you just need to configure it in GCP.

## Prerequisites

- GCP Project with Vertex AI API enabled
- Vertex AI Vector Search API enabled
- Cloud Storage bucket (for batch indexing)
- Service account with appropriate permissions

## Step 1: Enable Required APIs

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable Vertex AI Vector Search API
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

## Step 2: Create Vector Search Index

### Option A: Using GCP Console

1. Go to **Vertex AI** → **Vector Search** → **Indexes**
2. Click **Create Index**
3. Configure:
   - **Index Name**: `startege-knowledge-base`
   - **Description**: "Knowledge base for Startegizer RAG"
   - **Region**: `us-central1` (or your preferred region)
   - **Embedding Dimensions**: `768` (for text-embedding-004)
   - **Distance Measure Type**: `Cosine Distance`
   - **Algorithm**: `Tree-AH` (default)
4. Click **Create**
5. **Note the Index ID** (you'll need this for `VECTOR_SEARCH_INDEX_ID`)

### Option B: Using gcloud CLI

```bash
# Create index
gcloud ai indexes create \
  --display-name="startege-knowledge-base" \
  --description="Knowledge base for Startegizer RAG" \
  --metadata-file=index-metadata.json \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID

# Note the index ID from the output
```

**Index Metadata** (`index-metadata.json`):
```json
{
  "contentsDeltaUri": "",
  "config": {
    "dimensions": 768,
    "approximateNeighborsCount": 10,
    "distanceMeasureType": "COSINE_DISTANCE",
    "algorithmConfig": {
      "treeAhConfig": {
        "leafNodeEmbeddingCount": 500,
        "leafNodesToSearchPercent": 10
      }
    }
  }
}
```

## Step 3: Create Index Endpoint

1. Go to **Vertex AI** → **Vector Search** → **Index Endpoints**
2. Click **Create Index Endpoint**
3. Configure:
   - **Endpoint Name**: `startege-vector-endpoint`
   - **Region**: Same as index (`us-central1`)
   - **Network**: Default VPC (or your VPC)
4. Click **Create**
5. **Note the Endpoint ID** (you'll need this for `VECTOR_SEARCH_ENDPOINT_ID`)

## Step 4: Deploy Index to Endpoint

1. In the **Index Endpoints** page, click on your endpoint
2. Click **Deploy Index**
3. Select your index (`startege-knowledge-base`)
4. Configure:
   - **Deployment ID**: `startege-knowledge-base-deployment` (or use index name)
   - **Machine Type**: `e2-standard-2` (or smaller for testing)
   - **Min Replica Count**: `1`
   - **Max Replica Count**: `1` (increase for production)
5. Click **Deploy**
6. **Note the Deployment ID** (you'll need this for `VECTOR_SEARCH_DEPLOYMENT_ID`)

**Wait for deployment** (this can take 10-30 minutes)

## Step 5: Set Environment Variables

Add these to your `.env.local` (development) and GitHub Secrets (production):

```bash
# Vector Search Configuration
VECTOR_SEARCH_INDEX_ID=your-index-id-here
VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id-here
VECTOR_SEARCH_DEPLOYMENT_ID=your-deployment-id-here

# GCP Configuration (if not already set)
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
```

## Step 6: Create Cloud Storage Bucket (for Batch Indexing)

```bash
# Create bucket for batch imports
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://startege-vector-imports

# Grant permissions to Vertex AI service account
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gsutil iam ch serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com:objectAdmin gs://startege-vector-imports
```

## Step 7: Generate Embeddings for Existing Content

### Backfill Market Scan Articles

```bash
# Make sure Cloud SQL Proxy is running if connecting locally
# PROXY_PORT=5436 npm run backfill-article-embeddings

# Or use the script directly
npx tsx scripts/backfill-article-embeddings.ts
```

### Backfill Standards

```bash
npx tsx scripts/backfill-standard-embeddings.ts
```

### Backfill All (Articles + Standards)

```bash
npx tsx scripts/backfill-all-embeddings.ts
```

## Step 8: Test Vector Search

```bash
# Test semantic search
npx tsx scripts/test-vector-search.ts

# Or test with a specific query
npx tsx scripts/test-semantic-search.ts "AI governance accountability"
```

## Step 9: Verify Integration

1. **Check logs**: Startegizer should now use semantic search
2. **Test queries**: Try queries that keyword search might miss
3. **Compare results**: Semantic search should return more relevant results

## Troubleshooting

### Error: "Vector Search not configured"
- Check environment variables are set correctly
- Verify `VECTOR_SEARCH_INDEX_ID` and `VECTOR_SEARCH_ENDPOINT_ID` are correct

### Error: "Index not found"
- Verify index ID matches the actual index in GCP
- Check index is deployed to the endpoint

### Error: "No results found"
- Check if embeddings have been generated
- Verify documents are indexed in Vector Search
- Check similarity threshold (try lowering `minSimilarity`)

### Error: "Permission denied"
- Verify service account has `aiplatform.indexes.get` permission
- Check Cloud Storage bucket permissions for batch imports

## Cost Monitoring

Monitor costs in GCP Console:
- **Vertex AI** → **Vector Search** → **Usage & Quotas**
- Set up billing alerts for unexpected costs

**Expected Costs**:
- Index Storage: ~$0.01/month (50-100 MB)
- Query Costs: ~$0.0002 per query
- Monthly Total: ~$0.25-0.50

## Next Steps

1. ✅ Set up Vector Search index and endpoint
2. ✅ Generate embeddings for existing content
3. ✅ Test semantic search
4. ✅ Monitor costs and performance
5. ✅ Update Market Scan to generate embeddings for new articles automatically

## Support

If you encounter issues:
1. Check GCP Console logs
2. Review Vector Search documentation
3. Test with `scripts/test-vector-search.ts`
4. Check environment variables are set correctly

